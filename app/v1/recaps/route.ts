import { generateGeminiRecap, GeminiUnavailableError } from '@/lib/server/gemini';
import { getRecapServerConfig } from '@/lib/server/recap-config';
import {
  InvalidRecapRequestError,
  parseRecapRequest,
} from '@/lib/server/recap-request';
import {
  consumeRateLimit,
  getRequestIp,
  hashRateLimitIdentity,
} from '@/lib/server/rate-limit';
import {
  hasActiveRevenueCatEntitlement,
  RevenueCatUnavailableError,
} from '@/lib/server/revenuecat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const IP_RATE_LIMIT = 12;
const CUSTOMER_RATE_LIMIT = 6;
const APP_USER_ID_HEADER = 'x-lately-revenuecat-user-id';

const responseHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers?: Record<string, string>,
) {
  return Response.json(body, {
    status,
    headers: { ...responseHeaders, ...headers },
  });
}

function rateLimitResponse(retryAfterSeconds: number, limit: number) {
  return jsonResponse(
    { error: 'Too many recap requests. Please try again later.' },
    429,
    {
      'Retry-After': String(retryAfterSeconds),
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': '0',
    },
  );
}

function getAppUserId(request: Request): string | null {
  const value = request.headers.get(APP_USER_ID_HEADER)?.trim();

  if (!value || value.length > 1_500 || /[\u0000-\u001f\u007f]/.test(value)) {
    return null;
  }

  return value;
}

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return jsonResponse({ error: 'Content-Type must be application/json.' }, 415);
  }

  const ipLimit = consumeRateLimit({
    key: `ip:${hashRateLimitIdentity(getRequestIp(request))}`,
    limit: IP_RATE_LIMIT,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!ipLimit.allowed) {
    return rateLimitResponse(ipLimit.retryAfterSeconds, ipLimit.limit);
  }

  const appUserId = getAppUserId(request);
  if (!appUserId) {
    return jsonResponse({ error: 'Subscription verification is required.' }, 401);
  }

  const customerLimit = consumeRateLimit({
    key: `customer:${hashRateLimitIdentity(appUserId)}`,
    limit: CUSTOMER_RATE_LIMIT,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!customerLimit.allowed) {
    return rateLimitResponse(customerLimit.retryAfterSeconds, customerLimit.limit);
  }

  let recapRequest: Awaited<ReturnType<typeof parseRecapRequest>>;

  try {
    recapRequest = await parseRecapRequest(request);
  } catch (error) {
    const message =
      error instanceof InvalidRecapRequestError ||
      (error instanceof Error && error.name === 'InvalidRecapRequestError')
        ? error.message
        : 'Invalid recap request.';

    return jsonResponse({ error: message }, 400);
  }

  try {
    const config = getRecapServerConfig();
    const hasEntitlement = await hasActiveRevenueCatEntitlement({
      appUserId,
      entitlementId: config.revenueCatEntitlementId,
      projectId: config.revenueCatProjectId,
      secretApiKey: config.revenueCatSecretApiKey,
    });

    if (!hasEntitlement) {
      return jsonResponse({ error: 'An active Lately subscription is required.' }, 403);
    }

    const recap = await generateGeminiRecap({
      apiKey: config.geminiApiKey,
      model: config.geminiModel,
      request: recapRequest,
    });

    return jsonResponse(
      { recap },
      200,
      {
        'X-RateLimit-Limit': String(customerLimit.limit),
        'X-RateLimit-Remaining': String(customerLimit.remaining),
      },
    );
  } catch (error) {
    if (error instanceof RevenueCatUnavailableError) {
      console.error('[recaps] RevenueCat verification failed:', error.message);
      return jsonResponse(
        { error: 'Subscription verification is temporarily unavailable.' },
        503,
      );
    }

    if (error instanceof GeminiUnavailableError) {
      console.error('[recaps] Gemini generation failed:', error.message);
      return jsonResponse(
        { error: 'The recap service is temporarily unavailable.' },
        502,
      );
    }

    console.error('[recaps] Unexpected server error.');
    return jsonResponse(
      { error: 'The recap service is temporarily unavailable.' },
      503,
    );
  }
}

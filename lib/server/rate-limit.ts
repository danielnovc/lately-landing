import 'server-only';

import { createHash } from 'node:crypto';

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

const MAX_BUCKETS = 5_000;

const globalRateLimitStore = globalThis as typeof globalThis & {
  latelyRecapRateLimitBuckets?: Map<string, RateLimitBucket>;
};

const buckets =
  globalRateLimitStore.latelyRecapRateLimitBuckets ??
  new Map<string, RateLimitBucket>();

globalRateLimitStore.latelyRecapRateLimitBuckets = buckets;

function pruneExpiredBuckets(now: number) {
  if (buckets.size < MAX_BUCKETS) {
    return;
  }

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function hashRateLimitIdentity(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function consumeRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const existing = buckets.get(key);
  const bucket =
    !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : existing;

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed: bucket.count <= limit,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000)),
  };
}

export function getRequestIp(request: Request): string {
  const cloudflareIp = request.headers.get('cf-connecting-ip')?.trim();
  const forwardedFor = request.headers.get('x-forwarded-for');
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim();

  return (
    cloudflareIp ||
    request.headers.get('x-real-ip')?.trim() ||
    firstForwardedIp ||
    'unknown'
  );
}

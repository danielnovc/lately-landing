import 'server-only';

type RevenueCatActiveEntitlement = {
  entitlement_id?: string;
  expires_at?: number | null;
};

type RevenueCatActiveEntitlementsResponse = {
  items?: RevenueCatActiveEntitlement[];
};

export class RevenueCatUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RevenueCatUnavailableError';
  }
}

export async function hasActiveRevenueCatEntitlement({
  appUserId,
  entitlementId,
  projectId,
  secretApiKey,
}: {
  appUserId: string;
  entitlementId: string;
  projectId: string;
  secretApiKey: string;
}): Promise<boolean> {
  let response: Response;

  try {
    response = await fetch(
      `https://api.revenuecat.com/v2/projects/${encodeURIComponent(projectId)}/customers/${encodeURIComponent(appUserId)}/active_entitlements?limit=100`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${secretApiKey}`,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    throw new RevenueCatUnavailableError('RevenueCat request failed.');
  }

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new RevenueCatUnavailableError(
      `RevenueCat returned status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as RevenueCatActiveEntitlementsResponse;

  return Boolean(
    payload.items?.some(
      (entitlement) =>
        entitlement.entitlement_id === entitlementId &&
        (entitlement.expires_at == null || entitlement.expires_at > Date.now()),
    ),
  );
}

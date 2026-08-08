import 'server-only';

export type RecapServerConfig = {
  geminiApiKey: string;
  geminiModel: string;
  revenueCatSecretApiKey: string;
  revenueCatProjectId: string;
  revenueCatEntitlementId: string;
};

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing server environment variable: ${name}`);
  }

  return value;
}

export function getRecapServerConfig(): RecapServerConfig {
  const geminiModel = (process.env.GEMINI_MODEL ?? 'gemini-2.5-flash').trim();

  if (!/^[a-zA-Z0-9._-]+$/.test(geminiModel)) {
    throw new Error('GEMINI_MODEL contains unsupported characters.');
  }

  return {
    geminiApiKey: requireEnvironmentVariable('GEMINI_API_KEY'),
    geminiModel,
    revenueCatSecretApiKey: requireEnvironmentVariable(
      'REVENUECAT_V2_SECRET_API_KEY',
    ),
    revenueCatProjectId: requireEnvironmentVariable('REVENUECAT_PROJECT_ID'),
    revenueCatEntitlementId: requireEnvironmentVariable(
      'REVENUECAT_ENTITLEMENT_ID',
    ),
  };
}

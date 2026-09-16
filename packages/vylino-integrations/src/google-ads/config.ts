import type { GoogleAdsConnectionConfig } from './types';

export const GOOGLE_ADS_DEFAULT_ENV_KEYS = {
  developerTokenEnvKey: 'GOOGLE_ADS_DEVELOPER_TOKEN',
  clientIdEnvKey: 'GOOGLE_ADS_CLIENT_ID',
  clientSecretEnvKey: 'GOOGLE_ADS_CLIENT_SECRET',
  refreshTokenEnvKey: 'GOOGLE_ADS_REFRESH_TOKEN',
} as const;

export const buildGoogleAdsConnectionConfig = (
  input: Pick<GoogleAdsConnectionConfig, 'customerId' | 'loginCustomerId'> &
    Partial<Omit<GoogleAdsConnectionConfig, 'customerId' | 'loginCustomerId'>>,
): GoogleAdsConnectionConfig => ({
  customerId: input.customerId.replace(/-/g, ''),
  loginCustomerId: input.loginCustomerId?.replace(/-/g, ''),
  developerTokenEnvKey:
    input.developerTokenEnvKey ?? GOOGLE_ADS_DEFAULT_ENV_KEYS.developerTokenEnvKey,
  clientIdEnvKey:
    input.clientIdEnvKey ?? GOOGLE_ADS_DEFAULT_ENV_KEYS.clientIdEnvKey,
  clientSecretEnvKey:
    input.clientSecretEnvKey ?? GOOGLE_ADS_DEFAULT_ENV_KEYS.clientSecretEnvKey,
  refreshTokenEnvKey:
    input.refreshTokenEnvKey ?? GOOGLE_ADS_DEFAULT_ENV_KEYS.refreshTokenEnvKey,
});

export type MetaAdsConfig = {
  appIdEnvKey: 'META_APP_ID';
  appSecretEnvKey: 'META_APP_SECRET';
  accessTokenEnvKey: 'META_ACCESS_TOKEN';
  adAccountIdEnvKey: 'META_AD_ACCOUNT_ID';
  graphApiVersionEnvKey: 'META_GRAPH_API_VERSION';
};

export const metaAdsConfig: MetaAdsConfig = {
  appIdEnvKey: 'META_APP_ID',
  appSecretEnvKey: 'META_APP_SECRET',
  accessTokenEnvKey: 'META_ACCESS_TOKEN',
  adAccountIdEnvKey: 'META_AD_ACCOUNT_ID',
  graphApiVersionEnvKey: 'META_GRAPH_API_VERSION',
};

export const normalizeMetaAdAccountId = (value: string): string =>
  value.startsWith('act_') ? value : `act_${value}`;

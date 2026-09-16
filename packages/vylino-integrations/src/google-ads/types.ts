export type GoogleAdsConnectionConfig = {
  customerId: string;
  loginCustomerId?: string;
  developerTokenEnvKey: string;
  clientIdEnvKey: string;
  clientSecretEnvKey: string;
  refreshTokenEnvKey: string;
};

export type GoogleAdsAccount = {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  manager: boolean;
  testAccount: boolean;
};

export type GoogleAdsCampaignStatus =
  | 'ENABLED'
  | 'PAUSED'
  | 'REMOVED'
  | 'UNKNOWN'
  | 'UNSPECIFIED';

export type GoogleAdsCampaign = {
  id: string;
  customerId: string;
  name: string;
  status: GoogleAdsCampaignStatus;
  advertisingChannelType?: string;
  startDate?: string;
  endDate?: string;
};

export type GoogleAdsDailyMetrics = {
  customerId: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
  conversionValue: number;
};

export type GoogleAdsNormalizedRecord =
  | { kind: 'account'; data: GoogleAdsAccount }
  | { kind: 'campaign'; data: GoogleAdsCampaign }
  | { kind: 'daily_metrics'; data: GoogleAdsDailyMetrics };

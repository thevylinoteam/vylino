export type MetaAdAccount = {
  id: string;
  name: string;
  accountId: string;
  currency?: string;
  timezoneName?: string;
  status?: number;
};

export type MetaCampaign = {
  id: string;
  accountId: string;
  name: string;
  objective?: string;
  status?: string;
  effectiveStatus?: string;
  buyingType?: string;
  createdTime?: string;
  updatedTime?: string;
};

export type MetaAdSet = {
  id: string;
  campaignId: string;
  accountId: string;
  name: string;
  status?: string;
  effectiveStatus?: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  optimizationGoal?: string;
  billingEvent?: string;
  startTime?: string;
  endTime?: string;
};

export type MetaAd = {
  id: string;
  adSetId: string;
  campaignId: string;
  accountId: string;
  name: string;
  status?: string;
  effectiveStatus?: string;
  creativeId?: string;
};

export type MetaInsightMetrics = {
  accountId: string;
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  dateStart: string;
  dateStop: string;
  impressions: number;
  reach?: number;
  clicks?: number;
  inlineLinkClicks?: number;
  spend: number;
  cpm?: number;
  cpc?: number;
  ctr?: number;
  conversions?: number;
  leads?: number;
  purchases?: number;
  purchaseValue?: number;
};

export type MetaAdsRecord =
  | { kind: 'account'; data: MetaAdAccount }
  | { kind: 'campaign'; data: MetaCampaign }
  | { kind: 'adset'; data: MetaAdSet }
  | { kind: 'ad'; data: MetaAd }
  | { kind: 'insight'; data: MetaInsightMetrics };

import type { VylinoIntegrationProvider } from '../types';

export type MarketingChannel = 'google_ads' | 'meta_ads' | 'organic' | 'social' | 'direct' | 'referral' | 'other';

export type MarketingMetricRecord = {
  provider: VylinoIntegrationProvider;
  channel: MarketingChannel;
  accountId: string;
  campaignId?: string;
  campaignName?: string;
  date: string;
  currency?: string;
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
  qualifiedLeads?: number;
  customers?: number;
  conversions?: number;
  revenue?: number;
};

export type MarketingKpis = {
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
  qualifiedLeads: number;
  customers: number;
  conversions: number;
  revenue: number;
  ctr: number | null;
  cpc: number | null;
  cpl: number | null;
  cac: number | null;
  roas: number | null;
  leadToCustomerRate: number | null;
};

export type MarketingBreakdown = {
  key: string;
  label: string;
  kpis: MarketingKpis;
};

export type MarketingDashboardSummary = {
  generatedAt: string;
  from?: string;
  to?: string;
  currency?: string;
  overall: MarketingKpis;
  byProvider: MarketingBreakdown[];
  byCampaign: MarketingBreakdown[];
  byDay: MarketingBreakdown[];
};

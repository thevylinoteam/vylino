import type { GoogleAdsDailyMetrics } from '../google-ads/types';
import type { MetaInsightMetrics } from '../meta-ads/types';
import type { MarketingMetricRecord } from './types';

export const mapGoogleAdsMetric = (
  metric: GoogleAdsDailyMetrics,
  options?: {
    campaignName?: string;
    currency?: string;
    customers?: number;
  },
): MarketingMetricRecord => ({
  provider: 'google_ads',
  channel: 'google_ads',
  accountId: metric.customerId,
  campaignId: metric.campaignId,
  campaignName: options?.campaignName,
  date: metric.date,
  currency: options?.currency,
  impressions: metric.impressions,
  clicks: metric.clicks,
  spend: metric.costMicros / 1_000_000,
  leads: metric.conversions,
  customers: options?.customers,
  conversions: metric.conversions,
  revenue: metric.conversionValue,
});

export const mapMetaAdsInsight = (
  insight: MetaInsightMetrics,
  options?: {
    campaignName?: string;
    currency?: string;
  },
): MarketingMetricRecord => ({
  provider: 'meta_ads',
  channel: 'meta_ads',
  accountId: insight.accountId,
  campaignId: insight.campaignId,
  campaignName: options?.campaignName,
  date: insight.dateStart,
  currency: options?.currency,
  impressions: insight.impressions,
  clicks: insight.clicks ?? 0,
  spend: insight.spend,
  leads: insight.leads ?? 0,
  customers: insight.purchases ?? 0,
  conversions: insight.conversions ?? insight.purchases ?? 0,
  revenue: insight.purchaseValue ?? 0,
});

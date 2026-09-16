import type { GoogleAdsDailyMetric } from '../google-ads/types';
import type { MetaAdsInsight } from '../meta-ads/types';
import { getMetaActionValue } from '../meta-ads/metrics';
import type { MarketingMetricRecord } from './types';

export const mapGoogleAdsMetric = (
  metric: GoogleAdsDailyMetric,
): MarketingMetricRecord => ({
  provider: 'google_ads',
  channel: 'google_ads',
  accountId: metric.customerId,
  campaignId: metric.campaignId,
  campaignName: metric.campaignName,
  date: metric.date,
  currency: metric.currencyCode,
  impressions: metric.impressions,
  clicks: metric.clicks,
  spend: metric.cost,
  leads: metric.conversions,
  conversions: metric.conversions,
  revenue: metric.conversionValue,
});

export const mapMetaAdsInsight = (
  insight: MetaAdsInsight,
): MarketingMetricRecord => {
  const leads = getMetaActionValue(insight.actions, [
    'lead',
    'onsite_conversion.lead_grouped',
  ]);
  const purchases = getMetaActionValue(insight.actions, [
    'purchase',
    'offsite_conversion.fb_pixel_purchase',
  ]);
  const purchaseValue = getMetaActionValue(insight.actionValues, [
    'purchase',
    'offsite_conversion.fb_pixel_purchase',
  ]);

  return {
    provider: 'meta_ads',
    channel: 'meta_ads',
    accountId: insight.accountId,
    campaignId: insight.campaignId,
    campaignName: insight.campaignName,
    date: insight.dateStart,
    currency: insight.currency,
    impressions: insight.impressions,
    clicks: insight.clicks,
    spend: insight.spend,
    leads,
    customers: purchases,
    conversions: insight.conversions ?? purchases,
    revenue: purchaseValue,
  };
};

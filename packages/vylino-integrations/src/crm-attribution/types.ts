import type { MarketingProvider } from '../marketing/types';

export type AttributionTouchpoint = {
  id: string;
  leadId: string;
  occurredAt: string;
  provider?: MarketingProvider;
  source?: string;
  medium?: string;
  campaignId?: string;
  campaignName?: string;
  adGroupId?: string;
  adSetId?: string;
  adId?: string;
  keyword?: string;
  landingPage?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

export type CrmRevenueEvent = {
  id: string;
  leadId: string;
  opportunityId?: string;
  customerId?: string;
  occurredAt: string;
  status: 'qualified' | 'won' | 'paid';
  revenue: number;
  currency?: string;
};

export type AttributionModel = 'first_touch' | 'last_touch' | 'linear';

export type RevenueAttribution = {
  revenueEventId: string;
  leadId: string;
  touchpointId: string;
  model: AttributionModel;
  credit: number;
  attributedRevenue: number;
  provider?: MarketingProvider;
  campaignId?: string;
  campaignName?: string;
};

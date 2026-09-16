import { buildMarketingDashboardSummary } from './aggregate';
import type { MarketingKpis, MarketingMetricRecord } from './types';

export type TwentyMarketingSnapshotPeriod =
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'MONTH_TO_DATE'
  | 'ALL_TIME'
  | 'DAILY'
  | 'CUSTOM';

export type TwentyMarketingSnapshotProvider =
  | 'ALL'
  | 'GOOGLE_ADS'
  | 'META_ADS'
  | 'ORGANIC'
  | 'SOCIAL'
  | 'OTHER';

export type TwentyMarketingSnapshot = {
  snapshotKey: string;
  provider: TwentyMarketingSnapshotProvider;
  period: TwentyMarketingSnapshotPeriod;
  scope: 'ACCOUNT' | 'CAMPAIGN';
  periodStart?: string;
  periodEnd?: string;
  externalCampaignId?: string;
  campaignName?: string;
  currencyCode?: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  customers: number;
  revenue: number;
  syncedAt: string;
};

const normalizeProvider = (provider?: string): TwentyMarketingSnapshotProvider => {
  switch (provider) {
    case 'google_ads':
      return 'GOOGLE_ADS';
    case 'meta_ads':
      return 'META_ADS';
    case 'organic':
      return 'ORGANIC';
    case 'social':
    case 'postiz':
      return 'SOCIAL';
    default:
      return 'OTHER';
  }
};

const toSnapshotTotals = (kpis: MarketingKpis) => ({
  spend: kpis.spend,
  impressions: kpis.impressions,
  clicks: kpis.clicks,
  leads: kpis.leads,
  qualifiedLeads: kpis.qualifiedLeads,
  customers: kpis.customers,
  revenue: kpis.revenue,
});

const asIsoDateTime = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

export const buildTwentyMarketingSnapshots = (
  records: MarketingMetricRecord[],
  period: TwentyMarketingSnapshotPeriod,
  range?: { from?: string; to?: string },
): TwentyMarketingSnapshot[] => {
  const summary = buildMarketingDashboardSummary(records, range);
  const syncedAt = summary.generatedAt;
  const common = {
    period,
    periodStart: asIsoDateTime(summary.from),
    periodEnd: asIsoDateTime(summary.to),
    currencyCode: summary.currency,
    syncedAt,
  } as const;

  const snapshots: TwentyMarketingSnapshot[] = [
    {
      snapshotKey: `ALL:${period}:ACCOUNT`,
      provider: 'ALL',
      scope: 'ACCOUNT',
      ...common,
      ...toSnapshotTotals(summary.overall),
    },
  ];

  for (const provider of summary.byProvider) {
    const normalizedProvider = normalizeProvider(provider.key);
    snapshots.push({
      snapshotKey: `${normalizedProvider}:${period}:ACCOUNT`,
      provider: normalizedProvider,
      scope: 'ACCOUNT',
      ...common,
      ...toSnapshotTotals(provider.kpis),
    });
  }

  for (const campaign of summary.byCampaign) {
    const separator = campaign.key.indexOf(':');
    const rawProvider = separator >= 0 ? campaign.key.slice(0, separator) : '';
    const campaignId = separator >= 0 ? campaign.key.slice(separator + 1) : campaign.key;
    const normalizedProvider = normalizeProvider(rawProvider);

    snapshots.push({
      snapshotKey: `${normalizedProvider}:${period}:CAMPAIGN:${campaignId}`,
      provider: normalizedProvider,
      scope: 'CAMPAIGN',
      externalCampaignId: campaignId,
      campaignName: campaign.label,
      ...common,
      ...toSnapshotTotals(campaign.kpis),
    });
  }

  return snapshots;
};

export const publishTwentyMarketingSnapshots = async (input: {
  baseUrl: string;
  sharedSecret: string;
  snapshots: TwentyMarketingSnapshot[];
  fetchImpl?: typeof fetch;
}) => {
  const fetchImpl = input.fetchImpl ?? fetch;
  const baseUrl = input.baseUrl.replace(/\/$/, '');
  const response = await fetchImpl(`${baseUrl}/rest/vylino/marketing/snapshots`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-vylino-ingest-key': input.sharedSecret,
    },
    body: JSON.stringify({
      version: '2026-09-16',
      snapshots: input.snapshots,
    }),
  });

  const body = (await response.json()) as {
    ok?: boolean;
    processed?: number;
    created?: number;
    updated?: number;
    error?: string;
    message?: string;
  };

  if (!response.ok || !body.ok) {
    throw new Error(
      body.message ?? body.error ?? `Twenty marketing snapshot publish failed with ${response.status}`,
    );
  }

  return body;
};

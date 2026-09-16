import type {
  MarketingBreakdown,
  MarketingDashboardSummary,
  MarketingKpis,
  MarketingMetricRecord,
} from './types';

const safeDivide = (numerator: number, denominator: number): number | null =>
  denominator > 0 ? numerator / denominator : null;

export const calculateMarketingKpis = (
  records: MarketingMetricRecord[],
): MarketingKpis => {
  const totals = records.reduce(
    (acc, record) => ({
      impressions: acc.impressions + record.impressions,
      clicks: acc.clicks + record.clicks,
      spend: acc.spend + record.spend,
      leads: acc.leads + record.leads,
      qualifiedLeads: acc.qualifiedLeads + (record.qualifiedLeads ?? 0),
      customers: acc.customers + (record.customers ?? 0),
      conversions: acc.conversions + (record.conversions ?? 0),
      revenue: acc.revenue + (record.revenue ?? 0),
    }),
    {
      impressions: 0,
      clicks: 0,
      spend: 0,
      leads: 0,
      qualifiedLeads: 0,
      customers: 0,
      conversions: 0,
      revenue: 0,
    },
  );

  return {
    ...totals,
    ctr: safeDivide(totals.clicks, totals.impressions),
    cpc: safeDivide(totals.spend, totals.clicks),
    cpl: safeDivide(totals.spend, totals.leads),
    cac: safeDivide(totals.spend, totals.customers),
    roas: safeDivide(totals.revenue, totals.spend),
    leadToCustomerRate: safeDivide(totals.customers, totals.leads),
  };
};

const groupRecords = (
  records: MarketingMetricRecord[],
  getKey: (record: MarketingMetricRecord) => string,
  getLabel: (record: MarketingMetricRecord) => string,
): MarketingBreakdown[] => {
  const groups = new Map<string, { label: string; records: MarketingMetricRecord[] }>();

  for (const record of records) {
    const key = getKey(record);
    const existing = groups.get(key);
    if (existing) {
      existing.records.push(record);
    } else {
      groups.set(key, { label: getLabel(record), records: [record] });
    }
  }

  return [...groups.entries()].map(([key, group]) => ({
    key,
    label: group.label,
    kpis: calculateMarketingKpis(group.records),
  }));
};

export const buildMarketingDashboardSummary = (
  records: MarketingMetricRecord[],
  range?: { from?: string; to?: string },
): MarketingDashboardSummary => ({
  generatedAt: new Date().toISOString(),
  from: range?.from,
  to: range?.to,
  currency: records.find((record) => record.currency)?.currency,
  overall: calculateMarketingKpis(records),
  byProvider: groupRecords(records, (record) => record.provider, (record) => record.provider),
  byCampaign: groupRecords(
    records.filter((record) => record.campaignId),
    (record) => `${record.provider}:${record.campaignId}`,
    (record) => record.campaignName ?? record.campaignId ?? 'Unknown campaign',
  ),
  byDay: groupRecords(records, (record) => record.date, (record) => record.date),
});

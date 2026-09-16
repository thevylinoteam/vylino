import type { MarketingDashboardSummary } from './types';

export type MarketingDashboardCard = {
  key: 'spend' | 'leads' | 'customers' | 'revenue' | 'cpl' | 'cac' | 'roas';
  label: string;
  value: number | null;
};

export const buildMarketingDashboardCards = (
  summary: MarketingDashboardSummary,
): MarketingDashboardCard[] => [
  { key: 'spend', label: 'Spend', value: summary.overall.spend },
  { key: 'leads', label: 'Leads', value: summary.overall.leads },
  { key: 'customers', label: 'Customers', value: summary.overall.customers },
  { key: 'revenue', label: 'Revenue', value: summary.overall.revenue },
  { key: 'cpl', label: 'CPL', value: summary.overall.cpl },
  { key: 'cac', label: 'CAC', value: summary.overall.cac },
  { key: 'roas', label: 'ROAS', value: summary.overall.roas },
];

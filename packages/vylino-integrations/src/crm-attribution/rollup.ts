import type { RevenueAttribution } from './types';

export type CampaignRevenueRollup = {
  provider?: RevenueAttribution['provider'];
  campaignId?: string;
  campaignName?: string;
  attributedRevenue: number;
  conversions: number;
};

export const rollupAttributedRevenueByCampaign = (
  attributions: RevenueAttribution[],
): CampaignRevenueRollup[] => {
  const grouped = new Map<string, CampaignRevenueRollup>();

  for (const attribution of attributions) {
    const key = [
      attribution.provider ?? 'unknown',
      attribution.campaignId ?? 'unknown',
      attribution.campaignName ?? 'unknown',
    ].join(':');

    const current = grouped.get(key) ?? {
      provider: attribution.provider,
      campaignId: attribution.campaignId,
      campaignName: attribution.campaignName,
      attributedRevenue: 0,
      conversions: 0,
    };

    current.attributedRevenue += attribution.attributedRevenue;
    current.conversions += attribution.credit;
    grouped.set(key, current);
  }

  return [...grouped.values()];
};

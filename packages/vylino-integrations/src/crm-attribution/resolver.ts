import type {
  AttributionModel,
  AttributionTouchpoint,
  CrmRevenueEvent,
  RevenueAttribution,
} from './types';

const byOccurredAt = (a: AttributionTouchpoint, b: AttributionTouchpoint) =>
  new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();

const eligibleTouchpoints = (
  revenueEvent: CrmRevenueEvent,
  touchpoints: AttributionTouchpoint[],
) =>
  touchpoints
    .filter(
      (touchpoint) =>
        touchpoint.leadId === revenueEvent.leadId &&
        new Date(touchpoint.occurredAt).getTime() <=
          new Date(revenueEvent.occurredAt).getTime(),
    )
    .sort(byOccurredAt);

export const resolveRevenueAttribution = (
  revenueEvent: CrmRevenueEvent,
  touchpoints: AttributionTouchpoint[],
  model: AttributionModel = 'last_touch',
): RevenueAttribution[] => {
  const eligible = eligibleTouchpoints(revenueEvent, touchpoints);

  if (eligible.length === 0) return [];

  if (model === 'first_touch') {
    const touchpoint = eligible[0];

    return [
      {
        revenueEventId: revenueEvent.id,
        leadId: revenueEvent.leadId,
        touchpointId: touchpoint.id,
        model,
        credit: 1,
        attributedRevenue: revenueEvent.revenue,
        provider: touchpoint.provider,
        campaignId: touchpoint.campaignId,
        campaignName: touchpoint.campaignName,
      },
    ];
  }

  if (model === 'last_touch') {
    const touchpoint = eligible[eligible.length - 1];

    return [
      {
        revenueEventId: revenueEvent.id,
        leadId: revenueEvent.leadId,
        touchpointId: touchpoint.id,
        model,
        credit: 1,
        attributedRevenue: revenueEvent.revenue,
        provider: touchpoint.provider,
        campaignId: touchpoint.campaignId,
        campaignName: touchpoint.campaignName,
      },
    ];
  }

  const credit = 1 / eligible.length;

  return eligible.map((touchpoint) => ({
    revenueEventId: revenueEvent.id,
    leadId: revenueEvent.leadId,
    touchpointId: touchpoint.id,
    model,
    credit,
    attributedRevenue: revenueEvent.revenue * credit,
    provider: touchpoint.provider,
    campaignId: touchpoint.campaignId,
    campaignName: touchpoint.campaignName,
  }));
};

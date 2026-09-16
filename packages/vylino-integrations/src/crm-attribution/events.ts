import type { VylinoAutomationEvent } from '../n8n/types';
import { createAutomationEvent } from '../n8n/events';
import type { CrmRevenueEvent, RevenueAttribution } from './types';

export const buildRevenueAttributedEvent = (
  revenueEvent: CrmRevenueEvent,
  attributions: RevenueAttribution[],
): VylinoAutomationEvent =>
  createAutomationEvent({
    id: `crm-revenue-attributed:${revenueEvent.id}`,
    name: 'crm.revenue_attributed',
    correlationId: revenueEvent.opportunityId ?? revenueEvent.leadId,
    occurredAt: revenueEvent.occurredAt,
    payload: {
      revenueEvent,
      attributions,
    },
  });

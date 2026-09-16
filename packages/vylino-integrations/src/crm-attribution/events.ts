import type { VylinoAutomationEvent } from '../n8n/types';
import { buildAutomationEvent } from '../n8n/events';
import type { CrmRevenueEvent, RevenueAttribution } from './types';

export const buildRevenueAttributedEvent = (
  revenueEvent: CrmRevenueEvent,
  attributions: RevenueAttribution[],
): VylinoAutomationEvent =>
  buildAutomationEvent({
    type: 'crm.revenue_attributed',
    entityType: 'lead',
    entityId: revenueEvent.leadId,
    occurredAt: revenueEvent.occurredAt,
    payload: {
      revenueEvent,
      attributions,
    },
  });

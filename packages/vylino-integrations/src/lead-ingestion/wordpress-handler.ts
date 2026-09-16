import { inferLeadSource } from '../lead-capture/capture';
import { createAutomationEvent } from '../n8n/events';
import type { LeadAutomationPayload } from '../n8n/types';
import { persistLeadToTwenty } from '../twenty-crm/persistence';
import type { TwentyCrmTransport } from '../twenty-crm/transport';
import type {
  LeadAutomationEmitter,
  LeadIngestionIdempotencyStore,
  LeadIngestionResult,
  WordPressLeadIngestionInput,
} from './types';

const validateRequest = (input: WordPressLeadIngestionInput) => {
  const { request } = input;

  if (request.event !== 'lead.submitted') {
    throw new Error(`Unsupported lead ingestion event: ${request.event}`);
  }

  if (!request.idempotencyKey?.trim()) {
    throw new Error('Lead ingestion request is missing an idempotency key');
  }

  const lead = request.payload.lead;
  if (!lead.identity.email && !lead.identity.phone && !lead.identity.name) {
    throw new Error('Lead must include at least a name, email, or phone number');
  }
};

const buildLeadAutomationPayload = (
  input: WordPressLeadIngestionInput,
  personId: string,
): LeadAutomationPayload => {
  const lead = input.request.payload.lead;

  return {
    leadId: personId,
    name: lead.identity.name,
    email: lead.identity.email,
    phone: lead.identity.phone,
    source: inferLeadSource(lead),
    campaign: lead.attribution.campaign,
    landingPage: lead.attribution.landingPage ?? lead.sourceUrl,
  };
};

export const ingestWordPressLead = async (dependencies: {
  crm: TwentyCrmTransport;
  idempotencyStore: LeadIngestionIdempotencyStore;
  automation?: LeadAutomationEmitter;
}, input: WordPressLeadIngestionInput): Promise<LeadIngestionResult> => {
  const { request } = input;

  try {
    validateRequest(input);

    const claimed = await dependencies.idempotencyStore.claim(
      request.idempotencyKey,
    );

    if (!claimed) {
      return {
        status: 'duplicate',
        idempotencyKey: request.idempotencyKey,
      };
    }

    try {
      const persistence = await persistLeadToTwenty(
        dependencies.crm,
        request.payload.lead,
        {
          createOpportunity: input.createOpportunity,
          opportunityAmount: input.opportunityAmount,
          opportunityCurrencyCode: input.opportunityCurrencyCode,
          opportunityStage: input.opportunityStage,
          companyName: input.companyName,
        },
      );

      await dependencies.idempotencyStore.complete(request.idempotencyKey);

      const eventName = persistence.personCreated
        ? 'lead.created'
        : 'lead.updated';

      const automationEvent = createAutomationEvent({
        id: `${request.idempotencyKey}:${eventName}`,
        name: eventName,
        occurredAt: request.sentAt,
        workspaceId: input.workspaceId,
        correlationId: request.idempotencyKey,
        idempotencyKey: `${request.idempotencyKey}:${eventName}`,
        payload: buildLeadAutomationPayload(input, persistence.personId),
      });

      let automationDelivered: boolean | undefined;

      if (dependencies.automation) {
        const delivery = await dependencies.automation.emit(automationEvent);
        automationDelivered = delivery.ok;
      }

      return {
        status: 'processed',
        idempotencyKey: request.idempotencyKey,
        persistence,
        automationEvent,
        automationDelivered,
      };
    } catch (error) {
      await dependencies.idempotencyStore.release(request.idempotencyKey);
      throw error;
    }
  } catch (error) {
    return {
      status: 'failed',
      idempotencyKey: request.idempotencyKey,
      error: error instanceof Error ? error.message : 'Lead ingestion failed',
    };
  }
};

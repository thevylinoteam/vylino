import type { LeadAutomationEmitter } from '../lead-ingestion/types';
import { ingestWordPressLead } from '../lead-ingestion/wordpress-handler';
import type { TwentyCrmTransport } from '../twenty-crm/transport';
import type { WordPressLeadWebhookRequest } from '../wordpress/webhook-contract';
import type { LeadIngestionIdempotencyStore } from '../lead-ingestion/types';

export type VylinoLeadIngestionEndpointConfig = {
  sharedSecret: string;
  workspaceId?: string;
  createOpportunity?: boolean;
  opportunityStage?: string;
  opportunityAmount?: number;
  opportunityCurrencyCode?: string;
  companyName?: string;
};

export type VylinoLeadIngestionHttpRequest = {
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type VylinoLeadIngestionHttpResponse = {
  status: number;
  body: Record<string, unknown>;
};

const getHeader = (
  headers: VylinoLeadIngestionHttpRequest['headers'],
  name: string,
): string | undefined => {
  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  )?.[1];

  return Array.isArray(entry) ? entry[0] : entry;
};

const timingSafeEqualText = (left: string, right: string) => {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
};

const isWebhookRequest = (body: unknown): body is WordPressLeadWebhookRequest => {
  if (!body || typeof body !== 'object') return false;

  const candidate = body as Partial<WordPressLeadWebhookRequest>;

  return (
    candidate.event === 'lead.submitted' &&
    typeof candidate.idempotencyKey === 'string' &&
    typeof candidate.sentAt === 'string' &&
    Boolean(candidate.payload)
  );
};

export const handleVylinoLeadIngestionHttpRequest = async (
  dependencies: {
    crm: TwentyCrmTransport;
    idempotencyStore: LeadIngestionIdempotencyStore;
    automation?: LeadAutomationEmitter;
  },
  config: VylinoLeadIngestionEndpointConfig,
  request: VylinoLeadIngestionHttpRequest,
): Promise<VylinoLeadIngestionHttpResponse> => {
  if (request.method.toUpperCase() !== 'POST') {
    return {
      status: 405,
      body: { ok: false, error: 'method_not_allowed' },
    };
  }

  const suppliedSecret = getHeader(request.headers, 'x-vylino-ingest-key');
  if (
    !suppliedSecret ||
    !timingSafeEqualText(suppliedSecret, config.sharedSecret)
  ) {
    return {
      status: 401,
      body: { ok: false, error: 'unauthorized' },
    };
  }

  if (!isWebhookRequest(request.body)) {
    return {
      status: 400,
      body: { ok: false, error: 'invalid_payload' },
    };
  }

  const result = await ingestWordPressLead(dependencies, {
    request: request.body,
    workspaceId: config.workspaceId,
    createOpportunity: config.createOpportunity,
    opportunityStage: config.opportunityStage,
    opportunityAmount: config.opportunityAmount,
    opportunityCurrencyCode: config.opportunityCurrencyCode,
    companyName: config.companyName,
  });

  if (result.status === 'failed') {
    return {
      status: 500,
      body: {
        ok: false,
        error: 'lead_ingestion_failed',
        message: result.error,
        idempotencyKey: result.idempotencyKey,
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      duplicate: result.status === 'duplicate',
      idempotencyKey: result.idempotencyKey,
      persistence: result.persistence,
      automationDelivered: result.automationDelivered,
    },
  };
};

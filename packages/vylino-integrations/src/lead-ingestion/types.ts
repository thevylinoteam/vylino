import type { VylinoAutomationEvent } from '../n8n/types';
import type { TwentyLeadPersistenceResult } from '../twenty-crm/types';
import type { WordPressLeadWebhookRequest } from '../wordpress/webhook-contract';

export type LeadIngestionStatus =
  | 'processed'
  | 'duplicate'
  | 'failed';

export type LeadIngestionResult = {
  status: LeadIngestionStatus;
  idempotencyKey: string;
  persistence?: TwentyLeadPersistenceResult;
  automationEvent?: VylinoAutomationEvent;
  automationDelivered?: boolean;
  error?: string;
};

export interface LeadIngestionIdempotencyStore {
  has(key: string): Promise<boolean>;
  claim(key: string, ttlSeconds?: number): Promise<boolean>;
  complete(key: string): Promise<void>;
  release(key: string): Promise<void>;
}

export interface LeadAutomationEmitter {
  emit(event: VylinoAutomationEvent): Promise<{
    ok: boolean;
    status: number;
  }>;
}

export type WordPressLeadIngestionInput = {
  request: WordPressLeadWebhookRequest;
  workspaceId?: string;
  createOpportunity?: boolean;
  opportunityStage?: string;
  opportunityAmount?: number;
  opportunityCurrencyCode?: string;
  companyName?: string;
};

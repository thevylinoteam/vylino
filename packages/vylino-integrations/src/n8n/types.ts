export type VylinoAutomationEventName =
  | 'lead.created'
  | 'lead.updated'
  | 'lead.qualified'
  | 'opportunity.won'
  | 'opportunity.lost'
  | 'project.created'
  | 'crm.revenue_attributed'
  | 'ads.google.sync.completed'
  | 'ads.meta.sync.completed'
  | 'social.post.scheduled'
  | 'social.post.published'
  | 'social.post.failed';

export type VylinoAutomationEvent<TPayload = Record<string, unknown>> = {
  id: string;
  name: VylinoAutomationEventName;
  occurredAt: string;
  source: 'vylino';
  workspaceId?: string;
  correlationId?: string;
  idempotencyKey: string;
  payload: TPayload;
};

export type VylinoWebhookDelivery = {
  eventId: string;
  eventName: VylinoAutomationEventName;
  attempt: number;
  maxAttempts: number;
  status: 'queued' | 'delivering' | 'delivered' | 'failed' | 'dead_lettered';
  nextAttemptAt?: string;
  lastAttemptAt?: string;
  lastStatusCode?: number;
  lastError?: string;
};

export type LeadAutomationPayload = {
  leadId: string;
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  campaign?: string;
  landingPage?: string;
  estimatedValue?: number;
  assignedTo?: string;
};

export type AdsSyncAutomationPayload = {
  provider: 'google_ads' | 'meta_ads';
  accountId: string;
  startedAt?: string;
  completedAt: string;
  recordsSynced: number;
  cursor?: string;
};

export type SocialPostAutomationPayload = {
  postId: string;
  platform?: string;
  accountId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  externalPostId?: string;
  error?: string;
};

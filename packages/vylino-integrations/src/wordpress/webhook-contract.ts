import type { WordPressLeadWebhookPayload } from './types';

export type WordPressLeadWebhookRequest = {
  event: 'lead.submitted';
  version: '2026-09-16';
  sentAt: string;
  idempotencyKey: string;
  payload: WordPressLeadWebhookPayload;
};

export type WordPressLeadWebhookResponse = {
  accepted: boolean;
  leadId?: string;
  duplicate?: boolean;
  message?: string;
};

const hash = (value: string): string => {
  let result = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }

  return (result >>> 0).toString(16).padStart(8, '0');
};

export const createWordPressLeadIdempotencyKey = (
  payload: WordPressLeadWebhookPayload,
): string => {
  const fingerprint = JSON.stringify({
    formId: payload.submission.formId,
    submittedAt: payload.submission.submittedAt,
    email: payload.lead.identity.email,
    phone: payload.lead.identity.phone,
    sourceUrl: payload.lead.sourceUrl,
  });

  return `vylino:wordpress:lead:${hash(fingerprint)}`;
};

export const buildWordPressLeadWebhookRequest = (
  payload: WordPressLeadWebhookPayload,
): WordPressLeadWebhookRequest => ({
  event: 'lead.submitted',
  version: '2026-09-16',
  sentAt: new Date().toISOString(),
  idempotencyKey: createWordPressLeadIdempotencyKey(payload),
  payload,
});

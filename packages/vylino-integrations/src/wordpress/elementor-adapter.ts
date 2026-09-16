import {
  normalizeLeadCapture,
  type VylinoLeadCaptureInput,
} from '../lead-capture/capture';
import type {
  ElementorFieldAliases,
  WordPressLeadSubmission,
  WordPressLeadWebhookPayload,
} from './types';

const DEFAULT_ALIASES: Required<ElementorFieldAliases> = {
  name: ['name', 'full_name', 'your_name'],
  email: ['email', 'email_address', 'your_email'],
  phone: ['phone', 'mobile', 'whatsapp', 'phone_number'],
  serviceInterest: ['service', 'service_interest', 'requirement'],
  message: ['message', 'project_details', 'details'],
};

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (typeof value === 'number') return String(value);

  return undefined;
};

const pickField = (
  fields: Record<string, unknown>,
  aliases: string[],
): string | undefined => {
  for (const alias of aliases) {
    const value = asString(fields[alias]);
    if (value) return value;
  }

  return undefined;
};

export const mapElementorSubmissionToLeadInput = (
  submission: WordPressLeadSubmission,
  aliases: ElementorFieldAliases = {},
): VylinoLeadCaptureInput => {
  const mergedAliases: Required<ElementorFieldAliases> = {
    name: aliases.name ?? DEFAULT_ALIASES.name,
    email: aliases.email ?? DEFAULT_ALIASES.email,
    phone: aliases.phone ?? DEFAULT_ALIASES.phone,
    serviceInterest:
      aliases.serviceInterest ?? DEFAULT_ALIASES.serviceInterest,
    message: aliases.message ?? DEFAULT_ALIASES.message,
  };

  return {
    channel: 'website_form',
    name: pickField(submission.fields, mergedAliases.name),
    email: pickField(submission.fields, mergedAliases.email),
    phone: pickField(submission.fields, mergedAliases.phone),
    serviceInterest: pickField(
      submission.fields,
      mergedAliases.serviceInterest,
    ),
    message: pickField(submission.fields, mergedAliases.message),
    sourceUrl: submission.pageUrl,
    capturedAt: submission.submittedAt,
    ...submission.attribution,
    landingPage:
      submission.attribution?.landingPage ?? submission.pageUrl ?? undefined,
  };
};

export const buildElementorWebhookPayload = (
  submission: WordPressLeadSubmission,
  aliases?: ElementorFieldAliases,
): WordPressLeadWebhookPayload => ({
  source: 'wordpress',
  platform: 'elementor',
  submission,
  lead: normalizeLeadCapture(
    mapElementorSubmissionToLeadInput(submission, aliases),
  ),
});

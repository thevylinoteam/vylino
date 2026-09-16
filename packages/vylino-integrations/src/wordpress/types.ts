import type { LeadCaptureInput } from '../lead-capture/types';

export type WordPressLeadSubmission = {
  formId?: string;
  formName?: string;
  pageUrl?: string;
  pageTitle?: string;
  submittedAt?: string;
  fields: Record<string, unknown>;
  attribution?: Record<string, string | null | undefined>;
};

export type ElementorFieldAliases = {
  name?: string[];
  email?: string[];
  phone?: string[];
  company?: string[];
  service?: string[];
  message?: string[];
};

export type WordPressLeadWebhookPayload = {
  source: 'wordpress';
  platform: 'elementor' | 'generic_form';
  submission: WordPressLeadSubmission;
  lead: LeadCaptureInput;
};

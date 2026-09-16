import type { VylinoAttribution } from '../types';

export type VylinoLeadCaptureChannel =
  | 'website_form'
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'meta_lead_ad'
  | 'manual'
  | 'other';

export type VylinoLeadIdentity = {
  name?: string;
  email?: string;
  phone?: string;
};

export type VylinoLeadCapturePayload = {
  capturedAt: string;
  channel: VylinoLeadCaptureChannel;
  identity: VylinoLeadIdentity;
  serviceInterest?: string;
  message?: string;
  attribution: VylinoAttribution;
  sourceUrl?: string;
  externalLeadId?: string;
  rawSource?: string;
};

export type VylinoCrmLeadFields = {
  leadSource?: string;
  leadChannel?: VylinoLeadCaptureChannel;
  serviceInterest?: string;
  landingPage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  externalLeadId?: string;
  firstCapturedAt?: string;
};

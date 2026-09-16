export type VylinoAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  landingPage?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
};

export type VylinoLeadCaptureChannel =
  | 'website_form'
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'meta_lead_ad'
  | 'manual'
  | 'other';

export type VylinoLeadCapturePayload = {
  capturedAt: string;
  channel: VylinoLeadCaptureChannel;
  identity: {
    name?: string;
    email?: string;
    phone?: string;
  };
  serviceInterest?: string;
  message?: string;
  attribution: VylinoAttribution;
  sourceUrl?: string;
  externalLeadId?: string;
  rawSource?: string;
};

export type WordPressLeadWebhookRequest = {
  event: 'lead.submitted';
  version: '2026-09-16';
  sentAt: string;
  idempotencyKey: string;
  payload: {
    source: 'wordpress';
    platform: 'elementor' | 'generic_form';
    submission: {
      formId?: string;
      formName?: string;
      pageUrl?: string;
      pageTitle?: string;
      submittedAt?: string;
      fields: Record<string, unknown>;
      attribution?: Record<string, string | null | undefined>;
    };
    lead: VylinoLeadCapturePayload;
  };
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

export type TwentyPersonRecord = {
  id: string;
  email?: string;
  phone?: string;
  companyId?: string;
};

export type TwentyCompanyRecord = {
  id: string;
  name?: string;
};

export type TwentyOpportunityRecord = {
  id: string;
  name?: string;
  amount?: number;
  currencyCode?: string;
  stage?: string;
  personId?: string;
  companyId?: string;
};

export type TwentyPersonCreateInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyId?: string;
  customFields?: VylinoCrmLeadFields;
};

export type TwentyCompanyCreateInput = {
  name: string;
  domainName?: string;
};

export type TwentyOpportunityCreateInput = {
  name: string;
  amount?: number;
  currencyCode?: string;
  stage?: string;
  personId?: string;
  companyId?: string;
};

export type TwentyLeadPersistenceResult = {
  personId: string;
  companyId?: string;
  opportunityId?: string;
  personCreated: boolean;
  companyCreated: boolean;
  opportunityCreated: boolean;
};

export interface VylinoCrmTransport {
  findPersonByEmail(email: string): Promise<TwentyPersonRecord | undefined>;
  findPersonByPhone(phone: string): Promise<TwentyPersonRecord | undefined>;
  createPerson(input: TwentyPersonCreateInput): Promise<TwentyPersonRecord>;
  updatePerson(
    personId: string,
    patch: Partial<TwentyPersonCreateInput>,
  ): Promise<TwentyPersonRecord>;
  findCompanyByName(name: string): Promise<TwentyCompanyRecord | undefined>;
  createCompany(input: TwentyCompanyCreateInput): Promise<TwentyCompanyRecord>;
  createOpportunity(
    input: TwentyOpportunityCreateInput,
  ): Promise<TwentyOpportunityRecord>;
}

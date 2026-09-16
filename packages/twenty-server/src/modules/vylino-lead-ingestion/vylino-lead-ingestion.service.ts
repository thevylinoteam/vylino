import { VylinoLeadIdempotencyStore } from './vylino-lead-ingestion.idempotency';
import type {
  TwentyLeadPersistenceResult,
  TwentyPersonCreateInput,
  VylinoCrmLeadFields,
  VylinoCrmTransport,
  VylinoLeadCapturePayload,
  WordPressLeadWebhookRequest,
} from './vylino-lead-ingestion.types';

export type VylinoLeadIngestionOptions = {
  createOpportunity: boolean;
  opportunityStage: string;
  opportunityCurrencyCode: string;
  opportunityAmount?: number;
  companyName?: string;
  writeAttributionFields?: boolean;
};

export type VylinoLeadIngestionResult = {
  status: 'processed' | 'duplicate';
  idempotencyKey: string;
  persistence?: TwentyLeadPersistenceResult;
};

const clean = (value: string | undefined) => value?.trim() || undefined;

const inferLeadSource = (lead: VylinoLeadCapturePayload): string => {
  if (lead.attribution.gclid) return 'google_ads';
  if (lead.attribution.fbclid) return 'meta_ads';
  if (lead.attribution.source) return lead.attribution.source;
  if (lead.channel === 'website_form') return 'website';
  return lead.channel;
};

const mapAttributionFields = (
  lead: VylinoLeadCapturePayload,
): VylinoCrmLeadFields => ({
  leadSource: inferLeadSource(lead),
  leadChannel: lead.channel,
  serviceInterest: lead.serviceInterest,
  landingPage: lead.attribution.landingPage ?? lead.sourceUrl,
  referrer: lead.attribution.referrer,
  utmSource: lead.attribution.source,
  utmMedium: lead.attribution.medium,
  utmCampaign: lead.attribution.campaign,
  utmContent: lead.attribution.content,
  utmTerm: lead.attribution.term,
  gclid: lead.attribution.gclid,
  fbclid: lead.attribution.fbclid,
  externalLeadId: lead.externalLeadId,
  firstCapturedAt: lead.capturedAt,
});

const splitName = (fullName?: string) => {
  const value = clean(fullName);
  if (!value) return {};

  const [firstName, ...rest] = value.split(/\s+/);

  return {
    firstName,
    lastName: rest.join(' ') || undefined,
  };
};

const mapLeadToPersonInput = (
  lead: VylinoLeadCapturePayload,
  companyId: string | undefined,
  writeAttributionFields: boolean,
): TwentyPersonCreateInput => ({
  ...splitName(lead.identity.name),
  email: clean(lead.identity.email)?.toLowerCase(),
  phone: clean(lead.identity.phone),
  companyId,
  customFields: writeAttributionFields ? mapAttributionFields(lead) : undefined,
});

const findExistingPerson = async (
  crm: VylinoCrmTransport,
  lead: VylinoLeadCapturePayload,
) => {
  const email = clean(lead.identity.email)?.toLowerCase();
  if (email) {
    const person = await crm.findPersonByEmail(email);
    if (person) return person;
  }

  const phone = clean(lead.identity.phone);
  if (phone) {
    const person = await crm.findPersonByPhone(phone);
    if (person) return person;
  }

  return undefined;
};

const buildOpportunityName = (lead: VylinoLeadCapturePayload) =>
  [clean(lead.identity.name), clean(lead.serviceInterest)]
    .filter(Boolean)
    .join(' — ') || 'New Website Lead';

const persistLead = async (
  crm: VylinoCrmTransport,
  lead: VylinoLeadCapturePayload,
  options: VylinoLeadIngestionOptions,
): Promise<TwentyLeadPersistenceResult> => {
  let companyId: string | undefined;
  let companyCreated = false;

  const companyName = clean(options.companyName);
  if (companyName) {
    const existingCompany = await crm.findCompanyByName(companyName);

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      const company = await crm.createCompany({ name: companyName });
      companyId = company.id;
      companyCreated = true;
    }
  }

  const existingPerson = await findExistingPerson(crm, lead);
  let personId: string;
  let personCreated = false;

  if (existingPerson) {
    personId = existingPerson.id;
    await crm.updatePerson(
      personId,
      mapLeadToPersonInput(
        lead,
        companyId ?? existingPerson.companyId,
        Boolean(options.writeAttributionFields),
      ),
    );
  } else {
    const person = await crm.createPerson(
      mapLeadToPersonInput(
        lead,
        companyId,
        Boolean(options.writeAttributionFields),
      ),
    );
    personId = person.id;
    personCreated = true;
  }

  let opportunityId: string | undefined;
  let opportunityCreated = false;

  if (options.createOpportunity) {
    const opportunity = await crm.createOpportunity({
      name: buildOpportunityName(lead),
      amount: options.opportunityAmount,
      currencyCode: options.opportunityCurrencyCode,
      stage: options.opportunityStage,
      personId,
      companyId,
    });
    opportunityId = opportunity.id;
    opportunityCreated = true;
  }

  return {
    personId,
    companyId,
    opportunityId,
    personCreated,
    companyCreated,
    opportunityCreated,
  };
};

export const validateWordPressLeadWebhook = (
  request: WordPressLeadWebhookRequest,
) => {
  if (request.event !== 'lead.submitted') {
    throw new Error('Unsupported lead ingestion event');
  }

  if (!request.idempotencyKey?.trim()) {
    throw new Error('Lead ingestion request is missing an idempotency key');
  }

  const lead = request.payload?.lead;
  if (!lead) throw new Error('Lead ingestion payload is missing lead data');

  if (!lead.identity?.name && !lead.identity?.email && !lead.identity?.phone) {
    throw new Error('Lead must include at least a name, email, or phone number');
  }
};

export const ingestVylinoLead = async (input: {
  request: WordPressLeadWebhookRequest;
  crm: VylinoCrmTransport;
  idempotencyStore: VylinoLeadIdempotencyStore;
  options: VylinoLeadIngestionOptions;
}): Promise<VylinoLeadIngestionResult> => {
  validateWordPressLeadWebhook(input.request);

  const claimed = await input.idempotencyStore.claim(
    input.request.idempotencyKey,
  );

  if (!claimed) {
    return {
      status: 'duplicate',
      idempotencyKey: input.request.idempotencyKey,
    };
  }

  try {
    const persistence = await persistLead(
      input.crm,
      input.request.payload.lead,
      input.options,
    );

    await input.idempotencyStore.complete(input.request.idempotencyKey);

    return {
      status: 'processed',
      idempotencyKey: input.request.idempotencyKey,
      persistence,
    };
  } catch (error) {
    await input.idempotencyStore.release(input.request.idempotencyKey);
    throw error;
  }
};

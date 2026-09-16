import { VylinoLeadIdempotencyStore } from './vylino-lead-ingestion.idempotency';
import {
  ingestVylinoLead,
  validateWordPressLeadWebhook,
} from './vylino-lead-ingestion.service';
import type {
  VylinoCrmTransport,
  WordPressLeadWebhookRequest,
} from './vylino-lead-ingestion.types';

const makeRequest = (): WordPressLeadWebhookRequest => ({
  event: 'lead.submitted',
  version: '2026-09-16',
  sentAt: '2026-09-16T04:00:00.000Z',
  idempotencyKey: 'lead:test:1',
  payload: {
    source: 'wordpress',
    platform: 'elementor',
    submission: {
      formId: 'contact',
      submittedAt: '2026-09-16T04:00:00.000Z',
      fields: {},
    },
    lead: {
      capturedAt: '2026-09-16T04:00:00.000Z',
      channel: 'website_form',
      identity: {
        name: 'Test Lead',
        email: 'lead@example.com',
        phone: '9999999999',
      },
      serviceInterest: 'Website Development',
      attribution: {
        source: 'google',
        medium: 'cpc',
        campaign: 'website-development',
        gclid: 'gclid-1',
      },
      sourceUrl: 'https://vylino.com/',
    },
  },
});

const makeCrm = (): jest.Mocked<VylinoCrmTransport> => ({
  findPersonByEmail: jest.fn().mockResolvedValue(undefined),
  findPersonByPhone: jest.fn().mockResolvedValue(undefined),
  createPerson: jest.fn().mockResolvedValue({ id: 'person-1' }),
  updatePerson: jest.fn().mockResolvedValue({ id: 'person-1' }),
  findCompanyByName: jest.fn().mockResolvedValue(undefined),
  createCompany: jest.fn().mockResolvedValue({ id: 'company-1' }),
  createOpportunity: jest.fn().mockResolvedValue({ id: 'opportunity-1' }),
});

const makeIdempotencyStore = (claimResult = true) =>
  ({
    claim: jest.fn().mockResolvedValue(claimResult),
    complete: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
  }) as unknown as jest.Mocked<VylinoLeadIdempotencyStore>;

describe('Vylino lead ingestion', () => {
  it('rejects a lead without identity data', () => {
    const request = makeRequest();
    request.payload.lead.identity = {};

    expect(() => validateWordPressLeadWebhook(request)).toThrow(
      'Lead must include at least a name, email, or phone number',
    );
  });

  it('returns duplicate without writing to CRM when the idempotency claim fails', async () => {
    const crm = makeCrm();
    const idempotencyStore = makeIdempotencyStore(false);

    const result = await ingestVylinoLead({
      request: makeRequest(),
      crm,
      idempotencyStore,
      options: {
        createOpportunity: true,
        opportunityStage: 'NEW',
        opportunityCurrencyCode: 'INR',
      },
    });

    expect(result.status).toBe('duplicate');
    expect(crm.createPerson).not.toHaveBeenCalled();
    expect(crm.createOpportunity).not.toHaveBeenCalled();
  });

  it('deduplicates by email before phone and creates an opportunity for an existing person', async () => {
    const crm = makeCrm();
    crm.findPersonByEmail.mockResolvedValue({
      id: 'person-existing',
      companyId: 'company-existing',
    });
    const idempotencyStore = makeIdempotencyStore();

    const result = await ingestVylinoLead({
      request: makeRequest(),
      crm,
      idempotencyStore,
      options: {
        createOpportunity: true,
        opportunityStage: 'NEW',
        opportunityCurrencyCode: 'INR',
      },
    });

    expect(crm.findPersonByEmail).toHaveBeenCalledWith('lead@example.com');
    expect(crm.findPersonByPhone).not.toHaveBeenCalled();
    expect(crm.updatePerson).toHaveBeenCalledWith(
      'person-existing',
      expect.objectContaining({ companyId: 'company-existing' }),
    );
    expect(crm.createOpportunity).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: 'person-existing',
        companyId: undefined,
        stage: 'NEW',
        currencyCode: 'INR',
      }),
    );
    expect(result.persistence?.personCreated).toBe(false);
    expect(result.persistence?.opportunityCreated).toBe(true);
    expect(idempotencyStore.complete).toHaveBeenCalledWith('lead:test:1');
  });

  it('releases the idempotency claim when CRM persistence fails', async () => {
    const crm = makeCrm();
    crm.createPerson.mockRejectedValue(new Error('CRM unavailable'));
    const idempotencyStore = makeIdempotencyStore();

    await expect(
      ingestVylinoLead({
        request: makeRequest(),
        crm,
        idempotencyStore,
        options: {
          createOpportunity: false,
          opportunityStage: 'NEW',
          opportunityCurrencyCode: 'INR',
        },
      }),
    ).rejects.toThrow('CRM unavailable');

    expect(idempotencyStore.release).toHaveBeenCalledWith('lead:test:1');
    expect(idempotencyStore.complete).not.toHaveBeenCalled();
  });
});

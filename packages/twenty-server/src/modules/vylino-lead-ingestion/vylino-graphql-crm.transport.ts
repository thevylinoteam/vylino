import type {
  TwentyCompanyCreateInput,
  TwentyCompanyRecord,
  TwentyOpportunityCreateInput,
  TwentyOpportunityRecord,
  TwentyPersonCreateInput,
  TwentyPersonRecord,
} from '../../../../vylino-integrations/src/twenty-crm/types';
import type { TwentyCrmTransport } from '../../../../vylino-integrations/src/twenty-crm/transport';

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

export class VylinoGraphqlCrmTransport implements TwentyCrmTransport {
  constructor(
    private readonly graphqlUrl: string,
    private readonly apiKey: string,
  ) {}

  private async request<T>(query: string, variables: Record<string, unknown>) {
    const response = await fetch(this.graphqlUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = (await response.json()) as GraphQlResponse<T>;

    if (!response.ok || payload.errors?.length) {
      const message = payload.errors?.map((error) => error.message).filter(Boolean).join('; ');
      throw new Error(message || `Twenty GraphQL request failed with ${response.status}`);
    }

    if (!payload.data) throw new Error('Twenty GraphQL response did not include data');
    return payload.data;
  }

  async findPersonByEmail(email: string): Promise<TwentyPersonRecord | undefined> {
    const data = await this.request<any>(
      `query FindPersonByEmail($email: String!) {
        people(filter: { emails: { primaryEmail: { eq: $email } } }, first: 1) {
          edges { node { id companyId emails { primaryEmail } phones { primaryPhoneNumber } } }
        }
      }`,
      { email },
    );
    const node = data.people?.edges?.[0]?.node;
    return node
      ? {
          id: node.id,
          companyId: node.companyId ?? undefined,
          email: node.emails?.primaryEmail ?? undefined,
          phone: node.phones?.primaryPhoneNumber ?? undefined,
        }
      : undefined;
  }

  async findPersonByPhone(phone: string): Promise<TwentyPersonRecord | undefined> {
    const data = await this.request<any>(
      `query FindPersonByPhone($phone: String!) {
        people(filter: { phones: { primaryPhoneNumber: { eq: $phone } } }, first: 1) {
          edges { node { id companyId emails { primaryEmail } phones { primaryPhoneNumber } } }
        }
      }`,
      { phone },
    );
    const node = data.people?.edges?.[0]?.node;
    return node
      ? {
          id: node.id,
          companyId: node.companyId ?? undefined,
          email: node.emails?.primaryEmail ?? undefined,
          phone: node.phones?.primaryPhoneNumber ?? undefined,
        }
      : undefined;
  }

  private personData(input: Partial<TwentyPersonCreateInput>) {
    const data: Record<string, unknown> = {};
    if (input.firstName !== undefined || input.lastName !== undefined) {
      data.name = { firstName: input.firstName ?? '', lastName: input.lastName ?? '' };
    }
    if (input.email) data.emails = { primaryEmail: input.email };
    if (input.phone) data.phones = { primaryPhoneNumber: input.phone };
    if (input.companyId) data.companyId = input.companyId;
    Object.assign(data, input.customFields ?? {});
    return data;
  }

  async createPerson(input: TwentyPersonCreateInput): Promise<TwentyPersonRecord> {
    const data = await this.request<any>(
      `mutation CreatePerson($data: PersonCreateInput!) {
        createPerson(data: $data) { id companyId emails { primaryEmail } phones { primaryPhoneNumber } }
      }`,
      { data: this.personData(input) },
    );
    const node = data.createPerson;
    if (!node?.id) throw new Error('Twenty createPerson did not return an id');
    return {
      id: node.id,
      companyId: node.companyId ?? undefined,
      email: node.emails?.primaryEmail ?? input.email,
      phone: node.phones?.primaryPhoneNumber ?? input.phone,
    };
  }

  async updatePerson(personId: string, patch: Partial<TwentyPersonCreateInput>): Promise<TwentyPersonRecord> {
    const data = await this.request<any>(
      `mutation UpdatePerson($id: UUID!, $data: PersonUpdateInput!) {
        updatePeople(filter: { id: { eq: $id } }, data: $data) {
          edges { node { id companyId emails { primaryEmail } phones { primaryPhoneNumber } } }
        }
      }`,
      { id: personId, data: this.personData(patch) },
    );
    const node = data.updatePeople?.edges?.[0]?.node;
    return node
      ? {
          id: node.id,
          companyId: node.companyId ?? undefined,
          email: node.emails?.primaryEmail ?? undefined,
          phone: node.phones?.primaryPhoneNumber ?? undefined,
        }
      : { id: personId };
  }

  async findCompanyByName(name: string): Promise<TwentyCompanyRecord | undefined> {
    const data = await this.request<any>(
      `query FindCompanyByName($name: String!) {
        companies(filter: { name: { eq: $name } }, first: 1) { edges { node { id name } } }
      }`,
      { name },
    );
    const node = data.companies?.edges?.[0]?.node;
    return node ? { id: node.id, name: node.name ?? undefined } : undefined;
  }

  async createCompany(input: TwentyCompanyCreateInput): Promise<TwentyCompanyRecord> {
    const record: Record<string, unknown> = { name: input.name };
    if (input.domainName) record.domainName = { primaryLinkUrl: input.domainName };
    const data = await this.request<any>(
      `mutation CreateCompany($data: CompanyCreateInput!) { createCompany(data: $data) { id name } }`,
      { data: record },
    );
    if (!data.createCompany?.id) throw new Error('Twenty createCompany did not return an id');
    return { id: data.createCompany.id, name: data.createCompany.name ?? input.name };
  }

  async createOpportunity(input: TwentyOpportunityCreateInput): Promise<TwentyOpportunityRecord> {
    const record: Record<string, unknown> = { name: input.name };
    if (input.amount !== undefined) {
      record.amount = {
        amountMicros: Math.round(input.amount * 1_000_000),
        currencyCode: input.currencyCode ?? 'INR',
      };
    }
    if (input.stage) record.stage = input.stage;
    if (input.personId) record.pointOfContactId = input.personId;
    if (input.companyId) record.companyId = input.companyId;

    const data = await this.request<any>(
      `mutation CreateOpportunity($data: OpportunityCreateInput!) {
        createOpportunity(data: $data) { id name }
      }`,
      { data: record },
    );
    if (!data.createOpportunity?.id) throw new Error('Twenty createOpportunity did not return an id');
    return {
      id: data.createOpportunity.id,
      name: data.createOpportunity.name ?? input.name,
      amount: input.amount,
      currencyCode: input.currencyCode,
      stage: input.stage,
      personId: input.personId,
      companyId: input.companyId,
    };
  }
}

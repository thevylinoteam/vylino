import type {
  TwentyCompanyCreateInput,
  TwentyCompanyRecord,
  TwentyOpportunityCreateInput,
  TwentyOpportunityRecord,
  TwentyPersonCreateInput,
  TwentyPersonRecord,
} from './types';

export interface TwentyCrmTransport {
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

export type TwentyCoreApiClientLike = {
  query(operation: Record<string, unknown>): Promise<Record<string, any>>;
  mutation(operation: Record<string, unknown>): Promise<Record<string, any>>;
};

const firstEdgeNode = <T>(connection: any): T | undefined =>
  connection?.edges?.[0]?.node as T | undefined;

export class TwentyCoreApiTransport implements TwentyCrmTransport {
  constructor(private readonly client: TwentyCoreApiClientLike) {}

  async findPersonByEmail(email: string) {
    const result = await this.client.query({
      people: {
        __args: {
          filter: { emails: { primaryEmail: { eq: email } } },
          first: 1,
        },
        edges: {
          node: {
            id: true,
            companyId: true,
            emails: { primaryEmail: true },
            phones: { primaryPhoneNumber: true },
          },
        },
      },
    });

    const node = firstEdgeNode<any>(result.people);
    if (!node) return undefined;

    return {
      id: node.id,
      companyId: node.companyId ?? undefined,
      email: node.emails?.primaryEmail ?? undefined,
      phone: node.phones?.primaryPhoneNumber ?? undefined,
    };
  }

  async findPersonByPhone(phone: string) {
    const result = await this.client.query({
      people: {
        __args: {
          filter: { phones: { primaryPhoneNumber: { eq: phone } } },
          first: 1,
        },
        edges: {
          node: {
            id: true,
            companyId: true,
            emails: { primaryEmail: true },
            phones: { primaryPhoneNumber: true },
          },
        },
      },
    });

    const node = firstEdgeNode<any>(result.people);
    if (!node) return undefined;

    return {
      id: node.id,
      companyId: node.companyId ?? undefined,
      email: node.emails?.primaryEmail ?? undefined,
      phone: node.phones?.primaryPhoneNumber ?? undefined,
    };
  }

  async createPerson(input: TwentyPersonCreateInput) {
    const data: Record<string, unknown> = {};

    if (input.firstName || input.lastName) {
      data.name = {
        firstName: input.firstName ?? '',
        lastName: input.lastName ?? '',
      };
    }
    if (input.email) data.emails = { primaryEmail: input.email };
    if (input.phone) data.phones = { primaryPhoneNumber: input.phone };
    if (input.companyId) data.companyId = input.companyId;
    Object.assign(data, input.customFields ?? {});

    const result = await this.client.mutation({
      createPerson: {
        __args: { data },
        id: true,
        companyId: true,
        emails: { primaryEmail: true },
        phones: { primaryPhoneNumber: true },
      },
    });

    const node = result.createPerson;
    if (!node?.id) throw new Error('Twenty createPerson did not return an id');

    return {
      id: node.id,
      companyId: node.companyId ?? undefined,
      email: node.emails?.primaryEmail ?? input.email,
      phone: node.phones?.primaryPhoneNumber ?? input.phone,
    };
  }

  async updatePerson(personId: string, patch: Partial<TwentyPersonCreateInput>) {
    const data: Record<string, unknown> = {};

    if (patch.firstName !== undefined || patch.lastName !== undefined) {
      data.name = {
        firstName: patch.firstName ?? '',
        lastName: patch.lastName ?? '',
      };
    }
    if (patch.email !== undefined) data.emails = { primaryEmail: patch.email };
    if (patch.phone !== undefined) data.phones = { primaryPhoneNumber: patch.phone };
    if (patch.companyId !== undefined) data.companyId = patch.companyId;
    Object.assign(data, patch.customFields ?? {});

    const result = await this.client.mutation({
      updatePeople: {
        __args: { filter: { id: { eq: personId } }, data },
        edges: {
          node: {
            id: true,
            companyId: true,
            emails: { primaryEmail: true },
            phones: { primaryPhoneNumber: true },
          },
        },
      },
    });

    const node = firstEdgeNode<any>(result.updatePeople);
    if (!node?.id) return { id: personId };

    return {
      id: node.id,
      companyId: node.companyId ?? undefined,
      email: node.emails?.primaryEmail ?? undefined,
      phone: node.phones?.primaryPhoneNumber ?? undefined,
    };
  }

  async findCompanyByName(name: string) {
    const result = await this.client.query({
      companies: {
        __args: { filter: { name: { eq: name } }, first: 1 },
        edges: { node: { id: true, name: true } },
      },
    });

    const node = firstEdgeNode<any>(result.companies);
    return node ? { id: node.id, name: node.name ?? undefined } : undefined;
  }

  async createCompany(input: TwentyCompanyCreateInput) {
    const data: Record<string, unknown> = { name: input.name };
    if (input.domainName) data.domainName = { primaryLinkUrl: input.domainName };

    const result = await this.client.mutation({
      createCompany: { __args: { data }, id: true, name: true },
    });
    if (!result.createCompany?.id) {
      throw new Error('Twenty createCompany did not return an id');
    }

    return {
      id: result.createCompany.id,
      name: result.createCompany.name ?? input.name,
    };
  }

  async createOpportunity(input: TwentyOpportunityCreateInput) {
    const data: Record<string, unknown> = { name: input.name };

    if (input.amount !== undefined && input.currencyCode) {
      data.amount = {
        amountMicros: Math.round(input.amount * 1_000_000),
        currencyCode: input.currencyCode,
      };
    }
    if (input.stage) data.stage = input.stage;
    if (input.personId) data.pointOfContactId = input.personId;
    if (input.companyId) data.companyId = input.companyId;

    const result = await this.client.mutation({
      createOpportunity: {
        __args: { data },
        id: true,
        name: true,
      },
    });
    if (!result.createOpportunity?.id) {
      throw new Error('Twenty createOpportunity did not return an id');
    }

    return {
      id: result.createOpportunity.id,
      name: result.createOpportunity.name ?? input.name,
      amount: input.amount,
      currencyCode: input.currencyCode,
      stage: input.stage,
      personId: input.personId,
      companyId: input.companyId,
    };
  }
}

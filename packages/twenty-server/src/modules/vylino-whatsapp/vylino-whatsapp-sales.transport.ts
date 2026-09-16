type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type OpportunityNode = {
  id?: string;
  name?: string;
  vylinoSalesStage?: string;
};

type CreateOpportunityResponse = {
  createOpportunity?: OpportunityNode;
};

type UpdateOpportunityResponse = {
  updateOpportunities?: {
    edges?: Array<{ node?: OpportunityNode }>;
  };
};

export class VylinoWhatsAppSalesTransport {
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
      signal: AbortSignal.timeout(30_000),
    });
    const payload = (await response.json()) as GraphQlResponse<T>;

    if (!response.ok || payload.errors?.length) {
      const message = payload.errors
        ?.map((error) => error.message)
        .filter(Boolean)
        .join('; ');
      throw new Error(
        message || `Twenty GraphQL request failed with ${response.status}`,
      );
    }
    if (!payload.data) {
      throw new Error('Twenty GraphQL response did not include data');
    }
    return payload.data;
  }

  async createLeadOpportunity(input: {
    personId: string;
    displayName?: string;
    waId: string;
    companyId?: string;
  }) {
    const name = `WhatsApp Lead — ${input.displayName?.trim() || input.waId}`;
    const data = await this.request<CreateOpportunityResponse>(
      `mutation CreateWhatsAppOpportunity($data: OpportunityCreateInput!) {
        createOpportunity(data: $data) { id name vylinoSalesStage }
      }`,
      {
        data: {
          name,
          vylinoSalesStage: 'NEW_LEAD',
          pointOfContactId: input.personId,
          ...(input.companyId ? { companyId: input.companyId } : {}),
        },
      },
    );
    const opportunity = data.createOpportunity;
    if (!opportunity?.id) {
      throw new Error('Twenty did not create the WhatsApp lead opportunity');
    }
    return opportunity;
  }

  async updateStage(opportunityId: string, stage: string) {
    const data = await this.request<UpdateOpportunityResponse>(
      `mutation UpdateWhatsAppOpportunityStage(
        $id: UUID!
        $data: OpportunityUpdateInput!
      ) {
        updateOpportunities(
          filter: { id: { eq: $id } }
          data: $data
        ) {
          edges { node { id name vylinoSalesStage } }
        }
      }`,
      { id: opportunityId, data: { vylinoSalesStage: stage } },
    );
    const opportunity = data.updateOpportunities?.edges?.[0]?.node;
    if (!opportunity?.id) {
      throw new Error('Twenty did not update the WhatsApp opportunity stage');
    }
    return opportunity;
  }
}

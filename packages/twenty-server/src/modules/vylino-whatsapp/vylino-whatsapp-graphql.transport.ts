import type {
  VylinoPaymentRequest,
  VylinoServiceCatalogItem,
  VylinoWhatsAppConversation,
} from './vylino-whatsapp.types';

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type Edge<T> = { node?: T };
type Connection<T> = { edges?: Edge<T>[] };

type ConversationQuery = {
  vylinoWhatsAppConversations?: Connection<VylinoWhatsAppConversation>;
};
type ConversationCreate = {
  createVylinoWhatsAppConversation?: VylinoWhatsAppConversation;
};
type ConversationUpdate = {
  updateVylinoWhatsAppConversations?: Connection<VylinoWhatsAppConversation>;
};
type MessageNode = {
  id?: string;
  externalMessageId?: string;
  status?: string;
};
type MessageQuery = { vylinoWhatsAppMessages?: Connection<MessageNode> };
type MessageCreate = { createVylinoWhatsAppMessage?: MessageNode };
type MessageUpdate = { updateVylinoWhatsAppMessages?: Connection<MessageNode> };
type CatalogQuery = {
  vylinoServiceCatalogItems?: Connection<VylinoServiceCatalogItem>;
};
type PaymentQuery = {
  vylinoPaymentRequests?: Connection<VylinoPaymentRequest>;
};
type PaymentCreate = { createVylinoPaymentRequest?: VylinoPaymentRequest };
type PaymentUpdate = {
  updateVylinoPaymentRequests?: Connection<VylinoPaymentRequest>;
};
type OpportunityNode = {
  id?: string;
  name?: string;
  vylinoSalesStage?: string;
};
type OpportunityCreate = { createOpportunity?: OpportunityNode };
type OpportunityUpdate = { updateOpportunities?: Connection<OpportunityNode> };

const stageForConversationStatus = (status: unknown) => {
  switch (status) {
    case 'WAITING_CUSTOMER':
      return 'QUALIFIED';
    case 'WAITING_PAYMENT':
      return 'PROPOSAL_SENT';
    case 'HUMAN_HANDOFF':
      return 'CONTACTED';
    case 'WON':
      return 'WON';
    case 'CLOSED':
      return 'LOST';
    default:
      return undefined;
  }
};

export class VylinoWhatsAppGraphqlTransport {
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

  private async createOpportunityForConversation(
    input: Record<string, unknown>,
  ): Promise<string | undefined> {
    const personId =
      typeof input.personRecordId === 'string'
        ? input.personRecordId
        : undefined;
    if (!personId) return undefined;

    const displayName =
      typeof input.displayName === 'string' && input.displayName.trim()
        ? input.displayName.trim()
        : typeof input.waId === 'string'
          ? input.waId
          : 'WhatsApp';

    const data = await this.request<OpportunityCreate>(
      `mutation CreateVylinoWhatsAppOpportunity($data: OpportunityCreateInput!) {
        createOpportunity(data: $data) { id name vylinoSalesStage }
      }`,
      {
        data: {
          name: `WhatsApp Lead — ${displayName}`,
          vylinoSalesStage: 'NEW_LEAD',
          pointOfContactId: personId,
        },
      },
    );

    return data.createOpportunity?.id;
  }

  private async updateOpportunityStage(opportunityId: string, stage: string) {
    const data = await this.request<OpportunityUpdate>(
      `mutation UpdateVylinoWhatsAppOpportunityStage(
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

    if (!data.updateOpportunities?.edges?.[0]?.node?.id) {
      throw new Error('Twenty did not update the WhatsApp opportunity stage');
    }
  }

  async findConversation(
    conversationKey: string,
  ): Promise<VylinoWhatsAppConversation | undefined> {
    const data = await this.request<ConversationQuery>(
      `query FindVylinoWhatsAppConversation($conversationKey: String!) {
        vylinoWhatsAppConversations(
          filter: { conversationKey: { eq: $conversationKey } }
          first: 1
        ) {
          edges { node {
            id conversationKey waId displayName provider status automationMode
            personRecordId opportunityRecordId lastInboundAt lastOutboundAt
            serviceWindowExpiresAt lastIntent lastIntentConfidence
            recommendedServiceKey paymentStatus paymentLinkUrl humanOwner
            unreadCount totalMessages lastMessageText
          } }
        }
      }`,
      { conversationKey },
    );
    return data.vylinoWhatsAppConversations?.edges?.[0]?.node;
  }

  async createConversation(input: Record<string, unknown>) {
    const dataToCreate = { ...input };
    if (!dataToCreate.opportunityRecordId) {
      const opportunityRecordId =
        await this.createOpportunityForConversation(input);
      if (opportunityRecordId)
        dataToCreate.opportunityRecordId = opportunityRecordId;
    }

    const data = await this.request<ConversationCreate>(
      `mutation CreateVylinoWhatsAppConversation($data: VylinoWhatsAppConversationCreateInput!) {
        createVylinoWhatsAppConversation(data: $data) {
          id conversationKey waId displayName provider status automationMode
          personRecordId opportunityRecordId lastInboundAt serviceWindowExpiresAt
          recommendedServiceKey
        }
      }`,
      { data: dataToCreate },
    );
    const conversation = data.createVylinoWhatsAppConversation;
    if (!conversation?.id) {
      throw new Error('Twenty did not create the WhatsApp conversation');
    }
    return conversation;
  }

  async updateConversation(
    id: string,
    patch: Record<string, unknown>,
  ): Promise<VylinoWhatsAppConversation> {
    const data = await this.request<ConversationUpdate>(
      `mutation UpdateVylinoWhatsAppConversation($id: UUID!, $data: VylinoWhatsAppConversationUpdateInput!) {
        updateVylinoWhatsAppConversations(
          filter: { id: { eq: $id } }
          data: $data
        ) {
          edges { node {
            id conversationKey waId displayName provider status automationMode
            personRecordId opportunityRecordId lastInboundAt lastOutboundAt
            serviceWindowExpiresAt lastIntent lastIntentConfidence
            recommendedServiceKey paymentStatus paymentLinkUrl humanOwner
            unreadCount totalMessages lastMessageText
          } }
        }
      }`,
      { id, data: patch },
    );
    const conversation =
      data.updateVylinoWhatsAppConversations?.edges?.[0]?.node;
    if (!conversation?.id) {
      throw new Error('Twenty did not update the WhatsApp conversation');
    }

    const stage = stageForConversationStatus(patch.status);
    if (stage && conversation.opportunityRecordId) {
      await this.updateOpportunityStage(
        conversation.opportunityRecordId,
        stage,
      );
    }

    return conversation;
  }

  async messageExists(externalMessageId: string): Promise<boolean> {
    const data = await this.request<MessageQuery>(
      `query FindVylinoWhatsAppMessage($externalMessageId: String!) {
        vylinoWhatsAppMessages(
          filter: { externalMessageId: { eq: $externalMessageId } }
          first: 1
        ) { edges { node { id externalMessageId status } } }
      }`,
      { externalMessageId },
    );
    return Boolean(data.vylinoWhatsAppMessages?.edges?.[0]?.node?.id);
  }

  async createMessage(input: Record<string, unknown>) {
    const data = await this.request<MessageCreate>(
      `mutation CreateVylinoWhatsAppMessage($data: VylinoWhatsAppMessageCreateInput!) {
        createVylinoWhatsAppMessage(data: $data) { id externalMessageId status }
      }`,
      { data: input },
    );
    if (!data.createVylinoWhatsAppMessage?.id) {
      throw new Error('Twenty did not create the WhatsApp message');
    }
    return data.createVylinoWhatsAppMessage;
  }

  async updateMessageStatus(
    externalMessageId: string,
    status: string,
    error?: string,
  ) {
    const data = await this.request<MessageUpdate>(
      `mutation UpdateVylinoWhatsAppMessageStatus(
        $externalMessageId: String!
        $data: VylinoWhatsAppMessageUpdateInput!
      ) {
        updateVylinoWhatsAppMessages(
          filter: { externalMessageId: { eq: $externalMessageId } }
          data: $data
        ) { edges { node { id externalMessageId status } } }
      }`,
      { externalMessageId, data: { status, error } },
    );
    return data.updateVylinoWhatsAppMessages?.edges?.[0]?.node;
  }

  async listActiveCatalog(): Promise<VylinoServiceCatalogItem[]> {
    const data = await this.request<CatalogQuery>(
      `query VylinoActiveServiceCatalog {
        vylinoServiceCatalogItems(
          filter: { isActive: { eq: true } }
          first: 100
        ) {
          edges { node {
            id serviceKey name category shortDescription basePrice currencyCode
            isActive keywords paymentRequired priority
          } }
        }
      }`,
      {},
    );
    return (data.vylinoServiceCatalogItems?.edges ?? [])
      .map((edge) => edge.node)
      .filter((node): node is VylinoServiceCatalogItem =>
        Boolean(node?.id && node.serviceKey),
      );
  }

  async findCatalogItem(serviceKey: string) {
    const data = await this.request<CatalogQuery>(
      `query FindVylinoServiceCatalogItem($serviceKey: String!) {
        vylinoServiceCatalogItems(
          filter: { serviceKey: { eq: $serviceKey } }
          first: 1
        ) {
          edges { node {
            id serviceKey name category shortDescription basePrice currencyCode
            isActive keywords paymentRequired priority
          } }
        }
      }`,
      { serviceKey },
    );
    return data.vylinoServiceCatalogItems?.edges?.[0]?.node;
  }

  async createPaymentRequest(input: Record<string, unknown>) {
    const data = await this.request<PaymentCreate>(
      `mutation CreateVylinoPaymentRequest($data: VylinoPaymentRequestCreateInput!) {
        createVylinoPaymentRequest(data: $data) {
          id paymentKey conversationKey personRecordId provider amount currencyCode
          status linkUrl purpose externalPaymentId paidAt expiresAt
        }
      }`,
      { data: input },
    );
    const payment = data.createVylinoPaymentRequest;
    if (!payment?.id) {
      throw new Error('Twenty did not create the payment request');
    }
    return payment;
  }

  async findPaymentByKey(paymentKey: string) {
    const data = await this.request<PaymentQuery>(
      `query FindVylinoPaymentRequest($paymentKey: String!) {
        vylinoPaymentRequests(
          filter: { paymentKey: { eq: $paymentKey } }
          first: 1
        ) {
          edges { node {
            id paymentKey conversationKey personRecordId provider amount currencyCode
            status linkUrl purpose externalPaymentId paidAt expiresAt
          } }
        }
      }`,
      { paymentKey },
    );
    return data.vylinoPaymentRequests?.edges?.[0]?.node;
  }

  async updatePaymentRequest(id: string, patch: Record<string, unknown>) {
    const data = await this.request<PaymentUpdate>(
      `mutation UpdateVylinoPaymentRequest($id: UUID!, $data: VylinoPaymentRequestUpdateInput!) {
        updateVylinoPaymentRequests(
          filter: { id: { eq: $id } }
          data: $data
        ) {
          edges { node {
            id paymentKey conversationKey personRecordId provider amount currencyCode
            status linkUrl purpose externalPaymentId paidAt expiresAt
          } }
        }
      }`,
      { id, data: patch },
    );
    return data.updateVylinoPaymentRequests?.edges?.[0]?.node;
  }
}

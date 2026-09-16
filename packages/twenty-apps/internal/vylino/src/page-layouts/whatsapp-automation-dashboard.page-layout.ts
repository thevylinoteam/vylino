import {
  AggregateOperations,
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import {
  VYLINO_WHATSAPP_AUTOMATION_MODE_FIELD_ID,
  VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
  VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
  VYLINO_WHATSAPP_RECOMMENDED_SERVICE_KEY_FIELD_ID,
  VYLINO_WHATSAPP_STATUS_FIELD_ID,
  VylinoWhatsAppConversationStatus,
} from '../objects/whatsapp-conversation.object';
import {
  VYLINO_PAYMENT_KEY_FIELD_ID,
  VYLINO_PAYMENT_REQUEST_OBJECT_ID,
  VYLINO_PAYMENT_STATUS_FIELD_ID,
  VylinoPaymentRequestStatus,
} from '../objects/payment-request.object';

export const VYLINO_WHATSAPP_AUTOMATION_DASHBOARD_ID =
  '6dc4cbec-417d-471f-b420-557cfdbdc7cc';

const BAR = {
  layout: 'VERTICAL',
  primaryAxisOrderBy: 'VALUE_DESC',
  axisNameDisplay: 'NONE',
  color: 'auto',
  timezone: 'Asia/Kolkata',
  firstDayOfTheWeek: 1,
} as const;

const statusFilter = (status: VylinoWhatsAppConversationStatus) => ({
  recordFilters: [
    {
      fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_STATUS_FIELD_ID,
      operand: 'IS',
      value: `["${status}"]`,
    },
  ],
});

export default definePageLayout({
  universalIdentifier: VYLINO_WHATSAPP_AUTOMATION_DASHBOARD_ID,
  name: 'WhatsApp Automation',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: 'd7ae4c26-b857-48cb-9100-8708efc6a80e',
      title: 'WhatsApp',
      position: 0,
      icon: 'IconBrandWhatsapp',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: '57e8904b-8d65-4ab4-8937-f4b2049aaa28',
          title: 'Open conversations',
          type: 'GRAPH',
          objectUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
          position: { layoutMode: PageLayoutTabLayoutMode.GRID, row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
            filter: statusFilter(VylinoWhatsAppConversationStatus.OPEN),
          },
        },
        {
          universalIdentifier: '7851d2c2-6e03-429a-a48d-b8236f01a936',
          title: 'Human handoffs',
          type: 'GRAPH',
          objectUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
          position: { layoutMode: PageLayoutTabLayoutMode.GRID, row: 0, column: 3, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
            filter: statusFilter(VylinoWhatsAppConversationStatus.HUMAN_HANDOFF),
          },
        },
        {
          universalIdentifier: '0c61a3bf-4767-474f-b8d6-da924732b7d8',
          title: 'Waiting payment',
          type: 'GRAPH',
          objectUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
          position: { layoutMode: PageLayoutTabLayoutMode.GRID, row: 0, column: 6, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
            filter: statusFilter(VylinoWhatsAppConversationStatus.WAITING_PAYMENT),
          },
        },
        {
          universalIdentifier: 'f9f7c4db-0caf-4011-9a69-4eb2880879fc',
          title: 'Paid requests',
          type: 'GRAPH',
          objectUniversalIdentifier: VYLINO_PAYMENT_REQUEST_OBJECT_ID,
          position: { layoutMode: PageLayoutTabLayoutMode.GRID, row: 0, column: 9, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier: VYLINO_PAYMENT_KEY_FIELD_ID,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_STATUS_FIELD_ID,
                  operand: 'IS',
                  value: `["${VylinoPaymentRequestStatus.PAID}"]`,
                },
              ],
            },
          },
        },
        {
          universalIdentifier: '36d944f1-c630-4bc6-ba95-f86673d4189b',
          title: 'Conversation status',
          type: 'GRAPH',
          objectUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
          position: { layoutMode: PageLayoutTabLayoutMode.GRID, row: 2, column: 0, rowSpan: 5, columnSpan: 6 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
            aggregateOperation: AggregateOperations.COUNT,
            groupByFieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_STATUS_FIELD_ID,
            displayLegend: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
          },
        },
        {
          universalIdentifier: 'a2c73e3d-2c84-4422-838d-46313ff8f50d',
          title: 'Automation mode',
          type: 'GRAPH',
          objectUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
          position: { layoutMode: PageLayoutTabLayoutMode.GRID, row: 2, column: 6, rowSpan: 5, columnSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_AUTOMATION_MODE_FIELD_ID,
            ...BAR,
          },
        },
        {
          universalIdentifier: '9e384fc3-6d1a-4e88-b1e2-37afa57510d0',
          title: 'Recommended services',
          type: 'GRAPH',
          objectUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
          position: { layoutMode: PageLayoutTabLayoutMode.GRID, row: 7, column: 0, rowSpan: 5, columnSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_RECOMMENDED_SERVICE_KEY_FIELD_ID,
            ...BAR,
          },
        },
        {
          universalIdentifier: '084f5ddf-7e65-4570-a9c3-5cc853540913',
          title: 'Payment status',
          type: 'GRAPH',
          objectUniversalIdentifier: VYLINO_PAYMENT_REQUEST_OBJECT_ID,
          position: { layoutMode: PageLayoutTabLayoutMode.GRID, row: 7, column: 6, rowSpan: 5, columnSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier: VYLINO_PAYMENT_KEY_FIELD_ID,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier: VYLINO_PAYMENT_STATUS_FIELD_ID,
            ...BAR,
          },
        },
      ],
    },
  ],
});

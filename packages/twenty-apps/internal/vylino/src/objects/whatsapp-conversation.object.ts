import { defineObject, FieldType } from 'twenty-sdk/define';

export enum VylinoWhatsAppProvider {
  META_CLOUD = 'META_CLOUD',
  EVOLUTION = 'EVOLUTION',
}

export enum VylinoWhatsAppConversationStatus {
  OPEN = 'OPEN',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  HUMAN_HANDOFF = 'HUMAN_HANDOFF',
  WON = 'WON',
  CLOSED = 'CLOSED',
  OPTED_OUT = 'OPTED_OUT',
}

export enum VylinoWhatsAppAutomationMode {
  BOT = 'BOT',
  ASSISTED = 'ASSISTED',
  HUMAN = 'HUMAN',
  PAUSED = 'PAUSED',
}

export const VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID =
  '592b2654-4b74-4e6e-8aa3-54c923efac7b';
export const VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID =
  '64e1a258-9d33-43ae-9d90-4b193acdb10f';
export const VYLINO_WHATSAPP_WA_ID_FIELD_ID =
  '7e530ae5-b9b4-4a81-a832-6947e69a6247';
export const VYLINO_WHATSAPP_DISPLAY_NAME_FIELD_ID =
  '8df6cc25-84d5-4dac-a623-d58e961569c5';
export const VYLINO_WHATSAPP_PROVIDER_FIELD_ID =
  'e1944011-ac39-4de0-9344-dbcc59c37beb';
export const VYLINO_WHATSAPP_STATUS_FIELD_ID =
  '5bbc4dd6-dce6-428c-ba98-dde70169771a';
export const VYLINO_WHATSAPP_AUTOMATION_MODE_FIELD_ID =
  '0e098fe9-e38f-451c-b288-d36bf27d0e47';
export const VYLINO_WHATSAPP_PERSON_RECORD_ID_FIELD_ID =
  '6becd087-81ef-4310-80d9-d1416923a262';
export const VYLINO_WHATSAPP_OPPORTUNITY_RECORD_ID_FIELD_ID =
  '121a55ad-e5c6-4077-b99a-1ecbfd9cdd21';
export const VYLINO_WHATSAPP_LAST_INBOUND_AT_FIELD_ID =
  '8c08dab0-d7a6-4ac7-8303-35d3db823a5c';
export const VYLINO_WHATSAPP_LAST_OUTBOUND_AT_FIELD_ID =
  '351e5dbc-98e4-4eeb-b21c-ce3994e45638';
export const VYLINO_WHATSAPP_SERVICE_WINDOW_EXPIRES_AT_FIELD_ID =
  '1b776e1c-f17f-4f72-a150-be56d96919f4';
export const VYLINO_WHATSAPP_LAST_INTENT_FIELD_ID =
  '36940e8e-edca-48cf-b08c-e396b16e76f0';
export const VYLINO_WHATSAPP_LAST_INTENT_CONFIDENCE_FIELD_ID =
  'b9a7dec0-feda-4011-9c7a-6222d8ad35fe';
export const VYLINO_WHATSAPP_RECOMMENDED_SERVICE_KEY_FIELD_ID =
  '4734c0c3-6d14-4fcc-aca6-e48d60195af6';
export const VYLINO_WHATSAPP_PAYMENT_STATUS_FIELD_ID =
  '1496e468-3954-4002-bdb2-be0d9cd6e749';
export const VYLINO_WHATSAPP_PAYMENT_LINK_URL_FIELD_ID =
  'af05591b-a755-492d-b91a-1e6cf32a567d';
export const VYLINO_WHATSAPP_HUMAN_OWNER_FIELD_ID =
  'e185d877-56a3-4acc-a170-183725a19091';
export const VYLINO_WHATSAPP_UNREAD_COUNT_FIELD_ID =
  '98dd22b0-cc17-483b-b044-a6a440468344';
export const VYLINO_WHATSAPP_TOTAL_MESSAGES_FIELD_ID =
  '750db8a6-6875-4c54-be1d-6e6e519a6a0e';
export const VYLINO_WHATSAPP_LAST_MESSAGE_TEXT_FIELD_ID =
  'f8554a89-f383-4468-8244-1f48d307dd26';

export default defineObject({
  universalIdentifier: VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
  nameSingular: 'vylinoWhatsAppConversation',
  namePlural: 'vylinoWhatsAppConversations',
  labelSingular: 'WhatsApp Conversation',
  labelPlural: 'WhatsApp Conversations',
  description: 'WhatsApp sales and support conversations managed by Vylino Business OS.',
  icon: 'IconBrandWhatsapp',
  labelIdentifierFieldMetadataUniversalIdentifier:
    VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
  fields: [
    {
      universalIdentifier: VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
      type: FieldType.TEXT,
      name: 'conversationKey',
      label: 'Conversation Key',
      icon: 'IconKey',
      isUnique: true,
    },
    {
      universalIdentifier: VYLINO_WHATSAPP_WA_ID_FIELD_ID,
      type: FieldType.TEXT,
      name: 'waId',
      label: 'WhatsApp ID',
      icon: 'IconPhone',
    },
    {
      universalIdentifier: VYLINO_WHATSAPP_DISPLAY_NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: 'displayName',
      label: 'Contact Name',
      icon: 'IconUser',
      isNullable: true,
    },
    {
      universalIdentifier: VYLINO_WHATSAPP_PROVIDER_FIELD_ID,
      type: FieldType.SELECT,
      name: 'provider',
      label: 'Provider',
      icon: 'IconPlugConnected',
      options: [
        { id: 'bc592dbd-0fde-4174-9cb9-0870664601a5', value: VylinoWhatsAppProvider.META_CLOUD, label: 'Meta Cloud API', position: 0, color: 'green' },
        { id: 'bb89ffa1-a398-488c-b00c-236b8f319039', value: VylinoWhatsAppProvider.EVOLUTION, label: 'Evolution API', position: 1, color: 'blue' },
      ],
    },
    {
      universalIdentifier: VYLINO_WHATSAPP_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconStatusChange',
      options: [
        { id: '92b51125-9125-4c48-8ebf-64fad2212338', value: VylinoWhatsAppConversationStatus.OPEN, label: 'Open', position: 0, color: 'blue' },
        { id: '89f2239e-119a-4dda-84d1-59c461bf8bc3', value: VylinoWhatsAppConversationStatus.WAITING_CUSTOMER, label: 'Waiting Customer', position: 1, color: 'yellow' },
        { id: 'e3ba05f8-fb49-4ed0-b038-1a985bf15f03', value: VylinoWhatsAppConversationStatus.WAITING_PAYMENT, label: 'Waiting Payment', position: 2, color: 'orange' },
        { id: '2a332260-b7aa-442f-9db8-6cb55e820762', value: VylinoWhatsAppConversationStatus.HUMAN_HANDOFF, label: 'Human Handoff', position: 3, color: 'purple' },
        { id: '44a6a97b-e59d-4d20-85cd-7895ae29bfe7', value: VylinoWhatsAppConversationStatus.WON, label: 'Won', position: 4, color: 'green' },
        { id: '9f8db924-281d-414b-99e0-6059902214bd', value: VylinoWhatsAppConversationStatus.CLOSED, label: 'Closed', position: 5, color: 'gray' },
        { id: 'bcd84939-3a42-46f6-b4d9-78374e067fca', value: VylinoWhatsAppConversationStatus.OPTED_OUT, label: 'Opted Out', position: 6, color: 'red' },
      ],
    },
    {
      universalIdentifier: VYLINO_WHATSAPP_AUTOMATION_MODE_FIELD_ID,
      type: FieldType.SELECT,
      name: 'automationMode',
      label: 'Automation Mode',
      icon: 'IconRobot',
      options: [
        { id: 'f5ab6189-3714-4e65-9af8-4933cb07c282', value: VylinoWhatsAppAutomationMode.BOT, label: 'Bot', position: 0, color: 'green' },
        { id: 'f0f04de4-f2af-4df2-a2f9-8b91672e9dd1', value: VylinoWhatsAppAutomationMode.ASSISTED, label: 'Assisted', position: 1, color: 'blue' },
        { id: 'f9476170-52b0-4073-843f-cd7ab221c07f', value: VylinoWhatsAppAutomationMode.HUMAN, label: 'Human', position: 2, color: 'purple' },
        { id: 'cdc5dd11-130f-4d3f-8a63-6b9bb1ad03db', value: VylinoWhatsAppAutomationMode.PAUSED, label: 'Paused', position: 3, color: 'gray' },
      ],
    },
    { universalIdentifier: VYLINO_WHATSAPP_PERSON_RECORD_ID_FIELD_ID, type: FieldType.TEXT, name: 'personRecordId', label: 'CRM Person ID', icon: 'IconUser', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_OPPORTUNITY_RECORD_ID_FIELD_ID, type: FieldType.TEXT, name: 'opportunityRecordId', label: 'Opportunity ID', icon: 'IconTargetArrow', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_LAST_INBOUND_AT_FIELD_ID, type: FieldType.DATE_TIME, name: 'lastInboundAt', label: 'Last Inbound', icon: 'IconArrowDownLeft', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_LAST_OUTBOUND_AT_FIELD_ID, type: FieldType.DATE_TIME, name: 'lastOutboundAt', label: 'Last Outbound', icon: 'IconArrowUpRight', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_SERVICE_WINDOW_EXPIRES_AT_FIELD_ID, type: FieldType.DATE_TIME, name: 'serviceWindowExpiresAt', label: 'Service Window Expires', icon: 'IconClock', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_LAST_INTENT_FIELD_ID, type: FieldType.TEXT, name: 'lastIntent', label: 'Last Intent', icon: 'IconMessageQuestion', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_LAST_INTENT_CONFIDENCE_FIELD_ID, type: FieldType.NUMBER, name: 'lastIntentConfidence', label: 'Intent Confidence', icon: 'IconPercentage', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_RECOMMENDED_SERVICE_KEY_FIELD_ID, type: FieldType.TEXT, name: 'recommendedServiceKey', label: 'Recommended Service', icon: 'IconSparkles', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_PAYMENT_STATUS_FIELD_ID, type: FieldType.TEXT, name: 'paymentStatus', label: 'Payment Status', icon: 'IconCreditCard', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_PAYMENT_LINK_URL_FIELD_ID, type: FieldType.TEXT, name: 'paymentLinkUrl', label: 'Payment Link', icon: 'IconLink', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_HUMAN_OWNER_FIELD_ID, type: FieldType.TEXT, name: 'humanOwner', label: 'Human Owner', icon: 'IconUserCheck', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_UNREAD_COUNT_FIELD_ID, type: FieldType.NUMBER, name: 'unreadCount', label: 'Unread', icon: 'IconBell', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_TOTAL_MESSAGES_FIELD_ID, type: FieldType.NUMBER, name: 'totalMessages', label: 'Messages', icon: 'IconMessages', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_LAST_MESSAGE_TEXT_FIELD_ID, type: FieldType.TEXT, name: 'lastMessageText', label: 'Last Message', icon: 'IconMessage', isNullable: true },
  ],
});

import { defineObject, FieldType } from 'twenty-sdk/define';

export enum VylinoWhatsAppMessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum VylinoWhatsAppMessageStatus {
  RECEIVED = 'RECEIVED',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export const VYLINO_WHATSAPP_MESSAGE_OBJECT_ID =
  '61e291df-ecf5-49cf-b04a-ebaa26d87521';
export const VYLINO_WHATSAPP_MESSAGE_EXTERNAL_ID_FIELD_ID =
  'b637080c-a340-491f-897a-7d50a3f768cd';
export const VYLINO_WHATSAPP_MESSAGE_CONVERSATION_KEY_FIELD_ID =
  '62a8713c-7635-4756-8dd5-c2a7d933aa6a';
export const VYLINO_WHATSAPP_MESSAGE_WA_ID_FIELD_ID =
  '1fbe36b9-635c-4303-8831-3cc1816fb772';
export const VYLINO_WHATSAPP_MESSAGE_DIRECTION_FIELD_ID =
  'c51ffd14-53d8-4710-a629-1f005b833711';
export const VYLINO_WHATSAPP_MESSAGE_TYPE_FIELD_ID =
  'f742f64e-32cc-4c37-a98e-b3706f9edad1';
export const VYLINO_WHATSAPP_MESSAGE_BODY_FIELD_ID =
  'b3ab2f02-07f5-4db1-9647-4882e190a0fd';
export const VYLINO_WHATSAPP_MESSAGE_STATUS_FIELD_ID =
  'ebf218ac-fb2a-4464-a254-6d50ec60f0ab';
export const VYLINO_WHATSAPP_MESSAGE_AUTOMATED_FIELD_ID =
  '19002ee4-4d18-4730-a596-a102c768c922';
export const VYLINO_WHATSAPP_MESSAGE_INTENT_FIELD_ID =
  '9eaf1d5e-72c0-4733-b2ea-0b27e08992da';
export const VYLINO_WHATSAPP_MESSAGE_CONFIDENCE_FIELD_ID =
  'f68061d1-4a73-43c8-a788-e3a20f5220df';
export const VYLINO_WHATSAPP_MESSAGE_SENT_AT_FIELD_ID =
  '55362b62-4203-4dab-a597-3c7ee780530d';
export const VYLINO_WHATSAPP_MESSAGE_PROVIDER_ID_FIELD_ID =
  '645510c3-fe76-49e6-bdf4-8cc1e4095e84';
export const VYLINO_WHATSAPP_MESSAGE_ERROR_FIELD_ID =
  'c13b391e-878e-43fc-89aa-f185df7a9707';

export default defineObject({
  universalIdentifier: VYLINO_WHATSAPP_MESSAGE_OBJECT_ID,
  nameSingular: 'vylinoWhatsAppMessage',
  namePlural: 'vylinoWhatsAppMessages',
  labelSingular: 'WhatsApp Message',
  labelPlural: 'WhatsApp Messages',
  description: 'Normalized inbound and outbound WhatsApp message history.',
  icon: 'IconMessage',
  labelIdentifierFieldMetadataUniversalIdentifier:
    VYLINO_WHATSAPP_MESSAGE_EXTERNAL_ID_FIELD_ID,
  fields: [
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_EXTERNAL_ID_FIELD_ID, type: FieldType.TEXT, name: 'externalMessageId', label: 'Message ID', icon: 'IconKey', isUnique: true },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_CONVERSATION_KEY_FIELD_ID, type: FieldType.TEXT, name: 'conversationKey', label: 'Conversation Key', icon: 'IconMessages', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_WA_ID_FIELD_ID, type: FieldType.TEXT, name: 'waId', label: 'WhatsApp ID', icon: 'IconPhone', isNullable: true },
    {
      universalIdentifier: VYLINO_WHATSAPP_MESSAGE_DIRECTION_FIELD_ID,
      type: FieldType.SELECT,
      name: 'direction',
      label: 'Direction',
      icon: 'IconArrowsExchange',
      options: [
        { id: '544737d5-fc94-4e86-86dc-4e22be43cd7c', value: VylinoWhatsAppMessageDirection.INBOUND, label: 'Inbound', position: 0, color: 'blue' },
        { id: 'd805c8ed-8916-4657-baca-be3da85664a9', value: VylinoWhatsAppMessageDirection.OUTBOUND, label: 'Outbound', position: 1, color: 'green' },
      ],
    },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_TYPE_FIELD_ID, type: FieldType.TEXT, name: 'messageType', label: 'Message Type', icon: 'IconFileTypeTxt', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_BODY_FIELD_ID, type: FieldType.TEXT, name: 'body', label: 'Body', icon: 'IconMessage', isNullable: true },
    {
      universalIdentifier: VYLINO_WHATSAPP_MESSAGE_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconChecks',
      options: [
        { id: '24c26b3d-196e-4b46-a2ca-1c799a41a0a1', value: VylinoWhatsAppMessageStatus.RECEIVED, label: 'Received', position: 0, color: 'blue' },
        { id: '3e40926a-a542-44c6-b60c-dd4072da40ff', value: VylinoWhatsAppMessageStatus.QUEUED, label: 'Queued', position: 1, color: 'gray' },
        { id: '37f5e2b4-4fbc-4063-b0c4-1b6d0a9d67ed', value: VylinoWhatsAppMessageStatus.SENT, label: 'Sent', position: 2, color: 'cyan' },
        { id: '80cdece8-9dfe-41dc-98c1-38ccbce42ed4', value: VylinoWhatsAppMessageStatus.DELIVERED, label: 'Delivered', position: 3, color: 'green' },
        { id: '0ae340cd-29d8-4d86-a223-5c3ceab6643a', value: VylinoWhatsAppMessageStatus.READ, label: 'Read', position: 4, color: 'green' },
        { id: 'a4bea6c4-6a29-480b-b5c9-11aa395e6192', value: VylinoWhatsAppMessageStatus.FAILED, label: 'Failed', position: 5, color: 'red' },
      ],
    },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_AUTOMATED_FIELD_ID, type: FieldType.BOOLEAN, name: 'isAutomated', label: 'Automated', icon: 'IconRobot', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_INTENT_FIELD_ID, type: FieldType.TEXT, name: 'intent', label: 'Intent', icon: 'IconMessageQuestion', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_CONFIDENCE_FIELD_ID, type: FieldType.NUMBER, name: 'confidence', label: 'Confidence', icon: 'IconPercentage', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_SENT_AT_FIELD_ID, type: FieldType.DATE_TIME, name: 'messageAt', label: 'Message At', icon: 'IconClock', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_PROVIDER_ID_FIELD_ID, type: FieldType.TEXT, name: 'providerMessageId', label: 'Provider Message ID', icon: 'IconHash', isNullable: true },
    { universalIdentifier: VYLINO_WHATSAPP_MESSAGE_ERROR_FIELD_ID, type: FieldType.TEXT, name: 'error', label: 'Error', icon: 'IconAlertTriangle', isNullable: true },
  ],
});

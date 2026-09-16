import { defineObject, FieldType } from 'twenty-sdk/define';

export enum VylinoPaymentProvider {
  CASHFREE = 'CASHFREE',
  OTHER = 'OTHER',
}

export enum VylinoPaymentRequestStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export const VYLINO_PAYMENT_REQUEST_OBJECT_ID =
  '2be33d7f-77bf-437c-bef8-99c4e5642557';
export const VYLINO_PAYMENT_KEY_FIELD_ID =
  '41e7131c-28ad-4dbf-8d6c-b563e880c253';
export const VYLINO_PAYMENT_CONVERSATION_KEY_FIELD_ID =
  'aff05aea-7c9d-4495-9899-8f9fffe2980f';
export const VYLINO_PAYMENT_PERSON_ID_FIELD_ID =
  'd32754a4-6129-43d6-be23-2d5a6cd19abf';
export const VYLINO_PAYMENT_PROVIDER_FIELD_ID =
  '6377c8ba-14b7-4418-9cb3-0cfb856c2c57';
export const VYLINO_PAYMENT_AMOUNT_FIELD_ID =
  'aa908573-16bd-4581-9ffd-8038eb331815';
export const VYLINO_PAYMENT_CURRENCY_FIELD_ID =
  '68a2ff16-459b-4421-ab45-55b01ad845f7';
export const VYLINO_PAYMENT_STATUS_FIELD_ID =
  'c3b4777d-75d0-4b0a-99ca-5cc55567ed42';
export const VYLINO_PAYMENT_LINK_URL_FIELD_ID =
  '754b7333-b90d-40d3-834b-347be7449381';
export const VYLINO_PAYMENT_PURPOSE_FIELD_ID =
  'd5365c17-62aa-4bc5-8916-6673d561c8ce';
export const VYLINO_PAYMENT_EXTERNAL_ID_FIELD_ID =
  'dcaf7c25-b7de-45b0-a58b-27128a39d44d';
export const VYLINO_PAYMENT_PAID_AT_FIELD_ID =
  '57f3ea97-3055-41c4-aed7-1d333c3e2eca';
export const VYLINO_PAYMENT_EXPIRES_AT_FIELD_ID =
  'bc592dbd-0fde-4174-9cb9-0870664601a5';

export default defineObject({
  universalIdentifier: VYLINO_PAYMENT_REQUEST_OBJECT_ID,
  nameSingular: 'vylinoPaymentRequest',
  namePlural: 'vylinoPaymentRequests',
  labelSingular: 'Payment Request',
  labelPlural: 'Payment Requests',
  description: 'Payment links generated from CRM and WhatsApp conversations.',
  icon: 'IconCreditCardPay',
  labelIdentifierFieldMetadataUniversalIdentifier: VYLINO_PAYMENT_KEY_FIELD_ID,
  fields: [
    { universalIdentifier: VYLINO_PAYMENT_KEY_FIELD_ID, type: FieldType.TEXT, name: 'paymentKey', label: 'Payment Key', icon: 'IconKey', isUnique: true },
    { universalIdentifier: VYLINO_PAYMENT_CONVERSATION_KEY_FIELD_ID, type: FieldType.TEXT, name: 'conversationKey', label: 'Conversation Key', icon: 'IconBrandWhatsapp', isNullable: true },
    { universalIdentifier: VYLINO_PAYMENT_PERSON_ID_FIELD_ID, type: FieldType.TEXT, name: 'personRecordId', label: 'CRM Person ID', icon: 'IconUser', isNullable: true },
    {
      universalIdentifier: VYLINO_PAYMENT_PROVIDER_FIELD_ID,
      type: FieldType.SELECT,
      name: 'provider',
      label: 'Provider',
      icon: 'IconBuildingBank',
      options: [
        { id: '15650edd-be33-4d2b-b76b-6feb1ffca602', value: VylinoPaymentProvider.CASHFREE, label: 'Cashfree', position: 0, color: 'blue' },
        { id: '40784b2b-c501-4441-ba07-a510c0e9c997', value: VylinoPaymentProvider.OTHER, label: 'Other', position: 1, color: 'gray' },
      ],
    },
    { universalIdentifier: VYLINO_PAYMENT_AMOUNT_FIELD_ID, type: FieldType.NUMBER, name: 'amount', label: 'Amount', icon: 'IconCurrencyRupee' },
    { universalIdentifier: VYLINO_PAYMENT_CURRENCY_FIELD_ID, type: FieldType.TEXT, name: 'currencyCode', label: 'Currency', icon: 'IconCash', isNullable: true },
    {
      universalIdentifier: VYLINO_PAYMENT_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconChecks',
      options: [
        { id: 'aa8ff1b7-e714-4b7b-b93c-b86649d8af81', value: VylinoPaymentRequestStatus.DRAFT, label: 'Draft', position: 0, color: 'gray' },
        { id: '94416456-99ad-4631-96fe-4afd7602140d', value: VylinoPaymentRequestStatus.ACTIVE, label: 'Active', position: 1, color: 'blue' },
        { id: '87d539ab-fb98-4047-bc26-886b9268dc86', value: VylinoPaymentRequestStatus.PARTIALLY_PAID, label: 'Partially Paid', position: 2, color: 'yellow' },
        { id: 'fb229143-eeb5-4666-8202-50da710390a6', value: VylinoPaymentRequestStatus.PAID, label: 'Paid', position: 3, color: 'green' },
        { id: '3b8b54a5-d3fd-4ed2-96bb-9f34aaec2088', value: VylinoPaymentRequestStatus.FAILED, label: 'Failed', position: 4, color: 'red' },
        { id: '5d059128-c896-468e-be37-c6131d6ef9b6', value: VylinoPaymentRequestStatus.CANCELLED, label: 'Cancelled', position: 5, color: 'gray' },
        { id: 'e191e18c-4f89-40f3-ad07-699278c47770', value: VylinoPaymentRequestStatus.EXPIRED, label: 'Expired', position: 6, color: 'orange' },
      ],
    },
    { universalIdentifier: VYLINO_PAYMENT_LINK_URL_FIELD_ID, type: FieldType.TEXT, name: 'linkUrl', label: 'Payment Link', icon: 'IconLink', isNullable: true },
    { universalIdentifier: VYLINO_PAYMENT_PURPOSE_FIELD_ID, type: FieldType.TEXT, name: 'purpose', label: 'Purpose', icon: 'IconFileDescription', isNullable: true },
    { universalIdentifier: VYLINO_PAYMENT_EXTERNAL_ID_FIELD_ID, type: FieldType.TEXT, name: 'externalPaymentId', label: 'Provider Link ID', icon: 'IconHash', isNullable: true },
    { universalIdentifier: VYLINO_PAYMENT_PAID_AT_FIELD_ID, type: FieldType.DATE_TIME, name: 'paidAt', label: 'Paid At', icon: 'IconCalendarCheck', isNullable: true },
    { universalIdentifier: VYLINO_PAYMENT_EXPIRES_AT_FIELD_ID, type: FieldType.DATE_TIME, name: 'expiresAt', label: 'Expires At', icon: 'IconCalendarTime', isNullable: true },
  ],
});

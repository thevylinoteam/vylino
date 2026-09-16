import { defineView, ViewType } from 'twenty-sdk/define';

import {
  VYLINO_PAYMENT_AMOUNT_FIELD_ID,
  VYLINO_PAYMENT_CONVERSATION_KEY_FIELD_ID,
  VYLINO_PAYMENT_CURRENCY_FIELD_ID,
  VYLINO_PAYMENT_EXPIRES_AT_FIELD_ID,
  VYLINO_PAYMENT_KEY_FIELD_ID,
  VYLINO_PAYMENT_LINK_URL_FIELD_ID,
  VYLINO_PAYMENT_PAID_AT_FIELD_ID,
  VYLINO_PAYMENT_PROVIDER_FIELD_ID,
  VYLINO_PAYMENT_PURPOSE_FIELD_ID,
  VYLINO_PAYMENT_REQUEST_OBJECT_ID,
  VYLINO_PAYMENT_STATUS_FIELD_ID,
} from '../objects/payment-request.object';

export default defineView({
  universalIdentifier: 'e9048c4c-bdbc-463f-926b-a67bad41ba97',
  name: 'Payment Requests',
  objectUniversalIdentifier: VYLINO_PAYMENT_REQUEST_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconCreditCardPay',
  position: 0,
  fields: [
    { universalIdentifier: 'bf7afe05-4262-44a6-bd94-463f7eb037c1', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_KEY_FIELD_ID, position: 0, isVisible: true, size: 190 },
    { universalIdentifier: '641f0c59-54dd-4a4f-97f0-d26f3cfd8057', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_PURPOSE_FIELD_ID, position: 1, isVisible: true, size: 220 },
    { universalIdentifier: '891c6c39-3db1-4db7-86ab-bdd7b84d7d7f', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_AMOUNT_FIELD_ID, position: 2, isVisible: true, size: 110 },
    { universalIdentifier: 'aafb3878-872d-4965-bdcf-1406400d5bfc', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_CURRENCY_FIELD_ID, position: 3, isVisible: true, size: 90 },
    { universalIdentifier: '71912c7c-c2c4-42fb-8007-dc8ca116adc9', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_STATUS_FIELD_ID, position: 4, isVisible: true, size: 130 },
    { universalIdentifier: 'c4cd2c28-128f-4baa-86f1-4f0f5b5f90d0', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_PROVIDER_FIELD_ID, position: 5, isVisible: true, size: 120 },
    { universalIdentifier: '0f00499f-40b1-49c4-b27b-32d3f0c21cbc', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_LINK_URL_FIELD_ID, position: 6, isVisible: true, size: 280 },
    { universalIdentifier: 'b2303ff0-fed7-4883-ab71-a70a8eaa6ee0', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_PAID_AT_FIELD_ID, position: 7, isVisible: true, size: 160 },
    { universalIdentifier: '658c308c-19ab-4c85-95c4-4945ad503fdc', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_EXPIRES_AT_FIELD_ID, position: 8, isVisible: true, size: 160 },
    { universalIdentifier: 'c47b8d47-c91c-4249-8f92-fa2332d8d375', fieldMetadataUniversalIdentifier: VYLINO_PAYMENT_CONVERSATION_KEY_FIELD_ID, position: 9, isVisible: false, size: 220 },
  ],
});

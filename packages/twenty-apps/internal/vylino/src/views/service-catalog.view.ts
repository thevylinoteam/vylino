import { defineView, ViewType } from 'twenty-sdk/define';

import {
  VYLINO_SERVICE_ACTIVE_FIELD_ID,
  VYLINO_SERVICE_CATEGORY_FIELD_ID,
  VYLINO_SERVICE_CATALOG_OBJECT_ID,
  VYLINO_SERVICE_CURRENCY_FIELD_ID,
  VYLINO_SERVICE_DESCRIPTION_FIELD_ID,
  VYLINO_SERVICE_KEY_FIELD_ID,
  VYLINO_SERVICE_KEYWORDS_FIELD_ID,
  VYLINO_SERVICE_NAME_FIELD_ID,
  VYLINO_SERVICE_PAYMENT_REQUIRED_FIELD_ID,
  VYLINO_SERVICE_PRICE_FIELD_ID,
  VYLINO_SERVICE_PRIORITY_FIELD_ID,
} from '../objects/service-catalog.object';

export default defineView({
  universalIdentifier: 'c294a3aa-0b04-43fc-99a5-4d6542fcc03a',
  name: 'WhatsApp Service Catalog',
  objectUniversalIdentifier: VYLINO_SERVICE_CATALOG_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconPackages',
  position: 0,
  fields: [
    { universalIdentifier: '5e444717-e59d-44e1-8c56-9f59c78fe8a7', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '11f784bd-30e4-4c40-9168-1253264aaf34', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_CATEGORY_FIELD_ID, position: 1, isVisible: true, size: 170 },
    { universalIdentifier: '4a724666-2c83-4791-81c9-e1f0425b1f4d', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_PRICE_FIELD_ID, position: 2, isVisible: true, size: 110 },
    { universalIdentifier: '58bcf0e0-d23d-431c-b674-2f736d12ed67', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_CURRENCY_FIELD_ID, position: 3, isVisible: true, size: 90 },
    { universalIdentifier: '54642117-9a02-46aa-8f47-95832e3f4d83', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_ACTIVE_FIELD_ID, position: 4, isVisible: true, size: 90 },
    { universalIdentifier: '76912877-6f4f-4d20-b9a4-d38ba3c6d832', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_PAYMENT_REQUIRED_FIELD_ID, position: 5, isVisible: true, size: 140 },
    { universalIdentifier: '0b634faf-26c2-4557-84e0-83bc906d7e26', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_PRIORITY_FIELD_ID, position: 6, isVisible: true, size: 90 },
    { universalIdentifier: '7b8bd412-8272-4ad2-9aec-f87c6c50950f', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_DESCRIPTION_FIELD_ID, position: 7, isVisible: true, size: 300 },
    { universalIdentifier: '8c3387c6-6080-42e6-b82f-9974198caada', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_KEYWORDS_FIELD_ID, position: 8, isVisible: true, size: 280 },
    { universalIdentifier: '1af1149b-c845-4e03-84d8-1d0cf274c7eb', fieldMetadataUniversalIdentifier: VYLINO_SERVICE_KEY_FIELD_ID, position: 9, isVisible: false, size: 180 },
  ],
});

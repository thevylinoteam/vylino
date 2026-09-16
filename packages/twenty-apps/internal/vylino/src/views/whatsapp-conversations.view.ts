import { defineView, ViewType } from 'twenty-sdk/define';

import {
  VYLINO_WHATSAPP_AUTOMATION_MODE_FIELD_ID,
  VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID,
  VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
  VYLINO_WHATSAPP_DISPLAY_NAME_FIELD_ID,
  VYLINO_WHATSAPP_HUMAN_OWNER_FIELD_ID,
  VYLINO_WHATSAPP_LAST_INBOUND_AT_FIELD_ID,
  VYLINO_WHATSAPP_LAST_MESSAGE_TEXT_FIELD_ID,
  VYLINO_WHATSAPP_PAYMENT_STATUS_FIELD_ID,
  VYLINO_WHATSAPP_RECOMMENDED_SERVICE_KEY_FIELD_ID,
  VYLINO_WHATSAPP_STATUS_FIELD_ID,
  VYLINO_WHATSAPP_UNREAD_COUNT_FIELD_ID,
  VYLINO_WHATSAPP_WA_ID_FIELD_ID,
} from '../objects/whatsapp-conversation.object';

export default defineView({
  universalIdentifier: '5ad337a6-cd38-4822-b440-6353a2e300c4',
  name: 'WhatsApp Conversations',
  objectUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconBrandWhatsapp',
  position: 0,
  fields: [
    { universalIdentifier: 'ec02292c-4402-4f04-b9ee-b7acd45e676b', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_DISPLAY_NAME_FIELD_ID, position: 0, isVisible: true, size: 180 },
    { universalIdentifier: 'a83c03a2-67c2-4b37-a500-612e05d00525', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_WA_ID_FIELD_ID, position: 1, isVisible: true, size: 150 },
    { universalIdentifier: '3e632ceb-f7a0-4cae-bb35-03fa66da91e0', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_STATUS_FIELD_ID, position: 2, isVisible: true, size: 150 },
    { universalIdentifier: '2bbb978d-1145-4244-ba62-7fe94c6ac198', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_AUTOMATION_MODE_FIELD_ID, position: 3, isVisible: true, size: 140 },
    { universalIdentifier: '7a2fdd10-b8da-4bae-beac-f60451234f87', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_RECOMMENDED_SERVICE_KEY_FIELD_ID, position: 4, isVisible: true, size: 190 },
    { universalIdentifier: '7a8e1fde-5c1f-473d-bcb1-409d8c1e9a91', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_PAYMENT_STATUS_FIELD_ID, position: 5, isVisible: true, size: 130 },
    { universalIdentifier: 'ff248fe1-066a-4930-9a58-bfade1d12060', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_UNREAD_COUNT_FIELD_ID, position: 6, isVisible: true, size: 90 },
    { universalIdentifier: '30a6c740-6e36-4c89-a90a-b67d59c3a6db', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_HUMAN_OWNER_FIELD_ID, position: 7, isVisible: true, size: 150 },
    { universalIdentifier: '3d5f2a83-2176-4d62-a675-d30890be0efc', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_LAST_INBOUND_AT_FIELD_ID, position: 8, isVisible: true, size: 170 },
    { universalIdentifier: 'fcf5026c-f873-4198-a6a4-c961c5ddfcbd', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_LAST_MESSAGE_TEXT_FIELD_ID, position: 9, isVisible: true, size: 320 },
    { universalIdentifier: '59c4ffb4-493e-4928-886f-b9c0b1e84a5f', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_CONVERSATION_KEY_FIELD_ID, position: 10, isVisible: false, size: 220 },
  ],
});

import { defineView, ViewType } from 'twenty-sdk/define';

import {
  VYLINO_WHATSAPP_MESSAGE_AUTOMATED_FIELD_ID,
  VYLINO_WHATSAPP_MESSAGE_BODY_FIELD_ID,
  VYLINO_WHATSAPP_MESSAGE_CONVERSATION_KEY_FIELD_ID,
  VYLINO_WHATSAPP_MESSAGE_DIRECTION_FIELD_ID,
  VYLINO_WHATSAPP_MESSAGE_EXTERNAL_ID_FIELD_ID,
  VYLINO_WHATSAPP_MESSAGE_INTENT_FIELD_ID,
  VYLINO_WHATSAPP_MESSAGE_OBJECT_ID,
  VYLINO_WHATSAPP_MESSAGE_SENT_AT_FIELD_ID,
  VYLINO_WHATSAPP_MESSAGE_STATUS_FIELD_ID,
  VYLINO_WHATSAPP_MESSAGE_TYPE_FIELD_ID,
  VYLINO_WHATSAPP_MESSAGE_WA_ID_FIELD_ID,
} from '../objects/whatsapp-message.object';

export default defineView({
  universalIdentifier: '6cb75c4a-27cc-4149-a614-e5ee006b66dc',
  name: 'WhatsApp Messages',
  objectUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconMessages',
  position: 0,
  fields: [
    { universalIdentifier: '11adcded-09a3-4eab-9bed-7312ef569bb2', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_SENT_AT_FIELD_ID, position: 0, isVisible: true, size: 170 },
    { universalIdentifier: 'f42b1596-01e4-4341-abd3-11db8625161e', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_WA_ID_FIELD_ID, position: 1, isVisible: true, size: 150 },
    { universalIdentifier: '6ce64f09-6609-4174-8137-751fe48cb19f', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_DIRECTION_FIELD_ID, position: 2, isVisible: true, size: 110 },
    { universalIdentifier: 'b2b25849-cf1a-4301-bff3-8b8d77823949', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_STATUS_FIELD_ID, position: 3, isVisible: true, size: 120 },
    { universalIdentifier: '8897ea6a-530b-4723-b743-7eea79627ee2', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_TYPE_FIELD_ID, position: 4, isVisible: true, size: 110 },
    { universalIdentifier: '92d68dc2-fb19-40a2-98aa-5cca3dc1aa29', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_INTENT_FIELD_ID, position: 5, isVisible: true, size: 150 },
    { universalIdentifier: 'c9fbb5db-15d9-4c15-b27b-0e737c45a673', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_AUTOMATED_FIELD_ID, position: 6, isVisible: true, size: 100 },
    { universalIdentifier: '44511965-f2bf-4291-ab4b-e6c8ef0e9665', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_BODY_FIELD_ID, position: 7, isVisible: true, size: 380 },
    { universalIdentifier: '657c76bc-a0e7-450c-a488-070b1429f2ee', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_CONVERSATION_KEY_FIELD_ID, position: 8, isVisible: false, size: 220 },
    { universalIdentifier: 'a6578f84-4cfe-4c54-b708-3b6daa8cd08b', fieldMetadataUniversalIdentifier: VYLINO_WHATSAPP_MESSAGE_EXTERNAL_ID_FIELD_ID, position: 9, isVisible: false, size: 220 },
  ],
});

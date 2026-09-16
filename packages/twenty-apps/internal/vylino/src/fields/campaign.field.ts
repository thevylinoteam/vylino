import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const VYLINO_CAMPAIGN_FIELD_ID =
  'fb147763-a951-4e2f-a239-0a240815cbe6';

export default defineField({
  universalIdentifier: VYLINO_CAMPAIGN_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'campaign',
  label: 'Campaign',
  description: 'Marketing or outreach campaign associated with this lead.',
  icon: 'IconSpeakerphone',
  isNullable: true,
});

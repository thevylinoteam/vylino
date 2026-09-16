import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '2b1388e7-20bb-4a63-8ca4-e5e74c1c84bd',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'utmCampaign',
  label: 'UTM Campaign',
  description: 'Captured utm_campaign value.',
  icon: 'IconTag',
  isNullable: true,
});

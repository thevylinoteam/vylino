import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'd61997c3-d1cc-4469-acc7-ec81a7ed585e',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'utmMedium',
  label: 'UTM Medium',
  description: 'Captured utm_medium value.',
  icon: 'IconTag',
  isNullable: true,
});

import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '743a8c06-3109-4117-a6c8-710a80af79a9',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'utmTerm',
  label: 'UTM Term',
  description: 'Captured utm_term value.',
  icon: 'IconTag',
  isNullable: true,
});

import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '0454ad64-03f4-47f5-85ed-de43fae5b83d',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'utmSource',
  label: 'UTM Source',
  description: 'Captured utm_source value.',
  icon: 'IconTag',
  isNullable: true,
});

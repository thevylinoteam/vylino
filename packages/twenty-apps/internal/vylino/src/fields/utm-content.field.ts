import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '6a6668ee-fb0f-4f67-a012-119f78b0c837',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'utmContent',
  label: 'UTM Content',
  description: 'Captured utm_content value.',
  icon: 'IconTag',
  isNullable: true,
});

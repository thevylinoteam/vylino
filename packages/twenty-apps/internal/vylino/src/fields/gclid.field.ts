import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '2639ba28-1450-441e-a28a-f8b864d70e10',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'gclid',
  label: 'Google Click ID',
  description: 'Google Ads click identifier captured for attribution.',
  icon: 'IconBrandGoogle',
  isNullable: true,
});

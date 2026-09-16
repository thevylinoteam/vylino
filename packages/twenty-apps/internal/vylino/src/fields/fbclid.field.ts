import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '30e0f54d-cb0e-4978-8617-6b6ce615deef',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'fbclid',
  label: 'Meta Click ID',
  description: 'Meta/Facebook click identifier captured for attribution.',
  icon: 'IconBrandMeta',
  isNullable: true,
});

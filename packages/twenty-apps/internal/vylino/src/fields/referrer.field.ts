import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '9c35c335-d720-4060-8fbf-3968f0a54280',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'referrer',
  label: 'Referrer',
  description: 'Referring URL or source page captured for this lead.',
  icon: 'IconExternalLink',
  isNullable: true,
});

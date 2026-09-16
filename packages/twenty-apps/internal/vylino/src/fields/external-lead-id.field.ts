import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '11efd4db-74f1-448d-8c2c-f3bfe2e52d8f',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'externalLeadId',
  label: 'External Lead ID',
  description: 'Provider-side lead identifier when the lead originated externally.',
  icon: 'IconId',
  isNullable: true,
});

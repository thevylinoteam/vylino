import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '2b4e50f4-272e-4129-90a4-0bf68d38d34a',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'landingPage',
  label: 'Landing Page',
  description: 'First known landing page for the lead.',
  icon: 'IconWorldWww',
  isNullable: true,
});

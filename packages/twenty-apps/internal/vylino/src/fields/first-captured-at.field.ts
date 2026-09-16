import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'f021fba3-07cc-47d9-9162-f8c118aaf4ea',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'firstCapturedAt',
  label: 'First Captured At',
  description: 'Earliest known time this lead was captured.',
  icon: 'IconClock',
  isNullable: true,
});

import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const VYLINO_LEAD_SCORE_FIELD_ID =
  '7f7bcac5-0c73-43f1-8d17-6b7b021f65a5';

export default defineField({
  universalIdentifier: VYLINO_LEAD_SCORE_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'leadScore',
  label: 'Lead Score',
  description: 'Vylino sales qualification score for prioritizing leads.',
  icon: 'IconGauge',
  isNullable: true,
});

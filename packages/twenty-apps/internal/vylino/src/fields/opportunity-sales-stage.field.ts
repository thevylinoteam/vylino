import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const VYLINO_SALES_STAGE_FIELD_ID =
  '5feee1f3-dc10-458f-85c1-bbfc01a8f9fd';

export enum VylinoSalesStage {
  NEW_LEAD = 'NEW_LEAD',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  MEETING = 'MEETING',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

export const VYLINO_SALES_STAGE_OPTIONS = [
  { id: '6bed999d-486f-4c74-a5c7-350b8800941f', value: VylinoSalesStage.NEW_LEAD, label: 'New Lead', position: 0, color: 'gray' as const },
  { id: '2da9f671-c23f-4c7c-a796-e84eb24192a6', value: VylinoSalesStage.CONTACTED, label: 'Contacted', position: 1, color: 'blue' as const },
  { id: 'ea71d61a-577f-433e-a841-12c5a6ab85b6', value: VylinoSalesStage.QUALIFIED, label: 'Qualified', position: 2, color: 'cyan' as const },
  { id: '611ac736-92af-4ba4-8bbf-fc728127b470', value: VylinoSalesStage.MEETING, label: 'Meeting', position: 3, color: 'purple' as const },
  { id: 'f42a493a-f1ee-4544-a02f-5ef49865811f', value: VylinoSalesStage.PROPOSAL_SENT, label: 'Proposal Sent', position: 4, color: 'orange' as const },
  { id: '79faf568-4088-40d8-92b1-f7edc593c432', value: VylinoSalesStage.NEGOTIATION, label: 'Negotiation', position: 5, color: 'yellow' as const },
  { id: '7280a235-6641-431f-857e-73309682106c', value: VylinoSalesStage.WON, label: 'Won', position: 6, color: 'green' as const },
  { id: 'af82eebd-dc74-4baa-b926-5158fcc69b59', value: VylinoSalesStage.LOST, label: 'Lost', position: 7, color: 'red' as const },
];

export default defineField({
  universalIdentifier: VYLINO_SALES_STAGE_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'vylinoSalesStage',
  label: 'Vylino Sales Stage',
  description: 'Vylino sales pipeline stage for this opportunity.',
  icon: 'IconRoute',
  isNullable: true,
  options: VYLINO_SALES_STAGE_OPTIONS,
});

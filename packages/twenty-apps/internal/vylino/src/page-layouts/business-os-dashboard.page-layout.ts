import {
  AggregateOperations,
  definePageLayout,
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { VYLINO_NEXT_FOLLOW_UP_FIELD_ID } from '../fields/next-follow-up.field';
import {
  VYLINO_SALES_STAGE_FIELD_ID,
  VylinoSalesStage,
} from '../fields/opportunity-sales-stage.field';

export const VYLINO_BUSINESS_OS_DASHBOARD_PAGE_LAYOUT_ID =
  '0b3ca0ae-0d90-465c-8757-4aebee3ab1bc';

const personObjectId =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier;
const personFields = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields;
const opportunityObjectId =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier;
const opportunityFields =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields;

const LEAD_SOURCE_FIELD_ID = '82d058eb-b032-4432-9de3-cd195501f513';
const LEAD_CHANNEL_FIELD_ID = '580af541-b442-4950-8b73-6c97923832ff';
const SERVICE_INTEREST_FIELD_ID = 'e134d7bb-9cb7-424a-9c53-e1dc61441547';

const BAR = {
  layout: 'VERTICAL',
  primaryAxisOrderBy: 'VALUE_DESC',
  axisNameDisplay: 'NONE',
  color: 'auto',
  timezone: 'Asia/Kolkata',
  firstDayOfTheWeek: 1,
} as const;

const leadFilter = {
  recordFilters: [
    {
      fieldMetadataUniversalIdentifier: LEAD_SOURCE_FIELD_ID,
      operand: 'IS_NOT_EMPTY',
      value: '',
    },
  ],
};

export default definePageLayout({
  universalIdentifier: VYLINO_BUSINESS_OS_DASHBOARD_PAGE_LAYOUT_ID,
  name: 'Vylino Business OS',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: '5ba88d9c-a3fa-4e68-ac0e-bbe3868bfb4b',
      title: 'Overview',
      position: 0,
      icon: 'IconLayoutDashboard',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: '887ece72-663c-43b9-9b35-1d9ecf6bfe3c',
          title: 'Leads',
          type: 'GRAPH',
          objectUniversalIdentifier: personObjectId,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 0,
            column: 0,
            rowSpan: 2,
            columnSpan: 3,
          },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              personFields.name.universalIdentifier,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
            filter: leadFilter,
          },
        },
        {
          universalIdentifier: '1f455d37-f041-43d1-8074-cef1dbf5c922',
          title: 'Pipeline value',
          type: 'GRAPH',
          objectUniversalIdentifier: opportunityObjectId,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 0,
            column: 3,
            rowSpan: 2,
            columnSpan: 3,
          },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              opportunityFields.amount.universalIdentifier,
            aggregateOperation: AggregateOperations.SUM,
            displayDataLabel: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier: VYLINO_SALES_STAGE_FIELD_ID,
                  operand: 'IS_NOT_EMPTY',
                  value: '',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: '580d5403-323e-475b-9a11-49bd40c17b37',
          title: 'Won deals',
          type: 'GRAPH',
          objectUniversalIdentifier: opportunityObjectId,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 0,
            column: 6,
            rowSpan: 2,
            columnSpan: 3,
          },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              opportunityFields.name.universalIdentifier,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier: VYLINO_SALES_STAGE_FIELD_ID,
                  operand: 'IS',
                  value: `["${VylinoSalesStage.WON}"]`,
                },
              ],
            },
          },
        },
        {
          universalIdentifier: '4ab9ae51-170c-42ba-8e7e-610f98c49b11',
          title: 'Follow-ups scheduled',
          type: 'GRAPH',
          objectUniversalIdentifier: personObjectId,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 0,
            column: 9,
            rowSpan: 2,
            columnSpan: 3,
          },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              personFields.name.universalIdentifier,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier:
                    VYLINO_NEXT_FOLLOW_UP_FIELD_ID,
                  operand: 'IS_NOT_EMPTY',
                  value: '',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: 'ea5c3169-3914-46ce-9335-133597e8bd1b',
          title: 'Leads by source',
          type: 'GRAPH',
          objectUniversalIdentifier: personObjectId,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 2,
            column: 0,
            rowSpan: 5,
            columnSpan: 6,
          },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              personFields.name.universalIdentifier,
            aggregateOperation: AggregateOperations.COUNT,
            groupByFieldMetadataUniversalIdentifier: LEAD_SOURCE_FIELD_ID,
            displayLegend: true,
            timezone: 'Asia/Kolkata',
            firstDayOfTheWeek: 1,
            filter: leadFilter,
          },
        },
        {
          universalIdentifier: '95a05e46-c681-4c32-b63b-b2e22f67a05e',
          title: 'Sales pipeline',
          type: 'GRAPH',
          objectUniversalIdentifier: opportunityObjectId,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 2,
            column: 6,
            rowSpan: 5,
            columnSpan: 6,
          },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              opportunityFields.name.universalIdentifier,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              VYLINO_SALES_STAGE_FIELD_ID,
            ...BAR,
          },
        },
        {
          universalIdentifier: '23581345-3bf6-431e-97d0-4669096310c1',
          title: 'Leads by service',
          type: 'GRAPH',
          objectUniversalIdentifier: personObjectId,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 7,
            column: 0,
            rowSpan: 5,
            columnSpan: 6,
          },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              personFields.name.universalIdentifier,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              SERVICE_INTEREST_FIELD_ID,
            ...BAR,
            filter: leadFilter,
          },
        },
        {
          universalIdentifier: '53c5f717-68b6-484d-9838-8eacb871fcd5',
          title: 'Leads by channel',
          type: 'GRAPH',
          objectUniversalIdentifier: personObjectId,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 7,
            column: 6,
            rowSpan: 5,
            columnSpan: 6,
          },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              personFields.name.universalIdentifier,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              LEAD_CHANNEL_FIELD_ID,
            ...BAR,
            filter: leadFilter,
          },
        },
      ],
    },
  ],
});

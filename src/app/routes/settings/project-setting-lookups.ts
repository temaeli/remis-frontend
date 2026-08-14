import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { defineLookup, entityLinkPanels, lookupRefGqlFields, LookupModule } from '@shared/lookup';
import { ASSET } from '@routes/asset-management/asset-lookups';
import { taskLinkPanels } from './task-links';
import { unitLinkPanels } from '@routes/unit-management/unit-links';

/**
 * The project delivery configuration — `modules.setting.project` on the backend,
 * and so a settings group here, alongside general, reference and billing.
 *
 * Kept apart from the project management module, which holds the register itself
 * and the taxonomy that classifies it: these are the tables a project is planned
 * and measured against — its tasks and activities, the milestones and phases they
 * run through, the parameters it is scored on, and the floors and units it is
 * broken into.
 *
 * Every one is a `CoreNamedEntity` on the same five-operation API, so they are
 * declared here as configs and rendered by the shared lookup screens.
 *
 * Every field below is `@NotBlank` or `@NotNull` on its DTO, which SPQR publishes
 * as a non-null input field — so a form that omits one is rejected at variable
 * coercion, before the resolver runs and before any message the DTO carries can
 * be returned. The forms therefore mirror the DTOs exactly.
 */

/** A required number. Left to the grid's own columns rather than spanning a row. */
const numberField = (key: string, label: string): FieldConfig => ({
  key,
  label,
  type: FieldType.input,
  inputType: 'number',
  validations: [VALIDATOR_REQUIRED],
});

/** The survey point the located tables all carry. */
const coordinateFields = (): FieldConfig[] => [
  numberField('latitude', 'Latitude'),
  numberField('longitude', 'Longitude'),
];

const coordinateGqlFields = `
  latitude
  longitude
`;

/** A select over another table, all of which key on `id`. */
const refSelect = (key: string, label: string, query: unknown): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query },
  },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/**
 * The people register, which has no lookup screen of its own — bio_data is the
 * party record, not configuration — but is what the actor and connected-by
 * columns point at.
 */
const ALL_PEOPLE = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

const personSelect = (key: string, label: string): FieldConfig =>
  refSelect(key, label, ALL_PEOPLE);

//  The work: what a project is broken into, and what it runs through.

export const ACTIVITY = defineLookup({
  slug: 'activities',
  entity: 'Activity',
  // The backend publishes `allActivitys`, not `allActivities`. The plural has to
  // match what it named, not what English would.
  entityPlural: 'Activitys',
  permission: 'ACTIVITY',
  label: 'Activity',
  pluralLabel: 'Activities',
  subtitle: 'The work a task is made of',
  icon: 'work',
});

export const TASK = defineLookup({
  slug: 'tasks',
  entity: 'Task',
  entityPlural: 'Tasks',
  permission: 'TASK',
  label: 'Task',
  pluralLabel: 'Tasks',
  subtitle: 'Units of work a project is planned in',
  icon: 'assignment',
  // A task is a bare catalogue row on its own table; everything it relates to
  // hangs off a join table with its own link/unlink pair. One panel each.
  extraContents: (comp, record) => taskLinkPanels(comp, record?.id),
});

export const DELIVERABLE = defineLookup({
  slug: 'deliverables',
  entity: 'Deliverable',
  entityPlural: 'Deliverables',
  permission: 'DELIVERABLE',
  label: 'Deliverable',
  pluralLabel: 'Deliverables',
  subtitle: 'What a project is expected to produce, and what each counts for',
  icon: 'layers',
  extraGqlFields: `
  weight
`,
  extraFields: [numberField('weight', 'Weight')],
  extraColumns: ['weight'],
});

export const MILESTONE = defineLookup({
  slug: 'milestones',
  entity: 'Milestone',
  entityPlural: 'Milestones',
  permission: 'MILESTONE',
  label: 'Milestone',
  pluralLabel: 'Milestones',
  subtitle: 'The points a project is measured against',
  icon: 'flag',
  extraGqlFields: `
  weight
  ${coordinateGqlFields}
`,
  extraFields: [numberField('weight', 'Weight'), ...coordinateFields()],
  extraColumns: ['weight'],
});

export const PHASE = defineLookup({
  slug: 'phases',
  entity: 'Phase',
  entityPlural: 'Phases',
  permission: 'PHASE',
  label: 'Phase',
  pluralLabel: 'Phases',
  subtitle: 'The stages a project passes through',
  icon: 'timeline',
  extraGqlFields: `
  value
  ${coordinateGqlFields}
`,
  extraFields: [numberField('value', 'Value'), ...coordinateFields()],
  extraColumns: ['value'],
});

export const SITE = defineLookup({
  slug: 'sites',
  entity: 'Site',
  entityPlural: 'Sites',
  permission: 'SITE',
  label: 'Site',
  pluralLabel: 'Sites',
  subtitle: 'Where the work is carried out',
  icon: 'map',
  extraGqlFields: `
  value
  ${coordinateGqlFields}
`,
  extraFields: [numberField('value', 'Value'), ...coordinateFields()],
  extraColumns: ['value'],
});

export const TIMELINE = defineLookup({
  slug: 'timelines',
  entity: 'Timeline',
  entityPlural: 'Timelines',
  permission: 'TIMELINE',
  label: 'Timeline',
  pluralLabel: 'Timelines',
  subtitle: 'The window a piece of work runs in',
  icon: 'event',
  extraGqlFields: `
  startedAt
  completedAt
`,
  extraFields: [
    {
      key: 'startedAt',
      label: 'Started At',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'completedAt',
      label: 'Completed At',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'startedAt', header: 'Started' },
    { field: 'completedAt', header: 'Completed' },
  ],
});

export const MONTH = defineLookup({
  slug: 'months',
  entity: 'Month',
  entityPlural: 'Months',
  permission: 'MONTH',
  label: 'Month',
  pluralLabel: 'Months',
  subtitle: 'The calendar the reporting periods are counted in',
  icon: 'date_range',
  extraGqlFields: `
  order
  days
`,
  extraFields: [numberField('order', 'Order'), numberField('days', 'Days')],
  extraColumns: ['order', 'days'],
});

export const GRADE = defineLookup({
  slug: 'grades',
  entity: 'Grade',
  entityPlural: 'Grades',
  permission: 'GRADE',
  label: 'Grade',
  pluralLabel: 'Grades',
  subtitle: 'The bands a score falls into, and what each is worth',
  icon: 'grade',
  extraGqlFields: `
  weight
  maximum
  minimum
`,
  extraFields: [
    numberField('weight', 'Weight'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
  ],
  extraColumns: ['weight', 'minimum', 'maximum'],
});

export const RISK = defineLookup({
  slug: 'risks',
  entity: 'Risk',
  entityPlural: 'Risks',
  permission: 'RISK',
  label: 'Risk',
  pluralLabel: 'Risks',
  subtitle: 'What a project is exposed to',
  icon: 'report_problem',
});

export const MITIGATION = defineLookup({
  slug: 'mitigations',
  entity: 'Mitigation',
  entityPlural: 'Mitigations',
  permission: 'MITIGATION',
  label: 'Mitigation',
  pluralLabel: 'Mitigations',
  subtitle: 'What can be done about a risk',
  icon: 'policy',
  // Which risks a mitigation answers is a join table with its own link/unlink
  // pair, so it is a panel rather than a column. One mitigation can answer
  // several risks and one risk can have several.
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      [
        {
          entity: 'MitigationRisk',
          byOwnerQuery: 'mitigationRisksByMitigation',
          ownerArg: 'mitigationUid',
          targetArg: 'riskUid',
          field: 'risk',
          label: 'Risk',
          pluralLabel: 'Risks',
          icon: 'report_problem',
          permission: 'MITIGATION_RISK',
          optionsQuery: RISK.gql.all,
        },
      ],
      record?.id,
    ),
});

export const SNAG = defineLookup({
  slug: 'snags',
  entity: 'Snag',
  entityPlural: 'Snags',
  permission: 'SNAG',
  label: 'Snag',
  pluralLabel: 'Snags',
  subtitle: 'Defects raised against delivered work',
  icon: 'build',
});

export const SERVICE_OFFERING = defineLookup({
  slug: 'service-offerings',
  entity: 'ServiceOffering',
  entityPlural: 'ServiceOfferings',
  // The seeder generates this set under SERVICE, not SERVICE_OFFERING, and the
  // controller gates on those names — so the screen has to ask for the same ones.
  permission: 'SERVICE',
  label: 'Service Offering',
  pluralLabel: 'Service Offerings',
  subtitle: 'What is offered on a project',
  icon: 'local_offer',
});

//  Assessment: the questions asked of a project and the parameters it scores on.

export const QUESTION = defineLookup({
  slug: 'questions',
  entity: 'Question',
  entityPlural: 'Questions',
  permission: 'QUESTION',
  label: 'Question',
  pluralLabel: 'Questions',
  subtitle: 'What a project is asked',
  icon: 'help',
});

export const ANSWER = defineLookup({
  slug: 'answers',
  entity: 'Answer',
  entityPlural: 'Answers',
  permission: 'ANSWER',
  label: 'Answer',
  pluralLabel: 'Answers',
  subtitle: 'The answers one question allows',
  icon: 'question_answer',
  extraGqlFields: `
  question {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [refSelect('questionUid', 'Question', QUESTION.gql.all)],
  extraColumns: ['question.name as Question'],
  toModel: (data) => ({ questionUid: data?.question?.id }),
});

export const QUALITATIVE_PARAMETER = defineLookup({
  slug: 'qualitative-parameters',
  entity: 'QualitativeParameter',
  entityPlural: 'QualitativeParameters',
  permission: 'QUALITATIVE_PARAMETER',
  label: 'Qualitative Parameter',
  pluralLabel: 'Qualitative Parameters',
  subtitle: 'What a project is judged on, without a number',
  icon: 'assessment',
});

export const QUALITATIVE_PARAMETER_VALUE = defineLookup({
  slug: 'qualitative-parameter-values',
  entity: 'QualitativeParameterValue',
  entityPlural: 'QualitativeParameterValues',
  permission: 'QUALITATIVE_PARAMETER_VALUE',
  label: 'Qualitative Parameter Value',
  pluralLabel: 'Qualitative Parameter Values',
  subtitle: 'One judgement recorded against a parameter',
  icon: 'assessment',
  // `date` is not on the form: the backend stamps it with the time of the save
  // when it is left out, which is what recording a judgement means.
  extraGqlFields: `
  date
  qualitativeParameter {
    ${lookupRefGqlFields}
  }
  actor {
    id
    uid: id
    name
  }
`,
  extraFields: [
    refSelect('qualitativeParameterUid', 'Parameter', QUALITATIVE_PARAMETER.gql.all),
    personSelect('actorUid', 'Actor'),
  ],
  extraColumns: [
    'qualitativeParameter.name as Parameter',
    'actor.name as Actor',
    { field: 'date', header: 'Recorded' },
  ],
  toModel: (data) => ({
    qualitativeParameterUid: data?.qualitativeParameter?.id,
    actorUid: data?.actor?.id,
  }),
});

export const QUANTITATIVE_PARAMETER = defineLookup({
  slug: 'quantitative-parameters',
  entity: 'QuantitativeParameter',
  entityPlural: 'QuantitativeParameters',
  permission: 'QUANTITATIVE_PARAMETER',
  label: 'Quantitative Parameter',
  pluralLabel: 'Quantitative Parameters',
  subtitle: 'What a project is measured on',
  icon: 'poll',
});

export const QUANTITATIVE_PARAMETER_VALUE = defineLookup({
  slug: 'quantitative-parameter-values',
  entity: 'QuantitativeParameterValue',
  entityPlural: 'QuantitativeParameterValues',
  permission: 'QUANTITATIVE_PARAMETER_VALUE',
  label: 'Quantitative Parameter Value',
  pluralLabel: 'Quantitative Parameter Values',
  subtitle: 'One measurement recorded against a parameter',
  icon: 'poll',
  extraGqlFields: `
  value
  date
  quantitativeParameter {
    ${lookupRefGqlFields}
  }
  actor {
    id
    uid: id
    name
  }
`,
  extraFields: [
    numberField('value', 'Value'),
    refSelect('quantitativeParameterUid', 'Parameter', QUANTITATIVE_PARAMETER.gql.all),
    personSelect('actorUid', 'Actor'),
  ],
  extraColumns: [
    'value',
    'quantitativeParameter.name as Parameter',
    'actor.name as Actor',
    { field: 'date', header: 'Recorded' },
  ],
  toModel: (data) => ({
    quantitativeParameterUid: data?.quantitativeParameter?.id,
    actorUid: data?.actor?.id,
  }),
});

//  The building: what an asset is broken into.

export const FLOOR = defineLookup({
  slug: 'floors',
  entity: 'Floor',
  entityPlural: 'Floors',
  permission: 'FLOOR',
  label: 'Floor',
  pluralLabel: 'Floors',
  subtitle: 'The levels an asset is divided into',
  icon: 'layers',
  extraGqlFields: `
  area
  ${coordinateGqlFields}
  asset {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    numberField('area', 'Area'),
    ...coordinateFields(),
    refSelect('assetUid', 'Asset', ASSET.gql.all),
  ],
  extraColumns: ['area', 'asset.name as Asset'],
  toModel: (data) => ({ assetUid: data?.asset?.id }),
});

export const UNIT = defineLookup({
  slug: 'units',
  entity: 'Unit',
  entityPlural: 'Units',
  permission: 'UNIT',
  label: 'Unit',
  pluralLabel: 'Units',
  subtitle: 'The lettable spaces a floor is divided into',
  icon: 'domain',
  extraGqlFields: `
  area
  netArea
  grossArea
  unitShares
  status
  ${coordinateGqlFields}
  floor {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    numberField('area', 'Area'),
    numberField('netArea', 'Net Area'),
    numberField('grossArea', 'Gross Area'),
    numberField('unitShares', 'Unit Shares'),
    ...coordinateFields(),
    refSelect('floorUid', 'Floor', FLOOR.gql.all),
    {
      key: 'status',
      label: 'Status',
      type: FieldType.select,
      // The labels of the PostgreSQL enum `units_statuses`. The backend's
      // UnitStatus documents them as assumed — the CREATE TYPE was never
      // supplied — so confirm them against the database before relying on this.
      options: [
        { value: 'AVAILABLE', label: 'Available' },
        { value: 'RESERVED', label: 'Reserved' },
        { value: 'SOLD', label: 'Sold' },
        { value: 'OCCUPIED', label: 'Occupied' },
        { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
      ],
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: ['area', 'netArea as Net', 'grossArea as Gross', 'floor.name as Floor', 'status'],
  toModel: (data) => ({ floorUid: data?.floor?.id }),
  // Everything a unit relates to hangs off its own join table with its own
  // link/unlink pair. One panel each, declared in the unit module so this file
  // does not have to know them.
  extraContents: (comp, record) => unitLinkPanels(comp, record?.id),
});

export const NET_ASSET_VALUE = defineLookup({
  slug: 'net-asset-values',
  entity: 'NetAssetValue',
  entityPlural: 'NetAssetValues',
  permission: 'NET_ASSET_VALUE',
  label: 'Net Asset Value',
  pluralLabel: 'Net Asset Values',
  subtitle: 'What an asset is carried at',
  icon: 'assessment',
  extraGqlFields: `
  netAssetValue
  ${coordinateGqlFields}
  asset {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    numberField('netAssetValue', 'Net Asset Value'),
    ...coordinateFields(),
    refSelect('assetUid', 'Asset', ASSET.gql.all),
  ],
  extraColumns: ['netAssetValue as Value', 'asset.name as Asset'],
  toModel: (data) => ({ assetUid: data?.asset?.id }),
});

//  The graphs: what depends on what.

export const ACTIVITY_CONNECTION = defineLookup({
  slug: 'activity-connections',
  entity: 'ActivityToActivityConnection',
  entityPlural: 'ActivityToActivityConnections',
  permission: 'ACTIVITY_CONNECTION',
  label: 'Activity Connection',
  pluralLabel: 'Activity Connections',
  subtitle: 'Which activity follows which',
  icon: 'link',
  // `connectedAt` is not on the form: the backend stamps it with the time of the
  // save when it is left out, which is when the connection was in fact made.
  extraGqlFields: `
  connectedAt
  parent {
    ${lookupRefGqlFields}
  }
  child {
    ${lookupRefGqlFields}
  }
  connectedBy {
    id
    uid: id
    name
  }
`,
  extraFields: [
    refSelect('parentUid', 'Parent Activity', ACTIVITY.gql.all),
    refSelect('childUid', 'Child Activity', ACTIVITY.gql.all),
    personSelect('connectedByUid', 'Connected By'),
  ],
  extraColumns: [
    'parent.name as Parent',
    'child.name as Child',
    'connectedBy.name as Connected By',
    { field: 'connectedAt', header: 'Connected' },
  ],
  toModel: (data) => ({
    parentUid: data?.parent?.id,
    childUid: data?.child?.id,
    connectedByUid: data?.connectedBy?.id,
  }),
});

export const TASK_CONNECTION = defineLookup({
  slug: 'task-connections',
  entity: 'TaskToTaskConnection',
  entityPlural: 'TaskToTaskConnections',
  permission: 'TASK_CONNECTION',
  label: 'Task Connection',
  pluralLabel: 'Task Connections',
  subtitle: 'Which task follows which',
  icon: 'link',
  extraGqlFields: `
  connectedAt
  parent {
    ${lookupRefGqlFields}
  }
  child {
    ${lookupRefGqlFields}
  }
  connectedBy {
    id
    uid: id
    name
  }
`,
  extraFields: [
    refSelect('parentUid', 'Parent Task', TASK.gql.all),
    refSelect('childUid', 'Child Task', TASK.gql.all),
    personSelect('connectedByUid', 'Connected By'),
  ],
  extraColumns: [
    'parent.name as Parent',
    'child.name as Child',
    'connectedBy.name as Connected By',
    { field: 'connectedAt', header: 'Connected' },
  ],
  toModel: (data) => ({
    parentUid: data?.parent?.id,
    childUid: data?.child?.id,
    connectedByUid: data?.connectedBy?.id,
  }),
});

/*
 * What a unit is charged and judged against. Rates and catalogues, not records:
 * none of them says anything happened, so they are configuration and belong here
 * rather than among the unit module's own screens.
 *
 * The rate tables all carry a `minimum` / `maximum` pair whose CHECK bounds in
 * the database are a latitude and a longitude copied from the coordinate
 * template, so neither can exceed 90 and 180 respectively. The forms mirror the
 * database rather than what the columns ought to hold — see the backend entities.
 */
export const RENT = defineLookup({
  slug: 'rents',
  entity: 'Rent',
  entityPlural: 'Rents',
  permission: 'RENT',
  label: 'Rent',
  pluralLabel: 'Rents',
  subtitle: 'The rent set on a unit',
  icon: 'real_estate_agent',
  extraGqlFields: `
  rentAmount
  minimum
  maximum
  rentStartedAt
`,
  extraFields: [
    numberField('rentAmount', 'Rent amount'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
    { key: 'rentStartedAt', label: 'Rent started at', type: FieldType.dateTime, validations: [VALIDATOR_REQUIRED] },
  ],
  extraColumns: ['rentAmount', 'minimum', 'maximum', { field: 'rentStartedAt', header: 'Rent started at' }],
});

export const COMMISSION = defineLookup({
  slug: 'commissions',
  entity: 'Commission',
  entityPlural: 'Commissions',
  permission: 'COMMISSION',
  label: 'Commission',
  pluralLabel: 'Commissions',
  subtitle: 'What is charged for placing a unit',
  icon: 'percent',
  extraGqlFields: `
  commission
  maximum
  minimum
`,
  extraFields: [
    numberField('commission', 'Commission'),
    numberField('maximum', 'Maximum'),
    numberField('minimum', 'Minimum'),
  ],
  extraColumns: ['commission', 'maximum', 'minimum'],
});

export const PENALTY = defineLookup({
  slug: 'penalties',
  entity: 'Penalty',
  entityPlural: 'Penalties',
  permission: 'PENALTY',
  label: 'Penalty',
  pluralLabel: 'Penalties',
  subtitle: 'Penalties charged on a unit',
  icon: 'warning',
  extraGqlFields: `
  penalties
  minimum
  maximum
`,
  extraFields: [
    numberField('penalties', 'Penalties'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
  ],
  extraColumns: ['penalties', 'minimum', 'maximum'],
});

export const SECURITY_DEPOSIT = defineLookup({
  slug: 'security-deposits',
  entity: 'SecurityDeposit',
  entityPlural: 'SecurityDeposits',
  permission: 'SECURITY_DEPOSIT',
  label: 'Security Deposit',
  pluralLabel: 'Security Deposits',
  subtitle: 'Deposits held against a unit',
  icon: 'savings',
  extraGqlFields: `
  securityDeposits
  minimum
  maximum
`,
  extraFields: [
    numberField('securityDeposits', 'Security deposits'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
  ],
  extraColumns: ['securityDeposits', 'minimum', 'maximum'],
});

export const SOLUTION = defineLookup({
  slug: 'solutions',
  entity: 'Solution',
  entityPlural: 'Solutions',
  permission: 'SOLUTION',
  label: 'Solution',
  pluralLabel: 'Solutions',
  subtitle: 'Remedies that can be applied to a problem',
  icon: 'lightbulb',
  extraGqlFields: `

`,
});

export const NOTICE_DAY = defineLookup({
  slug: 'notice-days',
  entity: 'NoticeDay',
  entityPlural: 'NoticeDays',
  permission: 'NOTICE_DAY',
  label: 'Notice Period',
  pluralLabel: 'Notice Periods',
  subtitle: "How many days' notice a unit requires",
  icon: 'event',
  // Stored as numeric(15,2), so it admits fractional days.
  extraGqlFields: `
  noticeDays
  ${coordinateGqlFields}
`,
  extraFields: [numberField('noticeDays', 'Notice Days'), ...coordinateFields()],
  extraColumns: ['noticeDays'],
});

export const RENT_BILLING_CYCLE = defineLookup({
  slug: 'rent-billing-cycles',
  entity: 'RentBillingCycle',
  entityPlural: 'RentBillingCycles',
  permission: 'RENT_BILLING_CYCLE',
  label: 'Rent Billing Cycle',
  pluralLabel: 'Rent Billing Cycles',
  subtitle: 'The days of the month rent is raised on',
  icon: 'calendar_month',
  // The database constrains neither day. 1..31 is enforced by the application
  // only, and days 29-31 do not exist in every month — the billing job decides
  // whether to clamp to the month end or skip.
  extraGqlFields: `
  firstStartDay
  secondStartDay
`,
  extraFields: [
    numberField('firstStartDay', 'First Start Day'),
    numberField('secondStartDay', 'Second Start Day'),
  ],
  extraColumns: ['firstStartDay as First', 'secondStartDay as Second'],
});

export const RESERVATION_MINUTE = defineLookup({
  slug: 'reservation-minutes',
  entity: 'ReservationMinute',
  entityPlural: 'ReservationMinutes',
  permission: 'RESERVATION_MINUTE',
  label: 'Reservation Minute',
  pluralLabel: 'Reservation Minutes',
  subtitle: 'How long a reservation is held for',
  icon: 'timer',
  // minimum and maximum carry latitude/longitude CHECK bounds in the database,
  // so neither can exceed 90 and 180 respectively — see the backend entity.
  extraGqlFields: `
  reservationMinutes
  minimum
  maximum
`,
  extraFields: [
    numberField('reservationMinutes', 'Reservation Minutes'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
  ],
  extraColumns: ['reservationMinutes as Minutes', 'minimum', 'maximum'],
});

/**
 * Ordered as the work is planned — what it is made of, when it runs, how it is
 * judged, what it is built in, and what depends on what.
 */
export const PROJECT_SETTING_LOOKUPS: LookupModule[] = [
  TASK,
  ACTIVITY,
  DELIVERABLE,
  MILESTONE,
  PHASE,
  SITE,
  TIMELINE,
  MONTH,
  GRADE,
  RISK,
  MITIGATION,
  SNAG,
  SERVICE_OFFERING,
  QUESTION,
  ANSWER,
  QUALITATIVE_PARAMETER,
  QUALITATIVE_PARAMETER_VALUE,
  QUANTITATIVE_PARAMETER,
  QUANTITATIVE_PARAMETER_VALUE,
  FLOOR,
  UNIT,
  NET_ASSET_VALUE,
  ACTIVITY_CONNECTION,
  TASK_CONNECTION,
  NOTICE_DAY,
  RENT_BILLING_CYCLE,
  RESERVATION_MINUTE,
  RENT,
  COMMISSION,
  PENALTY,
  SECURITY_DEPOSIT,
  SOLUTION,
];

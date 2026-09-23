import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  defineLookup,
  entityLinkPanels,
  lookupChildGqlFields,
  lookupChildPanel,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';
import { ASSET } from '@routes/asset-management/asset-lookups';
import { taskLinkPanels } from './task-links';
import { coreAttachmentPanels } from './attachment-lookups';
import { recordLinkPanels, unitLinkPanels } from '@routes/unit-management/unit-links';
import { servicePrioritiesPanel } from '@routes/project-management/priorities';

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

/** A yes/no column, the same shape the asset registry's flags take on a list. */
const flagColumn = (field: string, header?: string): GridKeyColumn => ({
  field,
  header,
  valueFn: (row) => (row?.[field] ? 'Yes' : 'No'),
  valueClassMapper: (row) => (row?.[field] ? 'text-success' : 'text-danger'),
});

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

const personSelect = (key: string, label: string): FieldConfig => refSelect(key, label, ALL_PEOPLE);

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

/** The far sides of the milestone and deliverable links. */
const ALL_PROGRESS_REPORTS = gql`
  query allProgressReports {
    allProgressReports {
      id
      name
    }
  }
`;

const ALL_MILESTONES = gql`
  query allMilestones {
    allMilestones {
      id
      name
    }
  }
`;

const ALL_DELIVERABLES = gql`
  query allDeliverables {
    allDeliverables {
      id
      name
    }
  }
`;

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
  extraContents: (comp, record) => [
    ...taskLinkPanels(comp, record?.id),
    ...coreAttachmentPanels(comp, 'task', record?.id),
  ],
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
  // The milestones a deliverable is due at.
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      [
        {
          entity: 'DeliverableMilestone',
          byOwnerQuery: 'deliverableMilestonesByDeliverable',
          ownerArg: 'deliverableUid',
          targetArg: 'milestoneUid',
          field: 'milestone',
          label: 'Milestone',
          pluralLabel: 'Milestones',
          icon: 'flag',
          permission: 'DELIVERABLE_MILESTONE',
          optionsQuery: ALL_MILESTONES,
        },
      ],
      record?.id,
    ),
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
  // What is due at the milestone, and the reports on how it is going.
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      [
        {
          entity: 'DeliverableMilestone',
          byOwnerQuery: 'deliverableMilestonesByMilestone',
          ownerArg: 'milestoneUid',
          targetArg: 'deliverableUid',
          field: 'deliverable',
          label: 'Deliverable',
          pluralLabel: 'Deliverables',
          icon: 'layers',
          permission: 'DELIVERABLE_MILESTONE',
          optionsQuery: ALL_DELIVERABLES,
        },
        {
          entity: 'MilestoneProgressReport',
          byOwnerQuery: 'milestoneProgressReportsByMilestone',
          ownerArg: 'milestoneUid',
          targetArg: 'progressReportUid',
          field: 'progressReport',
          label: 'Progress Report',
          pluralLabel: 'Progress Reports',
          icon: 'assessment',
          permission: 'MILESTONE_PROGRESS_REPORT',
          optionsQuery: ALL_PROGRESS_REPORTS,
        },
      ],
      record?.id,
    ),
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
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Grade', record?.id),
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
  // The join read from this side — which units this applies to — and how
  // urgent it is.
  extraContents: (comp, record) => [
    ...recordLinkPanels(comp, 'ServiceOffering', record?.id),
    servicePrioritiesPanel(comp, record?.id),
  ],
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
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'QualitativeParameter', record?.id),
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

export const BOOLEAN_PARAMETER = defineLookup({
  slug: 'boolean-parameters',
  entity: 'BooleanParameter',
  entityPlural: 'BooleanParameters',
  permission: 'BOOLEAN_PARAMETER',
  label: 'Boolean Parameter',
  pluralLabel: 'Boolean Parameters',
  subtitle: 'What a handover is judged on, as yes or no',
  icon: 'rule',
  // The join read from this side — which handovers this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'BooleanParameter', record?.id),
});

export const BOOLEAN_PARAMETER_VALUE = defineLookup({
  slug: 'boolean-parameter-values',
  entity: 'BooleanParameterValue',
  entityPlural: 'BooleanParameterValues',
  permission: 'BOOLEAN_PARAMETER_VALUE',
  label: 'Boolean Parameter Value',
  pluralLabel: 'Boolean Parameter Values',
  subtitle: 'One yes-or-no answer recorded against a parameter',
  icon: 'rule',
  // No actor and no date, unlike the qualitative and quantitative readings —
  // the table has neither column. Who recorded it and when is the audit block.
  extraGqlFields: `
  value
  booleanParameter {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    refSelect('booleanParameterUid', 'Parameter', BOOLEAN_PARAMETER.gql.all),
    {
      key: 'value',
      label: 'Answer',
      type: FieldType.toggle,
      // Matches the column default, so an untouched form records the same
      // answer the database would have defaulted to.
      value: true,
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    'booleanParameter.name as Parameter',
    {
      field: 'value',
      header: 'Answer',
      valueFn: (row) => (row?.value ? 'Yes' : 'No'),
      valueClassMapper: (row) => (row?.value ? 'text-success' : 'text-danger'),
    },
  ],
  toModel: (data) => ({ booleanParameterUid: data?.booleanParameter?.id }),
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
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'QuantitativeParameter', record?.id),
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
  isBaseFloor
  ${coordinateGqlFields}
  asset {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    {
      ...numberField('area', 'Area'),
      // Enforced on save: the base floor is the asset's footprint, so nothing on
      // that asset may be larger, and the base floor may not be shrunk below a
      // floor already recorded.
      hint: 'Cannot exceed the base floor area of the asset',
    },
    ...coordinateFields(),
    refSelect('assetUid', 'Asset', ASSET.gql.all),
    {
      key: 'isBaseFloor',
      label: 'Base Floor',
      type: FieldType.toggle,
      hint: 'The floor the asset stands on — only one per asset',
      class: 'col-span-full',
    },
  ],
  extraColumns: ['area', 'asset.name as Asset', flagColumn('isBaseFloor', 'Base Floor')],
  toModel: (data) => ({ assetUid: data?.asset?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => FLOOR_CONNECTION, FLOOR_CONNECTIONS_BY_PARENT, {
      parentUid: record?.id,
    }),
  ],
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

export const FLOOR_CONNECTION = defineLookup({
  slug: 'floor-connections',
  entity: 'FloorParentChildConnection',
  entityPlural: 'FloorParentChildConnections',
  permission: 'FLOOR_CONNECTION',
  label: 'Floor Connection',
  pluralLabel: 'Floor Connections',
  subtitle: 'Which floor sits under which — optional, not every floor has one',
  icon: 'link',
  extraGqlFields: `
  parent {
    ${lookupRefGqlFields}
  }
  child {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    {
      ...refSelect('parentUid', 'Parent Floor', FLOOR.gql.all),
      hint: 'A base floor, or a storey that other storeys of its building sit on',
    },
    {
      ...refSelect('childUid', 'Child Floor', FLOOR.gql.all),
      // Enforced on save. A child base floor has to be on an asset already
      // connected under the parent floor's asset, only under a base floor, and
      // the base floors under one floor may not between them cover more than it
      // has. A storey has to be on the parent floor's own asset, no larger than
      // that asset's base floor, and may sit under a base floor or a storey.
      hint: 'A building base floor under a base floor, or a storey of the parent floor asset',
    },
  ],
  extraColumns: ['parent.name as Parent', 'child.name as Child'],
  toModel: (data) => ({
    parentUid: data?.parent?.id,
    childUid: data?.child?.id,
  }),
});

/** The floors under one floor, for the panel on a floor's own page. */
export const FLOOR_CONNECTIONS_BY_PARENT = gql`
  query floorParentChildConnectionsByParent($parentUid: String) {
    floorParentChildConnectionsByParent(parentUid: $parentUid) {
      ${lookupChildGqlFields}
    }
  }
`;

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
  BOOLEAN_PARAMETER,
  BOOLEAN_PARAMETER_VALUE,
  FLOOR,
  NET_ASSET_VALUE,
  ACTIVITY_CONNECTION,
  TASK_CONNECTION,
  FLOOR_CONNECTION,
];

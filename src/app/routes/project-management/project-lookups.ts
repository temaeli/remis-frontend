import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { gql } from '@apollo/client/core';

import { projectAssetsPanel } from './project-asset';
import { recordLinkPanels } from '@routes/unit-management/unit-links';
import {
  defineLookup,
  entityLinkPanels,
  EntityLinkConfig,
  lookupChildGqlFields,
  lookupChildPanel,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';

/**
 * The project registry, every table of it.
 *
 * These are all `CoreNamedEntity` in the DBA-owned `remis_core_schema`, sitting on
 * the same five-operation API, so they are declared here as configs and rendered
 * by the shared lookup screens rather than getting four files each.
 */

/** A plain number, the shape the registry's numeric columns take. */
const numberField = (key: string, label: string): FieldConfig => ({
  key,
  label,
  type: FieldType.input,
  inputType: 'number',
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/**
 * The latitude/longitude pair projects, cost types and master plans all carry.
 * Stored as numeric(9,6), so the controls take decimals and round to six places.
 */
const coordinateFields = (): FieldConfig[] => [
  {
    key: 'latitude',
    label: 'Latitude',
    hint: 'Decimal degrees, between -90 and 90',
    type: FieldType.decimal,
    decimals: 6,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'longitude',
    label: 'Longitude',
    hint: 'Decimal degrees, between -180 and 180',
    type: FieldType.decimal,
    decimals: 6,
    validations: [VALIDATOR_REQUIRED],
  },
];

const coordinateGqlFields = `
  latitude
  longitude
`;

/** A select over another registry table, which all of these key on `id`. */
const parentSelect = (key: string, label: string, query: unknown): FieldConfig => ({
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

//  The taxonomy that classifies the register.

export const PROJECT_CATEGORY = defineLookup({
  slug: 'project-categories',
  entity: 'ProjectCategory',
  entityPlural: 'ProjectCategories',
  permission: 'PROJECT_CATEGORY',
  label: 'Project Category',
  pluralLabel: 'Project Categories',
  subtitle: 'Top level of the project taxonomy',
  icon: 'category',
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => PROJECT_SUBCATEGORY, PROJECT_SUBCATEGORIES_BY_CATEGORY, {
      categoryUid: record?.id,
    }),
  ],
});

export const PROJECT_SUBCATEGORY = defineLookup({
  slug: 'project-subcategories',
  entity: 'ProjectSubcategory',
  entityPlural: 'ProjectSubcategories',
  permission: 'PROJECT_SUBCATEGORY',
  label: 'Project Subcategory',
  pluralLabel: 'Project Subcategories',
  subtitle: 'Divisions of a project category',
  icon: 'list',
  extraGqlFields: `
  projectCategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('projectCategoryUid', 'Project Category', PROJECT_CATEGORY.gql.all)],
  extraColumns: ['projectCategory.name as Category'],
  toModel: (data) => ({ projectCategoryUid: data?.projectCategory?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => REGISTRY_PROJECT, REGISTRY_PROJECTS_BY_SUBCATEGORY, {
      subcategoryUid: record?.id,
    }),
  ],
});

export const COST_TYPE = defineLookup({
  slug: 'cost-types',
  entity: 'CostType',
  entityPlural: 'CostTypes',
  permission: 'COST_TYPE',
  label: 'Cost Type',
  pluralLabel: 'Cost Types',
  subtitle: 'Classification for recorded costs',
  icon: 'list',
  extraGqlFields: `
  costTypes
  ${coordinateGqlFields}
`,
  extraFields: [numberField('costTypes', 'Cost Types Value'), ...coordinateFields()],
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => COST, COSTS_BY_COST_TYPE, { costTypeUid: record?.id }),
  ],
});

//  The operational register.

export const REGISTRY_PROJECT = defineLookup({
  slug: 'projects',
  entity: 'RegistryProject',
  entityPlural: 'RegistryProjects',
  // The permission set is named after the thing, not the mapped class.
  permission: 'PROJECT',
  label: 'Project',
  pluralLabel: 'Projects',
  subtitle: 'The central project register',
  icon: 'suitcase',
  extraGqlFields: `
  ${coordinateGqlFields}
  startedAt
  endedAt
  days
  projectSubcategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    parentSelect('projectSubcategoryUid', 'Project Subcategory', PROJECT_SUBCATEGORY.gql.all),
    ...coordinateFields(),
    {
      key: 'startedAt',
      label: 'Start Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      // Required: v1 of the schema has ended_at NOT NULL, so a running project
      // still needs a date. v2 relaxes it to mean "still under way".
      key: 'endedAt',
      label: 'End Date',
      type: FieldType.date,
      hint: 'Required — does not yet allow an open-ended project',
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: ['projectSubcategory.name as Subcategory', 'days'],
  toModel: (data) => ({ projectSubcategoryUid: data?.projectSubcategory?.id }),
  extraContents: (comp, record) => [
    ...recordLinkPanels(comp, 'RegistryProject', record?.id),
    lookupChildPanel(comp, () => PROJECT_CONNECTION, PROJECT_CONNECTIONS_BY_PARENT, {
      parentUid: record?.id,
    }),
    projectAssetsPanel(comp, record?.id),
    ...entityLinkPanels(comp, PROJECT_STREET_LINK, record?.id),
  ],
});

const ALL_STREETS = gql`
  query allStreets {
    allStreets {
      id
      name
    }
  }
`;

/**
 * Which streets a project sits on. Its own two-column join table with its own
 * link/unlink pair, so it is a panel on the project rather than a column.
 *
 * Unique on the pair, unlike the older `projects_assets`, so the database rejects
 * a duplicate outright rather than the service checking first.
 */
const PROJECT_STREET_LINK: EntityLinkConfig[] = [
  {
    entity: 'ProjectStreet',
    byOwnerQuery: 'projectStreetsByProject',
    ownerArg: 'projectUid',
    targetArg: 'streetUid',
    field: 'street',
    label: 'Street',
    pluralLabel: 'Streets',
    icon: 'place',
    permission: 'PROJECT_STREET',
    optionsQuery: ALL_STREETS,
  },
];

export const PROJECT_CONNECTION = defineLookup({
  slug: 'project-connections',
  entity: 'ProjectConnection',
  entityPlural: 'ProjectConnections',
  permission: 'PROJECT_CONNECTION',
  label: 'Project Connection',
  pluralLabel: 'Project Connections',
  subtitle: 'Directed links between projects',
  icon: 'connection',
  extraGqlFields: `
  connectedAt
  parent {
    ${lookupRefGqlFields}
  }
  child {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    parentSelect('parentUid', 'Parent Project', REGISTRY_PROJECT.gql.all),
    parentSelect('childUid', 'Child Project', REGISTRY_PROJECT.gql.all),
  ],
  extraColumns: ['parent.name as Parent', 'child.name as Child'],
  toModel: (data) => ({ parentUid: data?.parent?.id, childUid: data?.child?.id }),
});

export const COST = defineLookup({
  slug: 'costs',
  entity: 'Cost',
  entityPlural: 'Costs',
  permission: 'COST',
  label: 'Cost',
  pluralLabel: 'Costs',
  subtitle: 'Recorded amounts, each of a cost type',
  icon: 'notes',
  extraGqlFields: `
  amount
  costType {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    numberField('amount', 'Amount'),
    parentSelect('costTypeUid', 'Cost Type', COST_TYPE.gql.all),
  ],
  extraColumns: ['amount', 'costType.name as Type'],
  toModel: (data) => ({ costTypeUid: data?.costType?.id }),
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Cost', record?.id),
});

export const REGISTRY_MASTER_PLAN = defineLookup({
  slug: 'master-plans',
  entity: 'RegistryMasterPlan',
  entityPlural: 'RegistryMasterPlans',
  permission: 'MASTER_PLAN',
  label: 'Master Plan',
  pluralLabel: 'Master Plans',
  subtitle: 'Planned areas with a survey point',
  icon: 'map',
  extraGqlFields: `
  area
  ${coordinateGqlFields}
`,
  extraFields: [numberField('area', 'Area'), ...coordinateFields()],
  extraColumns: ['area'],
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'RegistryMasterPlan', record?.id),
});

//  The parent-filtered reads the drill-downs above are built on. Exported so
//  they are checked against the schema alongside the generated ones.

export const PROJECT_SUBCATEGORIES_BY_CATEGORY = gql`
  query projectSubcategoriesByCategory($categoryUid: String) {
    projectSubcategoriesByCategory(categoryUid: $categoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const REGISTRY_PROJECTS_BY_SUBCATEGORY = gql`
  query registryProjectsBySubcategory($subcategoryUid: String) {
    registryProjectsBySubcategory(subcategoryUid: $subcategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const COSTS_BY_COST_TYPE = gql`
  query costsByCostType($costTypeUid: String) {
    costsByCostType(costTypeUid: $costTypeUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const PROJECT_CONNECTIONS_BY_PARENT = gql`
  query projectConnectionsByParent($parentUid: String) {
    projectConnectionsByParent(parentUid: $parentUid) {
      ${lookupChildGqlFields}
    }
  }
`;

/** The operational screens, which lead the menu. */
const ALL_SUBCATEGORIES = gql`
  query allSubcategories {
    allSubcategories {
      id
      name
    }
  }
`;

const ALL_TASKS_FOR_REPORTS = gql`
  query allTasks {
    allTasks {
      id
      name
    }
  }
`;

const ALL_MILESTONES_FOR_REPORTS = gql`
  query allMilestones {
    allMilestones {
      id
      name
    }
  }
`;

/** A longer free-text answer, the shape progress and plan both take. */
const textArea = (key: string, label: string, hint: string): FieldConfig => ({
  key,
  label,
  hint,
  type: FieldType.textarea,
  rows: 4,
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/** How project work is going: what was done, what comes next, and what it covers. */
const PROGRESS_REPORT_LINKS: EntityLinkConfig[] = [
  {
    entity: 'TaskProgressReport',
    byOwnerQuery: 'taskProgressReportsByProgressReport',
    ownerArg: 'progressReportUid',
    targetArg: 'taskUid',
    field: 'task',
    label: 'Task',
    pluralLabel: 'Tasks',
    icon: 'assignment',
    permission: 'TASK_PROGRESS_REPORT',
    optionsQuery: ALL_TASKS_FOR_REPORTS,
  },
  {
    entity: 'MilestoneProgressReport',
    byOwnerQuery: 'milestoneProgressReportsByProgressReport',
    ownerArg: 'progressReportUid',
    targetArg: 'milestoneUid',
    field: 'milestone',
    label: 'Milestone',
    pluralLabel: 'Milestones',
    icon: 'flag',
    permission: 'MILESTONE_PROGRESS_REPORT',
    optionsQuery: ALL_MILESTONES_FOR_REPORTS,
  },
];

export const PROGRESS_REPORT = defineLookup({
  slug: 'progress-reports',
  entity: 'ProgressReport',
  entityPlural: 'ProgressReports',
  permission: 'PROGRESS_REPORT',
  label: 'Progress Report',
  pluralLabel: 'Progress Reports',
  subtitle: 'What was done, what comes next, and which tasks and milestones it covers',
  icon: 'assessment',
  extraGqlFields: `
  progressReportsDate
  progress
  plan
  subcategory { ${lookupRefGqlFields} }
`,
  extraFields: [
    {
      key: 'progressReportsDate',
      label: 'Report Date',
      hint: 'The date the report is for',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    parentSelect('subcategoryUid', 'Subcategory', ALL_SUBCATEGORIES),
    textArea('progress', 'Progress', 'What was done'),
    textArea('plan', 'Plan', 'What comes next'),
  ],
  extraColumns: [
    { field: 'progressReportsDate', header: 'Date' },
    'subcategory.name as Subcategory',
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  extraContents: (comp, record) => entityLinkPanels(comp, PROGRESS_REPORT_LINKS, record?.id),
});

export const PROJECT_LOOKUPS: LookupModule[] = [
  REGISTRY_PROJECT,
  PROJECT_CONNECTION,
  COST,
  REGISTRY_MASTER_PLAN,
  PROGRESS_REPORT,
];

/** The taxonomy that classifies them, grouped behind one menu and kept last. */
export const PROJECT_CONFIGURATION_LOOKUPS: LookupModule[] = [
  PROJECT_CATEGORY,
  PROJECT_SUBCATEGORY,
  COST_TYPE,
];

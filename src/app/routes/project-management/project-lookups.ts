import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { defineLookup, lookupRefGqlFields, LookupModule } from '@shared/lookup';

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

/** The latitude/longitude pair projects, cost types and master plans all carry. */
const coordinateFields = (): FieldConfig[] => [
  {
    key: 'latitude',
    label: 'Latitude',
    type: FieldType.input,
    inputType: 'number',
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'longitude',
    label: 'Longitude',
    type: FieldType.input,
    inputType: 'number',
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
});

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
});

/** The operational screens, which lead the menu. */
export const PROJECT_LOOKUPS: LookupModule[] = [
  REGISTRY_PROJECT,
  PROJECT_CONNECTION,
  COST,
  REGISTRY_MASTER_PLAN,
];

/** The taxonomy that classifies them, grouped behind one menu and kept last. */
export const PROJECT_CONFIGURATION_LOOKUPS: LookupModule[] = [
  PROJECT_CATEGORY,
  PROJECT_SUBCATEGORY,
  COST_TYPE,
];

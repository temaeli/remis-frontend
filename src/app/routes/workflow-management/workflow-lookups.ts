import { gql } from '@apollo/client/core';

import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import { LIST_ALL_ROLES } from '@routes/users-managment/roles/role.graphql';
import { defineLookup, Lookup, LookupModule } from '@shared/lookup';

/**
 * The workflow module — `modules.workflow` on the backend.
 *
 * A route is a definition, the steps it is made of, the actions each step offers
 * and the people those actions are narrowed to. The executions are the trail of
 * what was actually done, which is why they sit apart from the four
 * configuration screens.
 *
 * Three things about the backend's tables shape these configs, and each is worth
 * knowing before changing them:
 *
 * 1. `workflow_definitions` has no `isDeleted` column and spells its flag
 *    `is_active`, so it selects its own audit block and deleting deactivates.
 * 2. Its descriptive columns are `workflowKey`/`name`/`description` rather than
 *    the `assignedNumber` triple; everything else here spells the first one
 *    `assignedCode` on the DTO while the record still returns it as
 *    `assignedNumber`, which is what the `toModel` renames below are for.
 * 3. A step has no foreign key to its definition. Nothing on these screens can
 *    show "the steps of workflow X" — the chain is followed through parent and
 *    child instead, which is what the initial/parent columns are for.
 */

//  The five PostgreSQL enum types the module is built on. Labels must match the
//  database exactly: it rejects anything else on insert rather than at startup.

/** `remis_core_schema.statuses`. */
export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
}

/** `remis_core_schema.action_types` — how a step or action moves a record. */
export enum ActionType {
  FORWARD = 'FORWARD',
  JUMP = 'JUMP',
  BACK = 'BACK',
}

/** `remis_core_schema.return_types` — where a BACK lands. */
export enum ReturnType {
  SELF = 'SELF',
  START = 'START',
}

/**
 * `remis_core_schema.step_type`. The type declares one label on a NOT NULL
 * column, so every step is TBD until the DBA adds the real ones.
 */
export enum StepType {
  TBD = 'TBD',
}

const toOptions = (values: Record<string, string>): Option[] =>
  Object.values(values).map((value) => ({ value, label: getDisplayName(value) as string }));

export const WORKFLOW_STATUS_OPTIONS = toOptions(WorkflowStatus);
export const ACTION_TYPE_OPTIONS = toOptions(ActionType);
export const RETURN_TYPE_OPTIONS = toOptions(ReturnType);
export const STEP_TYPE_OPTIONS = toOptions(StepType);

/**
 * A workflow definition is not editable once approved, so `SUBMITTED` is as far
 * as this control goes — approving is its own mutation behind its own permission.
 */
const DRAFT_STATUS_OPTIONS = WORKFLOW_STATUS_OPTIONS.filter(
  (option) => option.value !== WorkflowStatus.APPROVED,
);

//  Shared field and column shapes.

/** A select over another table in this module, all of which key on `id`. */
const refSelect = (
  key: string,
  label: string,
  query: unknown,
  options: { required?: boolean; hint?: string } = {},
): FieldConfig => ({
  key,
  label,
  hint: options.hint,
  type: FieldType.select,
  optionsVariables: { labelKey: 'name', valueKey: 'id', fetchParameter: { query } },
  validations: options.required === false ? [] : [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/** A select over one of the database enums. */
const enumSelect = (key: string, label: string, options: Option[], hint?: string): FieldConfig => ({
  key,
  label,
  hint,
  type: FieldType.select,
  options,
  validations: [VALIDATOR_REQUIRED],
});

/**
 * The role holding a record, or allowed to act on it. A bigint into `uaa.roles`,
 * so unlike everything else here it keys on the numeric id.
 */
const roleSelect = (label: string): FieldConfig => ({
  key: 'roleId',
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query: LIST_ALL_ROLES, variables: { active: true } },
  },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/** A yes/no column — the shape every flag in this module takes on a list. */
const flagColumn = (field: string, header?: string): GridKeyColumn => ({
  field,
  header,
  valueFn: (row) => (row?.[field] ? 'Yes' : 'No'),
  valueClassMapper: (row) => (row?.[field] ? 'text-success' : 'text-danger'),
});

/** An enum column, rendered as words rather than the SCREAMING_CASE label. */
const enumColumn = (field: string, header: string): GridKeyColumn => ({
  field,
  header,
  valueFn: (row) => getDisplayName(row?.[field]),
});

/**
 * The descriptive controls for the four tables that spell the first column
 * `assignedCode` on the DTO while returning it as `assignedNumber` on the record.
 *
 * The first control is a hidden carrier for the identifier — without it the
 * backend cannot tell an update from a create.
 */
const codedFields = (nameHint?: string): FieldConfig[] => [
  { key: 'id', type: FieldType.input, visible: false },
  {
    key: 'name',
    label: 'Name',
    hint: nameHint,
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'assignedCode',
    label: 'Assigned Code',
    type: FieldType.input,
    hint: 'Leave blank to generate automatically',
    class: 'col-span-full',
  },
  {
    key: 'description',
    label: 'Description',
    type: FieldType.textarea,
    rows: 3,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

const codedColumns: GridKeyColumn[] = ['index', 'assignedNumber as Code', 'name', 'description'];

/** Seeds `assignedCode` from what the record actually returns. */
const codeToModel = (data?: Lookup) => ({ assignedCode: data?.assignedNumber });

/** A related record on a list row, kept shallow so selections do not fan out. */
const refFields = `
  id
  uid: id
  assignedNumber
  name
`;

//  Reads the self-referencing selects are filled from. Declared as documents
//  rather than reused off the configs, because a step's parent select is filled
//  from steps — a config cannot reference itself while it is being defined.

const ALL_WORKFLOW_STEPS = gql`
  query allWorkflowSteps {
    allWorkflowSteps {
      id
      name
    }
  }
`;

const ALL_WORKFLOW_STEP_ACTIONS = gql`
  query allWorkflowStepActions {
    allWorkflowStepActions {
      id
      name
    }
  }
`;

const ALL_BIO_DATA = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

/** Signs a route off, which is what makes it usable. Its own mutation, its own permission. */
const APPROVE_WORKFLOW_DEFINITION = gql`
  mutation approveWorkflowDefinition($uid: String) {
    approveWorkflowDefinition(uid: $uid) {
      ${responseGqlFields(`
        id
        uid: id
        isApproved
        status
      `)}
    }
  }
`;

//  The definition — the header a route hangs off.

export const WORKFLOW_DEFINITION = defineLookup({
  slug: 'workflow-definitions',
  entity: 'WorkflowDefinition',
  entityPlural: 'WorkflowDefinitions',
  permission: 'WORKFLOW_DEFINITION',
  label: 'Workflow Definition',
  pluralLabel: 'Workflow Definitions',
  subtitle: 'The named approval routes, and whether each has been signed off',
  icon: 'rule',
  // No isDeleted column on this table, unlike every other one in the schema.
  // Selecting it would fail the whole query.
  auditGqlFields: `
  id
  uid: id
  active
  createdAt
`,
  // workflowKey rather than assignedNumber, and the DTO spells it the same way,
  // so no rename is needed here.
  descriptiveGqlFields: `
  workflowKey
  name
  description
`,
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'workflowKey',
      label: 'Workflow Key',
      type: FieldType.input,
      hint: 'The stable handle other records refer to this route by. Leave blank to generate — it is never changed afterwards',
      class: 'col-span-full',
    },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  baseColumns: ['index', 'workflowKey as Key', 'name', 'description'],
  extraGqlFields: `
  isApproved
  status
`,
  extraFields: [
    {
      ...enumSelect('status', 'Status', DRAFT_STATUS_OPTIONS),
      hint: 'Approving is a separate action and cannot be set from here',
      validations: [],
      class: 'col-span-full',
    },
  ],
  extraColumns: [enumColumn('status', 'Status'), flagColumn('isApproved', 'Approved')],
  extraActions: (comp, lookup) => [approveWorkflowBtn(comp, lookup)],
});

//  The steps a route is made of.

/**
 * One station on a route.
 *
 * Parent and child are both optional here and required in the database, which is
 * the one place this module's screens hide something: a step with no parent is
 * stored pointing at itself, and the backend reads that back as none. Leave the
 * parent blank on the step that begins a chain and the child blank on the one
 * that ends it.
 */
export const WORKFLOW_STEP = defineLookup({
  slug: 'workflow-steps',
  entity: 'WorkflowStep',
  entityPlural: 'WorkflowSteps',
  permission: 'WORKFLOW_STEP',
  label: 'Workflow Step',
  pluralLabel: 'Workflow Steps',
  subtitle: 'Who holds a record at each stage, and where it goes next',
  icon: 'linear_scale',
  baseFields: codedFields('At most 20 characters — the column is narrower here than elsewhere'),
  baseColumns: codedColumns,
  extraGqlFields: `
  isInitial
  isMain
  isFinal
  isMultiAction
  newStatus
  sequence
  systemTriggered
  visualX
  visualY
  actionType
  returnType
  stepType
  role {
    id
    name
  }
  parentStep {
    ${refFields}
  }
  childStep {
    ${refFields}
  }
`,
  extraFields: [
    {
      key: 'sequence',
      label: 'Sequence',
      hint: 'Position on the chain. Two steps under one parent cannot share a slot',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
    },
    enumSelect(
      'newStatus',
      'Resulting Status',
      WORKFLOW_STATUS_OPTIONS,
      'What the record becomes once this step completes',
    ),
    roleSelect('Held By Role'),
    enumSelect('actionType', 'Action Type', ACTION_TYPE_OPTIONS),
    enumSelect(
      'returnType',
      'Return Type',
      RETURN_TYPE_OPTIONS,
      'Where a BACK from this step lands',
    ),
    {
      ...enumSelect('stepType', 'Step Type', STEP_TYPE_OPTIONS),
      hint: 'The database type declares only TBD so far',
    },
    refSelect('parentUid', 'Parent Step', ALL_WORKFLOW_STEPS, {
      required: false,
      hint: 'Leave blank on the step that begins the chain',
    }),
    refSelect('childUid', 'Child Step', ALL_WORKFLOW_STEPS, {
      required: false,
      hint: 'Leave blank on the step that ends the chain',
    }),
    { key: 'isInitial', label: 'Initial Step', type: FieldType.toggle },
    { key: 'isMain', label: 'On The Main Line', type: FieldType.toggle },
    { key: 'isFinal', label: 'Final Step', type: FieldType.toggle },
    {
      key: 'isMultiAction',
      label: 'Multiple Actions',
      hint: 'The holder picks between several actions rather than one way out',
      type: FieldType.toggle,
    },
    {
      key: 'systemTriggered',
      label: 'System Triggered',
      hint: 'Completed by the system, with no user to act',
      type: FieldType.toggle,
    },
    {
      key: 'visualX',
      label: 'Canvas X',
      hint: 'Where the node sits in the workflow designer',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'visualY',
      label: 'Canvas Y',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'sequence', header: 'Seq' },
    'role.name as Role',
    enumColumn('actionType', 'Action'),
    enumColumn('newStatus', 'Resulting Status'),
    'parentStep.name as Parent',
    'childStep.name as Child',
    flagColumn('isInitial', 'Initial'),
    flagColumn('isFinal', 'Final'),
  ],
  toModel: (data) => ({
    ...codeToModel(data),
    roleId: data?.role?.id,
    // parentStep and childStep are null where the record points at itself, which
    // is how the backend spells "none" on a NOT NULL column.
    parentUid: data?.parentStep?.id,
    childUid: data?.childStep?.id,
  }),
});

//  What a step offers the person holding it.

export const WORKFLOW_STEP_ACTION = defineLookup({
  slug: 'workflow-step-actions',
  entity: 'WorkflowStepAction',
  entityPlural: 'WorkflowStepActions',
  permission: 'WORKFLOW_STEP_ACTION',
  label: 'Workflow Step Action',
  pluralLabel: 'Workflow Step Actions',
  subtitle: 'The ways out of a step, and who may take each',
  icon: 'swap_horiz',
  baseFields: codedFields(),
  baseColumns: codedColumns,
  extraGqlFields: `
  actionType
  returnType
  ttl
  workflowStep {
    ${refFields}
  }
  role {
    id
    name
  }
  nextAction {
    ${refFields}
  }
`,
  extraFields: [
    refSelect('workflowStepUid', 'Workflow Step', ALL_WORKFLOW_STEPS),
    enumSelect('actionType', 'Action Type', ACTION_TYPE_OPTIONS),
    enumSelect('returnType', 'Return Type', RETURN_TYPE_OPTIONS),
    roleSelect('Taken By Role'),
    {
      key: 'ttl',
      label: 'TTL',
      // numeric(5,2) with no unit recorded on the column and no check
      // constraint, so the bounds are all the form can offer.
      hint: 'Time to live, at most 999.99. The unit is whatever the process agrees on — the column records none',
      type: FieldType.decimal,
      decimals: 2,
      min: 0,
      max: 999.99,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('nextStepActionUid', 'Next Action', ALL_WORKFLOW_STEP_ACTIONS, {
      required: false,
      hint: 'Leave blank on the last action of a chain',
    }),
  ],
  extraColumns: [
    'workflowStep.name as Step',
    enumColumn('actionType', 'Action'),
    'role.name as Role',
    { field: 'ttl', header: 'TTL' },
    'nextAction.name as Next',
  ],
  toModel: (data) => ({
    ...codeToModel(data),
    workflowStepUid: data?.workflowStep?.id,
    roleId: data?.role?.id,
    nextStepActionUid: data?.nextAction?.id,
  }),
});

//  Who, by name, may take an action.

/**
 * Narrows an action's role to specific people. With no row here the action is
 * open to everyone holding its role; with one or more it is open only to those
 * named — a rule the backend applies, not the schema.
 */
export const STEP_ACTION_ASSIGNEE = defineLookup({
  slug: 'step-action-assignees',
  entity: 'StepActionAssignee',
  entityPlural: 'StepActionAssignees',
  permission: 'STEP_ACTION_ASSIGNEE',
  label: 'Step Action Assignee',
  pluralLabel: 'Step Action Assignees',
  subtitle: 'The people an action is narrowed to, where it is not open to the whole role',
  icon: 'assignment_ind',
  baseFields: codedFields(),
  baseColumns: codedColumns,
  extraGqlFields: `
  subordinate {
    id
    name
  }
  workflowStepAction {
    ${refFields}
  }
`,
  extraFields: [
    refSelect('workflowStepActionUid', 'Workflow Step Action', ALL_WORKFLOW_STEP_ACTIONS),
    // bio_data is the party record, not a CoreNamedEntity — it carries no
    // assignedNumber, so the shallow selection above would not resolve.
    refSelect('subordinateUid', 'Person', ALL_BIO_DATA),
  ],
  extraColumns: ['workflowStepAction.name as Action', 'subordinate.name as Person'],
  toModel: (data) => ({
    ...codeToModel(data),
    workflowStepActionUid: data?.workflowStepAction?.id,
    subordinateUid: data?.subordinate?.id,
  }),
});

//  The trail of what was actually done.

/**
 * The only table in this module that records events rather than configuration.
 *
 * Two things it cannot yet answer, both limits of the table and not of these
 * screens: it holds nothing identifying the record that was acted on, so a trail
 * can only be read per route; and its three descriptive columns are unique, which
 * is a catalogue's shape and not a log's — so the backend generates them and the
 * controls below are optional.
 */
export const STEP_ACTION_EXECUTION = defineLookup({
  slug: 'step-action-executions',
  entity: 'StepActionExecution',
  entityPlural: 'StepActionExecutions',
  permission: 'STEP_ACTION_EXECUTION',
  label: 'Step Action Execution',
  pluralLabel: 'Step Action Executions',
  subtitle: 'What was done on a route, newest first',
  icon: 'history',
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      hint: 'Leave blank to generate — every execution needs one the database has not seen',
      class: 'col-span-full',
    },
    {
      key: 'assignedCode',
      label: 'Assigned Code',
      type: FieldType.input,
      hint: 'Leave blank to generate automatically',
      class: 'col-span-full',
    },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      rows: 2,
      hint: 'Leave blank to generate automatically',
      class: 'col-span-full',
    },
  ],
  baseColumns: ['index', 'assignedNumber as Code', 'name', { field: 'createdAt', header: 'When' }],
  extraGqlFields: `
  status
  workflowDefinition {
    id
    uid: id
    workflowKey
    name
  }
  currentStep {
    ${refFields}
  }
  workflowStep {
    ${refFields}
  }
  workflowStepAction {
    ${refFields}
  }
  nextStepAction {
    ${refFields}
  }
  role {
    id
    name
  }
`,
  extraFields: [
    refSelect('workflowDefinitionUid', 'Workflow', WORKFLOW_DEFINITION.gql.all),
    refSelect('currentStepUid', 'Step Acted On', ALL_WORKFLOW_STEPS, {
      hint: 'Where the record stood when the action was taken',
    }),
    refSelect('workflowStepUid', 'Resulting Step', ALL_WORKFLOW_STEPS, {
      hint: 'Where it stands afterwards',
    }),
    refSelect('workflowStepActionUid', 'Action Taken', ALL_WORKFLOW_STEP_ACTIONS, {
      hint: 'Must belong to the step acted on',
    }),
    refSelect('nextStepActionUid', 'Next Action', ALL_WORKFLOW_STEP_ACTIONS, {
      required: false,
      hint: 'Leave blank to repeat the action just taken, which is what a terminal execution records',
    }),
    enumSelect('status', 'Resulting Status', WORKFLOW_STATUS_OPTIONS),
    roleSelect('Acted Under Role'),
  ],
  extraColumns: [
    'workflowDefinition.name as Workflow',
    'currentStep.name as From',
    'workflowStep.name as To',
    'workflowStepAction.name as Action',
    enumColumn('status', 'Status'),
    'role.name as Role',
  ],
  toModel: (data) => ({
    ...codeToModel(data),
    workflowDefinitionUid: data?.workflowDefinition?.id,
    currentStepUid: data?.currentStep?.id,
    workflowStepUid: data?.workflowStep?.id,
    workflowStepActionUid: data?.workflowStepAction?.id,
    nextStepActionUid: data?.nextStepAction?.id,
    roleId: data?.role?.id,
  }),
});

/**
 * Signing a route off. Kept out of the edit form deliberately — an approved
 * definition is what everything else binds to, so the backend refuses further
 * edits once it is set, and the action carries its own permission.
 */
function approveWorkflowBtn(comp: BaseComponent, lookup: LookupModule): ActionButton {
  return {
    icon: 'assignment_turned_in',
    label: 'Approve',
    permissions: ['ROLE_APPROVE_WORKFLOW_DEFINITION'],
    click: async (data: Lookup) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data?.id },
        mutation: APPROVE_WORKFLOW_DEFINITION,
        successFn: (res) => lookup.changed$.next(res?.data),
      });
    },
  };
}

/** The route itself, which leads the menu. */
export const WORKFLOW_LOOKUPS: LookupModule[] = [WORKFLOW_DEFINITION];

/** What a route is built from, grouped behind one menu. */
export const WORKFLOW_CONFIGURATION_LOOKUPS: LookupModule[] = [
  WORKFLOW_STEP,
  WORKFLOW_STEP_ACTION,
  STEP_ACTION_ASSIGNEE,
];

/** The runtime trail, kept apart from the configuration above. */
export const WORKFLOW_EXECUTION_LOOKUPS: LookupModule[] = [STEP_ACTION_EXECUTION];

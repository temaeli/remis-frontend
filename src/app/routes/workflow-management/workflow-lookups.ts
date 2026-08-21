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
import {
  defineLookup,
  entityLinkPanels,
  EntityLinkConfig,
  Lookup,
  lookupChildGqlFields,
  lookupChildPanel,
  LookupModule,
} from '@shared/lookup';
import { ATTACHMENT_TYPE_OPTIONS, coreAttachmentPanels } from '@routes/settings/attachment-lookups';

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
 * 3. A step still has no foreign key to its definition. What a route is made of
 *    lives in the connections screen instead, where an edge names its workflow
 *    and its two ends. The `parentStep`/`childStep` pair on a step is the older
 *    way of saying the same thing and is on its way out — read the connections.
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

/**
 * `remis_core_schema.application_types` — which kind of application travels a
 * route, and what makes the route reachable at all.
 */
export enum ApplicationType {
  SALES = 'SALES',
  PURCHASES = 'PURCHASES',
  RENT = 'RENT',
  RENT_PURCHASES = 'RENT_PURCHASES',
}

const toOptions = (values: Record<string, string>): Option[] =>
  Object.values(values).map((value) => ({ value, label: getDisplayName(value) as string }));

export const WORKFLOW_STATUS_OPTIONS = toOptions(WorkflowStatus);
export const ACTION_TYPE_OPTIONS = toOptions(ActionType);
export const RETURN_TYPE_OPTIONS = toOptions(ReturnType);
export const STEP_TYPE_OPTIONS = toOptions(StepType);
export const APPLICATION_TYPE_OPTIONS = toOptions(ApplicationType);

//  Shared field and column shapes.

/** A select over another table in this module, all of which key on `id`. */
const refSelect = (
  key: string,
  label: string,
  query: unknown,
  options: { required?: boolean; hint?: string; labelKey?: string } = {},
): FieldConfig => ({
  key,
  label,
  hint: options.hint,
  type: FieldType.select,
  optionsVariables: {
    labelKey: options.labelKey ?? 'name',
    valueKey: 'id',
    fetchParameter: { query },
  },
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

const ALL_WORKFLOW_DEFINITIONS = gql`
  query allWorkflowDefinitions {
    allWorkflowDefinitions {
      id
      workflowKey
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

//  The drill-downs. Each lists what belongs to the record on screen, and pairs
//  with a lookupChildPanel below.

const WORKFLOW_STEP_ROLES_BY_STEP = gql`
  query workflowStepRolesByStep($stepUid: String) {
    workflowStepRolesByStep(stepUid: $stepUid) {
      ${lookupChildGqlFields}
    }
  }
`;

const WORKFLOW_STEP_ATTACHMENT_TYPES_BY_STEP = gql`
  query workflowStepAttachmentTypesByStep($stepUid: String) {
    workflowStepAttachmentTypesByStep(stepUid: $stepUid) {
      ${lookupChildGqlFields}
    }
  }
`;

const WORKFLOW_STEP_ACTION_TYPES_BY_STEP = gql`
  query workflowStepActionTypesByStep($stepUid: String) {
    workflowStepActionTypesByStep(stepUid: $stepUid) {
      ${lookupChildGqlFields}
    }
  }
`;

const PROCESSES_BY_WORKFLOW_DEFINITION = gql`
  query processesByWorkflowDefinition($workflowDefinitionUid: String) {
    processesByWorkflowDefinition(workflowDefinitionUid: $workflowDefinitionUid) {
      ${lookupChildGqlFields}
    }
  }
`;

const WORKFLOW_STEP_EXECUTIONS_BY_PROCESS = gql`
  query workflowStepExecutionsByProcess($processUid: String) {
    workflowStepExecutionsByProcess(processUid: $processUid) {
      ${lookupChildGqlFields}
    }
  }
`;

/** Reads the cases a route is carrying, so an execution can be filed against one. */
const ALL_PROCESSES = gql`
  query allProcesses {
    allProcesses {
      id
      name
    }
  }
`;

/**
 * The documents one action filed. A link table rather than a lookup: the row
 * carries three foreign keys and nothing to search on, so it is linked and
 * unlinked rather than created and edited.
 *
 * The step is not asked for — the backend reads it off the execution, which
 * already names it, so the two cannot disagree.
 */
const WORKFLOW_STEP_ATTACHMENT_LINK: EntityLinkConfig = {
  entity: 'WorkflowStepAttachment',
  byOwnerQuery: 'workflowStepAttachmentsByExecution',
  ownerArg: 'executionUid',
  targetArg: 'attachmentUid',
  field: 'attachment',
  label: 'Document',
  pluralLabel: 'Filed Documents',
  icon: 'file',
  permission: 'WORKFLOW_STEP_ATTACHMENT',
  optionsQuery: gql`
    query allCoreAttachments {
      allCoreAttachments {
        id
        name
      }
    }
  `,
  // A document carries no description, so the panel's default selection would
  // ask for one and fail the whole query.
  targetGqlFields: `
    id
    assignedNumber
    name
  `,
};

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
  icon: 'process',
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
  // name and description were dropped from this table — the key is all that
  // identifies a route now.
  descriptiveGqlFields: `
  workflowKey
`,
  nameKey: 'workflowKey',
  /**
   * Declared here rather than through `extraFields`, which the shared form always
   * appends after this block — Application Type has to lead, so it lives in it.
   *
   * It leads because it is the decision the rest of the form hangs off: which
   * applications travel this route. Required even though the column defaults to
   * PURCHASES, since a route filed under the wrong type is not something anyone
   * would notice.
   *
   * There is no status control. The backend defaults a new route to DRAFT and
   * ignores an APPROVED sent through the save — approving is its own mutation
   * behind its own permission. The column is still read and shown on the list.
   */
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      ...enumSelect('applicationType', 'Application Type', APPLICATION_TYPE_OPTIONS),
      hint: 'Which kind of application travels this route',
      class: 'col-span-full',
    },
    {
      key: 'workflowKey',
      label: 'Workflow Key',
      hint: 'The only thing naming this route — name and description were dropped from the table. Leave blank to generate',
      type: FieldType.input,
      class: 'col-span-full',
    },
  ],
  baseColumns: ['index', 'workflowKey as Key'],
  extraGqlFields: `
  isApproved
  status
  applicationType
`,
  extraColumns: [
    enumColumn('applicationType', 'Application Type'),
    enumColumn('status', 'Status'),
    flagColumn('isApproved', 'Approved'),
  ],
  // An approved route is what applications are matched against, so it is frozen:
  // neither its shape nor its existence is the author's to change any more. The
  // backend refuses both.
  lockedWhen: (record) => !!record?.isApproved,
  lockedReason: 'This workflow has been approved and can no longer be edited or deleted',
  // Row menu only. Approving acts on the one route the reader picked out of the
  // list; on a header it would sit beside Create with nothing saying which.
  rowActions: (comp, lookup) => [approveWorkflowBtn(comp, lookup)],
  // What is actually travelling this route. Reading it beside the definition is
  // how someone judges whether a route may still be changed — the approval flag
  // says it is frozen, this says who would be disturbed.
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => PROCESS, PROCESSES_BY_WORKFLOW_DEFINITION, {
      workflowDefinitionUid: record?.id,
    }),
  ],
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
  icon: 'sub_task',
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
  workflowDefinition {
    id
    uid: id
    workflowKey
  }
  parentStep {
    ${refFields}
  }
  childStep {
    ${refFields}
  }
`,
  extraFields: [
    // The column the DBA added after the module was first built. Required rather
    // than optional: the database default is a hardcoded workflow id, so a step
    // saved without one quietly joins whichever route that names.
    refSelect('workflowDefinitionUid', 'Workflow', ALL_WORKFLOW_DEFINITIONS, {
      labelKey: 'workflowKey',
      hint: 'The route this step stands on. Its connections must be drawn on the same one',
    }),
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
    'workflowDefinition.workflowKey as Workflow',
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
    workflowDefinitionUid: data?.workflowDefinition?.id,
    // parentStep and childStep are null where the record points at itself, which
    // is how the backend spells "none" on a NOT NULL column.
    parentUid: data?.parentStep?.id,
    childUid: data?.childStep?.id,
  }),
  // The two tables that each replaced a single column on this one: who holds the
  // step, and what it demands before it can be completed. Both read as properties
  // of the step, so they belong on its page rather than in the menu beside it.
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => WORKFLOW_STEP_ROLE, WORKFLOW_STEP_ROLES_BY_STEP, {
      stepUid: record?.id,
    }),
    lookupChildPanel(
      comp,
      () => WORKFLOW_STEP_ATTACHMENT_TYPE,
      WORKFLOW_STEP_ATTACHMENT_TYPES_BY_STEP,
      { stepUid: record?.id },
    ),
    lookupChildPanel(comp, () => WORKFLOW_STEP_ACTION_TYPE, WORKFLOW_STEP_ACTION_TYPES_BY_STEP, {
      stepUid: record?.id,
    }),
  ],
});

//  Who holds a step.

/**
 * A step may sit with more than one office at once.
 *
 * Supersedes the single `roleId` on the step itself, which allowed exactly one
 * holder and is still there. Where both are set the step's own column is the older
 * answer — read these rows.
 *
 * The pair is not unique in the database, so the same role could be added twice;
 * the backend checks before inserting and answers with a message.
 */
export const WORKFLOW_STEP_ROLE = defineLookup({
  slug: 'workflow-step-roles',
  entity: 'WorkflowStepRole',
  entityPlural: 'WorkflowStepRoles',
  permission: 'WORKFLOW_STEP_ROLE',
  label: 'Step Holder',
  pluralLabel: 'Step Holders',
  subtitle: 'The offices a step sits with, where more than one holds it',
  icon: 'user_check',
  baseFields: codedFields(),
  baseColumns: codedColumns,
  extraGqlFields: `
  workflowStep {
    ${refFields}
  }
  role {
    id
    name
  }
`,
  extraFields: [refSelect('workflowStepUid', 'Workflow Step', ALL_WORKFLOW_STEPS), roleSelect('Held By Role')],
  extraColumns: ['workflowStep.name as Step', 'role.name as Role'],
  toModel: (data) => ({
    ...codeToModel(data),
    workflowStepUid: data?.workflowStep?.id,
    roleId: data?.role?.id,
  }),
});

//  What a step demands before it can be completed.

/**
 * One row per document type a step requires — a title deed and a national id are
 * two rows, not one.
 *
 * Nothing enforces the demand yet. The backend has the documents a case holds
 * (`attachments_processes`) and the types a step wants, but no code compares them;
 * this screen declares the rule an engine will later read. There is also no
 * mandatory/optional flag, so every row here reads as required.
 */
export const WORKFLOW_STEP_ATTACHMENT_TYPE = defineLookup({
  slug: 'workflow-step-attachment-types',
  entity: 'WorkflowStepAttachmentType',
  entityPlural: 'WorkflowStepAttachmentTypes',
  permission: 'WORKFLOW_STEP_ATTACHMENT_TYPE',
  label: 'Required Document',
  pluralLabel: 'Required Documents',
  subtitle: 'The papers a step demands before it can be completed',
  icon: 'file',
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      hint: 'Leave blank to name it after the step and the document type',
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
  baseColumns: codedColumns,
  extraGqlFields: `
  attachmentType
  workflowStep {
    ${refFields}
  }
`,
  extraFields: [
    refSelect('workflowStepUid', 'Workflow Step', ALL_WORKFLOW_STEPS),
    {
      ...enumSelect('attachmentType', 'Document Type', ATTACHMENT_TYPE_OPTIONS),
      hint: 'The step cannot be completed until a document of this type is present',
      class: 'col-span-full',
    },
  ],
  extraColumns: ['workflowStep.name as Step', enumColumn('attachmentType', 'Document Type')],
  toModel: (data) => ({
    ...codeToModel(data),
    workflowStepUid: data?.workflowStep?.id,
  }),
});

//  What a step offers.

/**
 * One action a step offers — one of the directions a record can travel from it.
 *
 * A step a record can be both approved onward from and returned from has two rows
 * here, `FORWARD` and `BACK`. This is the list a screen reads to decide which
 * buttons to show at a step, and the list the backend judges an execution's
 * direction against.
 *
 * Supersedes the single `actionType` on the step itself, which allowed one
 * direction only — the same way the holders and the required documents above
 * replaced single columns. That column is still there; where both are set, read
 * these rows.
 *
 * What a direction then means is read off the connections, not from here:
 * `FORWARD` goes to the step's child on the case's route, `BACK` to its parent.
 * A step with no child on a route cannot offer a usable `FORWARD` there, and the
 * backend says so when an execution tries.
 */
export const WORKFLOW_STEP_ACTION_TYPE = defineLookup({
  slug: 'workflow-step-action-types',
  entity: 'WorkflowStepActionType',
  entityPlural: 'WorkflowStepActionTypes',
  permission: 'WORKFLOW_STEP_ACTION_TYPE',
  label: 'Offered Action',
  pluralLabel: 'Offered Actions',
  subtitle: 'The directions a record can travel from a step',
  icon: 'arrow_forward',
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      hint: 'Leave blank to name it after the step and the action',
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
  baseColumns: codedColumns,
  extraGqlFields: `
  actionType
  workflowStep {
    ${refFields}
  }
`,
  extraFields: [
    refSelect('workflowStepUid', 'Workflow Step', ALL_WORKFLOW_STEPS),
    {
      ...enumSelect('actionType', 'Action', ACTION_TYPE_OPTIONS),
      hint: 'An execution may only record a direction the step offers',
      class: 'col-span-full',
    },
  ],
  extraColumns: ['workflowStep.name as Step', enumColumn('actionType', 'Action')],
  toModel: (data) => ({
    ...codeToModel(data),
    workflowStepUid: data?.workflowStep?.id,
  }),
});

//  The edges that make the steps a route.

/**
 * One arrow of a workflow's graph: this step leads to that one, on this route.
 *
 * The table that ties the module together. A step carries no workflow of its own,
 * so this is where a route's shape lives — and because an edge names its
 * workflow, the same step can appear on two routes with different neighbours in
 * each.
 *
 * The three descriptive columns are UNIQUE on a table of arrows, which no caller
 * can satisfy by hand, so all three are optional and the backend generates them
 * from the two steps. Only the workflow and the two ends are asked for.
 */
export const WORKFLOW_STEP_CONNECTION = defineLookup({
  slug: 'workflow-step-connections',
  entity: 'WorkflowStepConnection',
  entityPlural: 'WorkflowStepConnections',
  permission: 'WORKFLOW_STEP_CONNECTION',
  label: 'Workflow Connection',
  pluralLabel: 'Workflow Connections',
  subtitle: 'Which step leads to which, on each route',
  icon: 'connection',
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    refSelect('workflowDefinitionUid', 'Workflow', ALL_WORKFLOW_DEFINITIONS, {
      labelKey: 'workflowKey',
      hint: 'An approved workflow can no longer be redrawn',
    }),
    refSelect('parentUid', 'From Step', ALL_WORKFLOW_STEPS),
    refSelect('childUid', 'To Step', ALL_WORKFLOW_STEPS, {
      hint: 'Must differ from the step above — a step cannot connect to itself',
    }),
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      hint: 'Leave blank to name it after the two steps',
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
  baseColumns: ['index', 'assignedNumber as Code'],
  extraGqlFields: `
  workflowDefinition {
    id
    uid: id
    workflowKey
    isApproved
  }
  parent {
    ${refFields}
    sequence
  }
  child {
    ${refFields}
    sequence
  }
`,
  extraColumns: ['workflowDefinition.workflowKey as Workflow', 'parent.name as From', 'child.name as To'],
  toModel: (data) => ({
    ...codeToModel(data),
    workflowDefinitionUid: data?.workflowDefinition?.id,
    parentUid: data?.parent?.id,
    childUid: data?.child?.id,
  }),
  // Frozen with its workflow: the graph is what records in flight are travelling,
  // so redrawing it would move them to steps they never passed through.
  lockedWhen: (record) => !!record?.workflowDefinition?.isApproved,
  lockedReason: 'This workflow has been approved, so its connections can no longer be changed',
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
  icon: 'take_action',
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
  icon: 'user_check',
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
    refSelect('workflowDefinitionUid', 'Workflow', ALL_WORKFLOW_DEFINITIONS, { labelKey: 'workflowKey' }),
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
    'workflowDefinition.workflowKey as Workflow',
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

//  A case actually travelling a route.

/**
 * One run of a workflow — the first screen in this module that stands for a case
 * rather than a rule.
 *
 * **It still has no subject.** A case names its workflow and nothing else: no
 * column says which application, asset or agreement is being taken through it. So
 * a case is identified by its own name and code and by what has been done to it,
 * which is what the two panels below show. A `subjectType`/`subjectId` pair on the
 * table would close this, and is worth settling before an engine is written.
 *
 * A case can only be opened on an approved route: a draft is still being drawn,
 * and its steps could be rearranged underneath a case already travelling it.
 */
export const PROCESS = defineLookup({
  slug: 'processes',
  entity: 'Process',
  entityPlural: 'Processes',
  permission: 'PROCESS',
  label: 'Case',
  pluralLabel: 'Cases',
  subtitle: 'What is travelling each route, and how far it has got',
  icon: 'process',
  baseFields: codedFields(),
  baseColumns: codedColumns,
  extraGqlFields: `
  workflowDefinition {
    id
    uid: id
    workflowKey
    isApproved
    applicationType
  }
`,
  extraFields: [
    refSelect('workflowDefinitionUid', 'Workflow', ALL_WORKFLOW_DEFINITIONS, {
      labelKey: 'workflowKey',
      hint: 'Only an approved route can carry a case',
    }),
  ],
  extraColumns: [
    'workflowDefinition.workflowKey as Workflow',
    // Not enumColumn: that reads a flat key off the row, and this one is nested.
    {
      field: 'workflowDefinition.applicationType',
      header: 'Application Type',
      valueFn: (row) => getDisplayName(row?.workflowDefinition?.applicationType),
    },
  ],
  toModel: (data) => ({
    ...codeToModel(data),
    workflowDefinitionUid: data?.workflowDefinition?.id,
  }),
  // Where the case has been, and what it is carrying. Together these are the only
  // account of a case there is, since the table names no subject of its own.
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => WORKFLOW_STEP_EXECUTION, WORKFLOW_STEP_EXECUTIONS_BY_PROCESS, {
      processUid: record?.id,
    }),
    ...coreAttachmentPanels(comp, 'process', record?.id),
  ],
});

//  What was actually done, and by whom.

/**
 * One row per action taken on a case.
 *
 * **Read this one, not the executions above it.** `STEP_ACTION_EXECUTION` maps the
 * older `step_action_executions`; both tables exist on the backend and neither is
 * derived from the other. This one carries the three things that one lacks — the
 * case it belongs to, the person who decided and when they decided — which is what
 * makes "where is my application" answerable at all.
 *
 * What it gives up in exchange: there is no action here, only a direction. A row
 * says a case went FORWARD, JUMPed or came BACK, but not which of the step's
 * actions produced it; the older table can say that and this cannot. Until the two
 * are reconciled with the DBA, an engine should write to one of them.
 *
 * The actor defaults to whoever is signed in, which is what an approval taken on
 * screen means. Naming someone else is for recording a decision taken off the
 * system, and the same goes for the date.
 */
export const WORKFLOW_STEP_EXECUTION = defineLookup({
  slug: 'workflow-step-executions',
  entity: 'WorkflowStepExecution',
  entityPlural: 'WorkflowStepExecutions',
  permission: 'WORKFLOW_STEP_EXECUTION',
  label: 'Recorded Action',
  pluralLabel: 'Recorded Actions',
  subtitle: 'What was done to each case, by whom, and when',
  icon: 'history',
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      hint: 'Leave blank to generate — every action needs one the database has not seen',
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
  baseColumns: ['index', 'assignedNumber as Code', 'name'],
  // The column is `statuses` and the property is `status`; GraphQL reads the
  // property, so this is the name to ask for.
  extraGqlFields: `
  status
  actionType
  actedAt
  process {
    ${refFields}
  }
  workflowStep {
    ${refFields}
  }
  actor {
    id
    name
  }
`,
  extraFields: [
    refSelect('processUid', 'Case', ALL_PROCESSES, {
      hint: 'The case this action was taken on',
    }),
    refSelect('workflowStepUid', 'Step', ALL_WORKFLOW_STEPS, {
      hint: 'Where the case stood when the action was taken',
    }),
    {
      ...enumSelect('actionType', 'Direction', ACTION_TYPE_OPTIONS),
      hint: 'Which way the case moved. FORWARD goes to the step\'s child on this case\'s route, BACK to its parent',
    },
    // Three columns this form deliberately does not ask for, all of them filled
    // by the backend because none of them is really the caller's to choose:
    //
    //   status   — the step confers one, and the database refuses any other.
    //   actor    — the logged-in user's person record. Sending somebody else's is
    //              still possible from an engine; a screen should not offer it.
    //   actedAt  — now. It was a date control here, which sent a date with no time
    //              and could not be read as a timestamp at all.
    //
    // All three are still shown in the grid and on the record, read off what was
    // saved rather than what was typed.
  ],
  extraColumns: [
    'process.name as Case',
    'workflowStep.name as Step',
    enumColumn('actionType', 'Direction'),
    enumColumn('status', 'Status'),
    'actor.name as Acted By',
    { field: 'actedAt', header: 'Acted At' },
  ],
  toModel: (data) => ({
    ...codeToModel(data),
    processUid: data?.process?.id,
    workflowStepUid: data?.workflowStep?.id,
    actorUid: data?.actor?.id,
  }),
  // The papers this action filed. A link panel rather than a child list: the row
  // is three foreign keys with nothing to edit.
  extraContents: (comp, record) =>
    record?.id ? entityLinkPanels(comp, [WORKFLOW_STEP_ATTACHMENT_LINK], record.id) : [],
});

/**
 * Signing a route off. Kept out of the edit form deliberately — an approved
 * definition is what everything else binds to, so the backend refuses further
 * edits once it is set, and the action carries its own permission.
 */
function approveWorkflowBtn(comp: BaseComponent, lookup: LookupModule): ActionButton {
  return {
    icon: 'approve',
    label: 'Approve',
    permissions: ['ROLE_APPROVE_WORKFLOW_DEFINITION'],
    // Gone once the route is signed off. Approving is not a state anything can
    // return from, so an approved route has nothing left to offer here — the
    // backend answers "already approved" and the list already says so in its own
    // column.
    hideFunction: (data?: Lookup) => !!data?.isApproved,
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

/** The route itself, and the cases travelling it — what the module leads with. */
export const WORKFLOW_LOOKUPS: LookupModule[] = [WORKFLOW_DEFINITION, PROCESS];

/** What a route is built from, grouped behind one menu. */
export const WORKFLOW_CONFIGURATION_LOOKUPS: LookupModule[] = [
  WORKFLOW_STEP,
  // Straight after the steps: the connections are what turn a set of steps into
  // a route, so they read in that order.
  WORKFLOW_STEP_CONNECTION,
  // Then what each step carries — who holds it and what it demands. Both read as
  // properties of a step, so they follow it rather than leading.
  WORKFLOW_STEP_ROLE,
  WORKFLOW_STEP_ATTACHMENT_TYPE,
  // And what it offers: the directions a record can travel from a step, which is
  // what the backend checks an execution's direction against.
  WORKFLOW_STEP_ACTION_TYPE,
  WORKFLOW_STEP_ACTION,
  STEP_ACTION_ASSIGNEE,
];

/**
 * The runtime trail, kept apart from the configuration above.
 *
 * Both tables are here because both exist on the backend and neither is derived
 * from the other. The recorded actions lead: they are the ones that name a case
 * and an actor, so they are what a reader wants. See {@link WORKFLOW_STEP_EXECUTION}
 * for what the older screen below can still answer that this one cannot.
 */
export const WORKFLOW_EXECUTION_LOOKUPS: LookupModule[] = [
  WORKFLOW_STEP_EXECUTION,
  STEP_ACTION_EXECUTION,
];

import { gql } from '@apollo/client/core';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  defineLookup,
  LookupModule,
  lookupDeleteBtn,
  lookupUpsertBtn,
  openLookupForm,
} from '@shared/lookup';
import { CORE_STATUS_OPTIONS } from './settings-lookups';

/* ------------------------------------------------------------------ *
 * The statuses a task or a unit has taken, and since when —
 * `tasks_statusesid` and `units_statusesid`.
 *
 * Built like the project's status history: a parent, a status and a time, no
 * code or name. Declared as lookups for the form, save and delete, but with no
 * list or page of their own — the backend reads them by task or unit only, so
 * they show as a panel on the task and on the unit.
 *
 * The unit's history here is not its Unit Status Records
 * (`units_unit_statuses`), which stay under Unit Management.
 * ------------------------------------------------------------------ */

const pad = (n: number) => `${n}`.padStart(2, '0');

/** Now, in the local form the date-time control and the backend both read. */
const nowLocal = (): string => {
  const d = new Date();
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  );
};

const statusLabel = (value?: string): string =>
  CORE_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value ?? '';

/** The form both tables share; only the hidden parent key differs. */
const statusChangeFields = (parentKey: string) => [
  { key: 'id', type: FieldType.input, visible: false },
  // Always the task or unit the panel sits on, so it is carried, not chosen.
  { key: parentKey, type: FieldType.input, visible: false },
  {
    key: 'status',
    label: 'Status',
    type: FieldType.select,
    options: CORE_STATUS_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    // Filled with now when the form opens; cleared, the backend records now.
    key: 'since',
    label: 'Since',
    hint: 'Defaults to now',
    type: FieldType.dateTime,
  },
];

export const TASK_STATUS_CHANGE = defineLookup({
  slug: 'task-status-changes',
  entity: 'TaskStatusChange',
  entityPlural: 'TaskStatusChanges',
  permission: 'TASK_STATUS_CHANGE',
  label: 'Task Status',
  pluralLabel: 'Status History',
  subtitle: 'The statuses a task has taken, and since when',
  icon: 'history',
  auditGqlFields: `
  id
  uid: id
`,
  descriptiveGqlFields: `
  status
  since
`,
  // The delete prompt names the row by this; there is no name column to use.
  nameKey: 'status',
  baseFields: statusChangeFields('taskUid'),
});

export const UNIT_STATUS_CHANGE = defineLookup({
  slug: 'unit-status-changes',
  entity: 'UnitStatusChange',
  entityPlural: 'UnitStatusChanges',
  permission: 'UNIT_STATUS_CHANGE',
  label: 'Unit Status',
  pluralLabel: 'Status History',
  subtitle: 'The statuses a unit has taken, and since when',
  icon: 'history',
  auditGqlFields: `
  id
  uid: id
`,
  descriptiveGqlFields: `
  status
  since
`,
  nameKey: 'status',
  baseFields: statusChangeFields('unitUid'),
});

const TASK_STATUS_CHANGES_BY_TASK = gql`
  query taskStatusChangesByTask($taskUid: String) {
    taskStatusChangesByTask(taskUid: $taskUid) {
      id
      uid: id
      status
      since
    }
  }
`;

const UNIT_STATUS_CHANGES_BY_UNIT = gql`
  query unitStatusChangesByUnit($unitUid: String) {
    unitStatusChangesByUnit(unitUid: $unitUid) {
      id
      uid: id
      status
      since
    }
  }
`;

/**
 * Newest first, as the backend returns them, so the top row is where the task
 * or unit stands now. Built by hand, as the project's is: a child panel's row
 * menu leads with View, and these rows have no page to open.
 */
function statusHistoryPanel(
  comp: BaseComponent,
  base: LookupModule,
  query: unknown,
  parentKey: string,
  parentUid?: string,
): ContentParameter {
  // The by-parent read does not repeat the parent on each row, so an edit is
  // told which one it is under here.
  const lookup: LookupModule = { ...base, toModel: () => ({ [parentKey]: parentUid }) };

  return {
    type: 'table',
    name: lookup.pluralLabel,
    label: lookup.pluralLabel,
    icon: lookup.icon,
    keyColumns: [
      'index',
      { field: 'status', header: 'Status', valueFn: (row) => statusLabel(row?.status) },
      { field: 'since', header: 'Since' },
      'actions',
    ],
    headerButtons: [
      {
        icon: 'add',
        label: 'Record Status',
        class: 'btn-add-primary',
        click: () => openLookupForm(comp, lookup, { [parentKey]: parentUid, since: nowLocal() }),
        permissions: [`ROLE_CREATE_${base.permission}`],
      },
    ],
    actionButtons: [
      { ...MORE_BTN, buttons: [lookupUpsertBtn(comp, lookup), lookupDeleteBtn(comp, lookup)] },
    ],
    reloadActions$: [lookup.changed$],
    fetchParameter: { query, variables: { [parentKey]: parentUid } },
  };
}

/** The Status History panel on a task. */
export const taskStatusHistoryPanel = (comp: BaseComponent, taskUid?: string): ContentParameter =>
  statusHistoryPanel(comp, TASK_STATUS_CHANGE, TASK_STATUS_CHANGES_BY_TASK, 'taskUid', taskUid);

/** The Status History panel on a unit. */
export const unitStatusHistoryPanel = (comp: BaseComponent, unitUid?: string): ContentParameter =>
  statusHistoryPanel(comp, UNIT_STATUS_CHANGE, UNIT_STATUS_CHANGES_BY_UNIT, 'unitUid', unitUid);

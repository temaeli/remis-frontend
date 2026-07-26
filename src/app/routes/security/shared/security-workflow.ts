// Shared workflow-action button factory for the Security module.
// Most security entities expose the same lifecycle mutations operating on
// `SecurityWorkflowActionDtoInput { uid!, approved, comments, assigneeUserUid }`,
// plus a `submitX(uid: String)` that takes a bare uid.

import { Subject } from 'rxjs';
import { CrudHost, EntityCrud } from '@shared/crud';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

export interface WorkflowBtnOptions {
  icon: string;
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  mutation: any;
  reload$: Subject<any>;
  permissions?: string[];
  /** Submit-style: sends only `{ uid }`. */
  uidOnly?: boolean;
  /** Adds an Approve? decision toggle to the modal. */
  withDecision?: boolean;
  /** Adds an assignee user picker (e.g. appoint investigator). */
  assigneeOptions?: any;
  assigneeLabel?: string;
  /** Restrict the button to rows in these workflow statuses. */
  statuses?: string[];
  showFunction?: (row: any) => boolean;
}

/**
 * Wraps `crud.upsertBtn` with a disabledFunction that mirrors each service's
 * own `"Only ... can be edited"` guard (e.g. SecurityIncidentService only
 * allows DRAFT/RETURNED). Use for both the table row action and the detail
 * page's standalone Edit button, so the restriction can't be bypassed by
 * opening a record's detail view directly.
 */
export function gatedUpsertBtn(
  crud: EntityCrud,
  host: CrudHost,
  editableStatuses: string[],
): ActionButton {
  const upsert = crud.upsertBtn(host);
  return {
    ...upsert,
    disabledFunction: (row: any) => !!row?.status && !editableStatuses.includes(row.status),
  };
}

/**
 * Composes table action buttons (view + edit + workflow extras) WITHOUT a
 * delete button — for Security entities whose backend exposes no delete
 * mutation (incidents, investigations, rosters, gate passes, etc.).
 *
 * `editableStatuses`, when given, disables Edit once a row has moved past
 * those statuses (see `gatedUpsertBtn`). Omit it for entities with no such
 * backend restriction (attendance, access events, vetting records) to keep
 * Edit always enabled, as before.
 */
export function securityTableBtns(
  crud: EntityCrud,
  host: CrudHost,
  extras: ActionButton[] = [],
  editableStatuses?: string[],
): ActionButton[] {
  const buttons: ActionButton[] = [];
  const view = crud.viewBtn(host);
  if (view) buttons.push(view);
  buttons.push(editableStatuses ? gatedUpsertBtn(crud, host, editableStatuses) : crud.upsertBtn(host));
  buttons.push(...extras);
  return [{ ...MORE_BTN, buttons }];
}

export function workflowActionBtn(host: CrudHost, o: WorkflowBtnOptions): ActionButton {
  const statusGate = (row: any) => !o.statuses || (row?.status && o.statuses.includes(row.status));

  return {
    icon: o.icon,
    label: o.label,
    color: o.color,
    toolTip: o.label,
    permissions: o.permissions,
    showFunction: (row: any) =>
      !!row?.uid && statusGate(row) && (o.showFunction ? o.showFunction(row) : true),
    click: (row: any) => {
      if (o.uidOnly) {
        host.fetch({
          notify: true,
          mutation: o.mutation,
          variables: { uid: row?.uid },
          successFn: () => o.reload$.next(null),
        });
        return;
      }

      const close$ = new Subject<void>();
      const fields: FieldConfig[] = [];

      if (o.withDecision) {
        fields.push({
          key: 'approved',
          label: 'Decision',
          type: FieldType.select,
          options: [
            { label: 'Approve', value: true },
            { label: 'Reject', value: false },
          ],
          validations: [VALIDATOR_REQUIRED],
        });
      }
      if (o.assigneeOptions) {
        fields.push({
          key: 'assigneeUserUid',
          label: o.assigneeLabel ?? 'Assignee',
          type: FieldType.select,
          optionsVariables: o.assigneeOptions,
          validations: [VALIDATOR_REQUIRED],
        });
      }
      fields.push({
        key: 'comments',
        label: 'Comments',
        type: FieldType.textarea,
        class: 'col-span-full',
        validations: [],
      });

      const params: FormParameters = {
        model: {},
        title: o.label,
        fields,
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: o.mutation,
            variables: { dto: { uid: row?.uid, ...value } },
            successFn: () => {
              o.reload$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '50%');
    },
  };
}

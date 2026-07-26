import { Subject } from 'rxjs';
import { DocumentNode } from 'graphql';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { CrudHost } from './crud-host';
import { canReject, deriveStatus } from './process-status';

export interface RejectBtnConfig {
  /** GraphQL mutation document. Backend variables are `(<uidKey>: String!, comment: String!)`. */
  mutation: DocumentNode;
  /** Human label used in the toolTip and modal title (e.g. `"Station Reading"`). */
  entityLabel: string;
  /** Single role gate — usually the same `ROLE_APPROVE_*` as the approve sibling. */
  permission: string;
  /** Refresh hook fired on successful reject (typically `entity$.next(null)`). */
  onSuccess: () => void;
  /** Variable name carrying the row id. Defaults to `uid`; some backends use `incidentUid`, `meetingUid`, etc. */
  uidKey?: string;
  /** When true, hide the button for the row's creator. BE rejects creator-approve since 2026-07-09. */
  gateCreator?: boolean;
  /** Extra visibility predicate ANDed with the built-in status + creator checks. */
  extraShow?: (row: any) => boolean;
  /** Overrides the default `canReject` (SUBMITTED-only) status gate. Useful when
   * the entity supports rejection in additional states (e.g. ROLLED_BACK on
   * multi-stage incidents that can be rejected repeatedly). */
  statusPredicate?: (row: any) => boolean;
}

export function buildRejectBtn(host: CrudHost, c: RejectBtnConfig): ActionButton {
  const uidKey = c.uidKey ?? 'uid';
  return {
    icon: 'cancel',
    label: 'Reject',
    color: 'warn',
    toolTip: `Reject ${c.entityLabel}`,
    permissions: [c.permission],
    showFunction: (row: any) => {
      const passesStatus = c.statusPredicate
        ? c.statusPredicate(row)
        : canReject({ status: deriveStatus(row) });
      if (!passesStatus) return false;
      if (c.gateCreator && row?.createdBy?.username && row.createdBy.username === host.currentUserUsername) return false;
      if (c.extraShow && !c.extraShow(row)) return false;
      return true;
    },
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: `Reject ${c.entityLabel}`,
        fields: [
          {
            key: 'comment',
            label: 'Rejection Reason',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: c.mutation,
            variables: { [uidKey]: data.uid, comment: value?.comment },
            successFn: () => {
              c.onSuccess();
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '40%');
    },
  };
}

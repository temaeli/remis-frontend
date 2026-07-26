import { Subject } from 'rxjs';
import { DocumentNode } from 'graphql';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { CrudHost } from './crud-host';
import { canApprove, deriveStatus } from './process-status';

export interface ApproveBtnConfig {
  /** GraphQL mutation document. Backend variables are `(<uidKey>: String!, comment: String!)`. */
  mutation: DocumentNode;
  /** Human label used in the toolTip and modal title (e.g. `"Flow Meter Reading"`). */
  entityLabel: string;
  /** Single role gate — usually `ROLE_APPROVE_*`. */
  permission: string;
  /** Refresh hook fired on successful approve (typically `entity$.next(null)`). */
  onSuccess: () => void;
  /** Variable name carrying the row id. Defaults to `uid`. */
  uidKey?: string;
  /** When true, hide the button for the row's creator. BE rejects creator-approve since 2026-07-09. */
  gateCreator?: boolean;
}

export function buildApproveBtn(host: CrudHost, c: ApproveBtnConfig): ActionButton {
  const uidKey = c.uidKey ?? 'uid';
  return {
    icon: 'check_circle',
    label: 'Approve',
    color: 'primary',
    toolTip: `Approve ${c.entityLabel}`,
    permissions: [c.permission],
    showFunction: (row: any) => {
      if (!canApprove({ status: deriveStatus(row) })) return false;
      if (c.gateCreator && row?.createdBy?.username && row.createdBy.username === host.currentUserUsername) return false;
      return true;
    },
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: `Approve ${c.entityLabel}`,
        fields: [
          {
            key: 'comment',
            label: 'Approval Comment',
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

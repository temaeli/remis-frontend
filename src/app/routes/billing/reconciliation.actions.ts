import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { LookupModule } from '@shared/lookup';
import { SP_GRP_CODE, SYSTEM_CODE } from '@routes/settings/settings-lookups';

import { REQUEST_RECONCILIATION } from './reconciliation.graphql';
import { payment$ } from './payment.form';

/**
 * Asking GePG to reconcile a day, from the reconciliation screen.
 *
 * This belongs on a screen of its own rather than on a bill: reconciliation
 * names a date and a service provider group, and the statement it asks for
 * covers every bill paid that day. Gated on the payment roles because
 * reconciliation is how the payments get checked against what GePG says it
 * took.
 */
export const RECONCILIATION_PERMISSIONS = [
  'ROLE_CREATE_PAYMENT_HEADER',
  'ROLE_UPDATE_PAYMENT_HEADER',
];

/** The same shape the bill header's code fields use: a select over a lookup table. */
const codeField = (key: string, label: string, lookup: LookupModule): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  class: 'col-span-full',
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query: lookup.gql.all },
  },
  validations: [VALIDATOR_REQUIRED],
});

/**
 * Midnight on the day that was picked, in the shape the LocalDateTime scalar
 * parses.
 *
 * The control asks for a day, because a reconciliation covers one: the service
 * formats this value as a date and never reads the time off it. The argument is
 * still a LocalDateTime, and `2026-09-05` on its own fails to coerce, so the
 * time is supplied here rather than asked of the operator -- which is what the
 * expiry-change form does instead, where the time is real.
 *
 * The day is taken apart as text rather than through `new Date`, which reads a
 * bare date as UTC and would land on the day before in any timezone west of
 * Greenwich.
 */
export const atStartOfDay = (value?: string | Date): string | undefined => {
  if (!value) return undefined;

  if (value instanceof Date) {
    const pad = (part: number) => `${part}`.padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T00:00:00`;
  }

  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? `${day}T00:00:00` : undefined;
};

/**
 * Opens the form and sends the request.
 *
 * The date is bounded at today because a day that has not finished has nothing
 * to reconcile, which is the same rule the backend enforces before it sends
 * anything.
 */
export function requestReconciliationBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'refresh',
    label: 'Request Reconciliation',
    permissions: RECONCILIATION_PERMISSIONS,
    click: () => {
      const ref = comp.vs?.openDialog({
        data: {
          title: 'Request Reconciliation',
          subTitle:
            'Asks GePG for every payment it took on one day. ' +
            'GePG acknowledges the request; the statement itself follows separately.',
          fieldsClass: 'grid grid-cols-1 gap-4',
          fields: [
            {
              key: 'transactionDate',
              label: 'Transaction date',
              hint: 'The day being reconciled, not the day you are asking',
              type: FieldType.date,
              class: 'col-span-full',
              max: new Date(),
              validations: [VALIDATOR_REQUIRED],
            },
            codeField('spGrpCodeUid', 'SP Group Code', SP_GRP_CODE),
            codeField('systemCodeUid', 'System Code', SYSTEM_CODE),
          ],
          onSubmit: async (data?: any) => {
            await comp.fs.fetch({
              mutation: REQUEST_RECONCILIATION,
              notify: true,
              loadingOn: 'gepg-reconciliation',
              variables: {
                transactionDate: atStartOfDay(data?.transactionDate),
                spGrpCodeUid: data?.spGrpCodeUid,
                systemCodeUid: data?.systemCodeUid,
              },
              // The grid will not change yet — the statement has not arrived —
              // but a reload costs nothing and saves a stale screen once the
              // callback that stores it exists.
              successFn: () => payment$.next(true),
            });
            ref?.close();
          },
        } as FormParameters,
        component: FormComponent,
        width: '96%',
        maxWidth: '520px',
      });
    },
  };
}

/**
 * Asks GePG again for a day already recorded, from the requests list.
 *
 * The saved row holds all three things the mutation needs -- the day, the SP
 * group code and the system code -- so this asks for nothing and confirms
 * instead, the same way sending a saved re-use does. Until now the only way to
 * reconcile a day again was to retype it into the form, matching two codes by
 * eye against the row already on the screen.
 *
 * It sends a **new** request rather than retrying the old one. GePG identifies a
 * reconciliation by its ReqId and the backend mints a fresh one per call, so
 * this adds a row beside the original rather than replacing it -- which is what
 * asking again actually is, and why the table does not refuse a day it already
 * carries.
 *
 * A row action: it acts on the record picked out of the list, and the header
 * already carries the form for a day that has never been asked for.
 */
export function resendReconciliationBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Ask GePG Again',
    permissions: RECONCILIATION_PERMISSIONS,
    // Hidden where a row is missing either code. Both columns are NOT NULL, so
    // that means a read that did not ask for them rather than a broken record.
    showFunction: (data: any) => !!data?.spGrpCode?.id && !!data?.systemCode?.id,
    confirmDataMapper: (data?: any) => ({
      title: 'Ask GePG Again',
      message:
        `Ask GePG once more for every payment it took on ${
          data?.transactionDate?.toString().slice(0, 10) ?? 'this day'
        }, under the same codes? This sends a new request; the original stays as it is.`,
      confirmText: 'Send',
    }),
    click: async (data?: any) => {
      await comp.fs.fetch({
        mutation: REQUEST_RECONCILIATION,
        notify: true,
        loadingOn: 'content',
        variables: {
          spGrpCodeUid: data?.spGrpCode?.id,
          systemCodeUid: data?.systemCode?.id,
          transactionDate: atStartOfDay(data?.transactionDate),
        },
        successFn: () => payment$.next(true),
      });
    },
  };
}

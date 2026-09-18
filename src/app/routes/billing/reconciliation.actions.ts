import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { LookupModule } from '@shared/lookup';
import { SP_GRP_CODE, SYSTEM_CODE } from '@routes/settings/settings-lookups';

import {
  REQUEST_RECONCILIATION,
  SAVE_RECONCILIATION_REQUEST,
  SEND_RECONCILIATION_REQUEST,
} from './reconciliation.graphql';
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
 * Opens the day-and-codes form and runs one mutation with what it collected.
 *
 * The date is bounded at today because a day that has not finished has nothing
 * to reconcile, which is the same rule the backend enforces before it sends
 * anything.
 *
 * Both buttons below take the same three values; they differ only in which
 * mutation receives them, so the form is described once.
 */
function promptForDay(
  comp: BaseComponent,
  form: { title: string; subTitle: string },
  mutation: any,
  loadingOn: string,
) {
  const ref = comp.vs?.openDialog({
    data: {
      ...form,
      fieldsClass: 'grid grid-cols-1 gap-4',
      fields: [
        {
          key: 'transactionDate',
          label: 'Transaction date',
          hint: 'The day being reconciled, not the day you are asking',
          // dateTime, not date: the mutation's transactionDate argument is a
          // LocalDateTime, which refuses a bare date.
          type: FieldType.dateTime,
          class: 'col-span-full',
          // maxDate, not max: the date control binds [min]/[max] from
          // minDate/maxDate, and max alone left the picker unbounded.
          maxDate: new Date(),
          validations: [VALIDATOR_REQUIRED],
        },
        codeField('spGrpCodeUid', 'SP Group Code', SP_GRP_CODE),
        codeField('systemCodeUid', 'System Code', SYSTEM_CODE),
      ],
      onSubmit: async (data?: any) => {
        await comp.fs.fetch({
          mutation,
          notify: true,
          loadingOn,
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
}

/**
 * Records a reconciliation without sending it.
 *
 * The first of the two steps, and the one that costs nothing: the row says which
 * day and under which codes, and GePG hears about it only when the row is sent
 * — see `sendReconciliationBtn`. The same pair of steps a control number re-use
 * takes, and the reason for having it here is that a reconciliation is a
 * decision about which day to check before it is a message.
 */
export function saveReconciliationBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'add',
    label: 'New Reconciliation',
    permissions: RECONCILIATION_PERMISSIONS,
    click: () =>
      promptForDay(
        comp,
        {
          title: 'New Reconciliation',
          subTitle:
            'Records a day to reconcile. Nothing goes to GePG until the row is sent ' +
            'from the list.',
        },
        SAVE_RECONCILIATION_REQUEST,
        'gepg-reconciliation-save',
      ),
  };
}

/**
 * Records a reconciliation and sends it, in one go.
 *
 * The shortcut for someone who already knows the day they want: the backend
 * saves the row and sends it, so a request made this way leaves the same record
 * behind as one prepared first and sent afterwards.
 */
export function requestReconciliationBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'refresh',
    label: 'Request Reconciliation',
    permissions: RECONCILIATION_PERMISSIONS,
    click: () =>
      promptForDay(
        comp,
        {
          title: 'Request Reconciliation',
          subTitle:
            'Asks GePG for every payment it took on one day. ' +
            'GePG acknowledges the request; the statement itself follows separately.',
        },
        REQUEST_RECONCILIATION,
        'gepg-reconciliation',
      ),
  };
}

/**
 * Sends a saved reconciliation to GePG, from the requests list.
 *
 * The row is what is sent: only its identifier goes to the backend, and the day
 * and both codes come off the record there. Until now a row sent nothing — the
 * only way to reconcile a day was to type it into the form, and asking again
 * meant retyping it while matching two codes by eye against the row already on
 * the screen.
 *
 * Sending a row that has already gone asks GePG the same question again rather
 * than repeating a message: the backend mints a fresh ReqId per send, and GePG
 * tells the attempts apart by it. That is what a retry, or a payment that landed
 * late, actually is — which is also why the table does not refuse a day it
 * already carries.
 *
 * A row action: it acts on the record picked out of the list, and the header
 * already carries the form for a day that has not been recorded yet.
 */
export function sendReconciliationBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Send to GePG',
    permissions: RECONCILIATION_PERMISSIONS,
    confirmDataMapper: (data?: any) => ({
      title: 'Send to GePG',
      message:
        `Ask GePG for every payment it took on ${
          data?.transactionDate?.toString().slice(0, 10) ?? 'this day'
        }, under the codes recorded here?` +
        (isSent(data)
          ? ' This day has already been asked for; this sends a new request beside it.'
          : ' GePG acknowledges the request; the statement itself follows separately.'),
      confirmText: 'Send',
    }),
    click: async (data?: any) => {
      await comp.fs.fetch({
        mutation: SEND_RECONCILIATION_REQUEST,
        notify: true,
        loadingOn: 'content',
        variables: { uid: data?.id },
      });
    },
  };
}

/**
 * Whether a row has been sent, read off its request id.
 *
 * There is no column saying so — the DBA's table has nowhere to put it — so the
 * backend leaves a placeholder in `assignedNumber` until GePG accepts the
 * request and replaces it with the real ReqId.
 */
export const isSent = (row?: any): boolean =>
  !!row?.assignedNumber && !`${row.assignedNumber}`.startsWith('RCQ-');

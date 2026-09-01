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
 * Asking GePG to reconcile a day, from the payments screen.
 *
 * This belongs here rather than on a bill: reconciliation names a date and a
 * service provider group, and the statement it asks for covers every bill paid
 * that day. Gated on the payment roles for the same reason — reconciliation is
 * how the payments on this screen get checked against what GePG says it took.
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
                transactionDate: data?.transactionDate,
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

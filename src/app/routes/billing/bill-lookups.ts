import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { defineLookup, lookupRefGqlFields, LookupModule } from '@shared/lookup';

/**
 * The bill header is the one operational billing table shaped like a lookup —
 * five plain operations over a named record — so it renders from a config.
 *
 * The bill, its items and its total do not: they are written together in one
 * transaction and their amounts are derived, which is what the raise screen is
 * for.
 */
export const BILL_HEADER = defineLookup({
  slug: 'bill-headers',
  entity: 'BillHeader',
  entityPlural: 'BillHeaders',
  permission: 'BILL_HEADER',
  label: 'Bill Header',
  pluralLabel: 'Bill Headers',
  subtitle: 'The codes a bill is raised under, and the window it is valid for',
  icon: 'bill_alt',
  extraGqlFields: `
  reqId
  grpBillId
  appliedDate
  expiredDate
  systemCode { ${lookupRefGqlFields} }
  spGrpCode { ${lookupRefGqlFields} }
  billPayOption { ${lookupRefGqlFields} }
  billPaymentPlan { ${lookupRefGqlFields} }
  financialYear { ${lookupRefGqlFields} }
`,
  extraFields: [
    { key: 'reqId', label: 'Request Id', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'grpBillId',
      label: 'Group Bill Id',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'appliedDate',
      label: 'Applied Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'expiredDate',
      label: 'Expiry Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    'reqId as Request Id',
    'grpBillId as Group Bill Id',
    { field: 'appliedDate', header: 'Applied' },
    { field: 'expiredDate', header: 'Expires' },
  ],
});

export const BILL_CONFIGURATION_LOOKUPS: LookupModule[] = [BILL_HEADER];

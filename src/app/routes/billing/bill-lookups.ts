import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { defineLookup, lookupRefGqlFields, LookupModule } from '@shared/lookup';
import {
  BILL_PAY_OPTION,
  BILL_PAYMENT_PLAN,
  FINANCIAL_YEAR,
  SP_GRP_CODE,
  SYSTEM_CODE,
} from '@routes/settings/settings-lookups';

/**
 * One of the codes a header is raised under. Every one of them is `String!` on
 * `BillHeaderDtoInput` — the backend's `@NotBlank` becomes a non-null in the
 * schema — so a header that leaves one out is rejected before the resolver runs.
 */
const codeField = (key: string, label: string, lookup: LookupModule): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query: lookup.gql.all },
  },
  validations: [VALIDATOR_REQUIRED],
});

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
  // `reqId` and `grpBillId` are shown in the list but not edited: the backend
  // generates the request id, and the group bill id is the number of the bill
  // raised under this header, which nobody can type in advance.
  extraFields: [
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
    codeField('systemCodeUid', 'System Code', SYSTEM_CODE),
    codeField('spGrpCodeUid', 'SP Group Code', SP_GRP_CODE),
    codeField('billPayOptionUid', 'Bill Pay Option', BILL_PAY_OPTION),
    codeField('billPaymentPlanUid', 'Bill Payment Plan', BILL_PAYMENT_PLAN),
    codeField('financialYearUid', 'Financial Year', FINANCIAL_YEAR),
  ],
  extraColumns: [
    'reqId as Request Id',
    'grpBillId as Group Bill Id',
    { field: 'appliedDate', header: 'Applied' },
    { field: 'expiredDate', header: 'Expires' },
  ],
  /** The record comes back with the codes nested; the form edits their ids. */
  toModel: (data) => ({
    systemCodeUid: data?.systemCode?.id,
    spGrpCodeUid: data?.spGrpCode?.id,
    billPayOptionUid: data?.billPayOption?.id,
    billPaymentPlanUid: data?.billPaymentPlan?.id,
    financialYearUid: data?.financialYear?.id,
  }),
});

export const BILL_CONFIGURATION_LOOKUPS: LookupModule[] = [BILL_HEADER];

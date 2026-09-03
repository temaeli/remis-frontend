import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { defineLookup, entityLinkPanels, lookupRefGqlFields, LookupModule } from '@shared/lookup';

import { gepgFlowPanels } from './bill-gepg.panels';
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
 * The organisation register, which has no lookup screen here — it is a party
 * record, not billing configuration — but is what a header's counterparty links
 * point at.
 */
const ALL_BUSINESS_NAMES = gql`
  query allBusinessNames {
    allBusinessNames {
      id
      name
    }
  }
`;

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
  /**
   * Two things, in one list because a lookup takes one `extraContents`.
   *
   * First, who the bill is raised against. A join table rather than a column on
   * the header, so a header may name several organisations, one, or none —
   * nothing in the schema requires a counterparty. The pair is UNIQUE on this
   * one, unlike its agreement twin, so linking the same organisation twice
   * returns the existing row rather than failing.
   *
   * Then what GePG has been told about this header and what it answered: the
   * same four tabs the bill screen shows, because both are reading the same
   * header. GePG issues a control number against a header, not a bill.
   */
  extraContents: (comp, record) => [
    ...entityLinkPanels(
      comp,
      [
        {
          entity: 'BillHeaderBusinessName',
          byOwnerQuery: 'billHeaderBusinessNamesByBillHeader',
          ownerArg: 'billHeaderUid',
          targetArg: 'businessNameUid',
          field: 'businessName',
          label: 'Organisation',
          pluralLabel: 'Organisations',
          icon: 'institution',
          permission: 'BILL_HEADER_BUSINESS_NAME',
          optionsQuery: ALL_BUSINESS_NAMES,
        },
      ],
      record?.id,
    ),
    ...gepgFlowPanels(record?.id),
  ],
});

/**
 * The one billing table that spends the descriptive slots on something else: no
 * `name` and no `description`, but a control number and the reason it was used
 * again. Both are unique, so a stock phrase like "customer request" can only be
 * recorded once — the reason has to say something about this bill.
 *
 * Records a decision rather than driving one. Saving here does not ask GePG for
 * anything and does not change the bill named; it is the audit trail for a
 * number that appears on more than one.
 */
export const REUSE = defineLookup({
  slug: 'reuses',
  entity: 'Reuse',
  entityPlural: 'Reuses',
  permission: 'REUSE',
  label: 'Control Number Re-use',
  pluralLabel: 'Control Number Re-uses',
  subtitle: 'Control numbers used again, and why',
  icon: 'refresh',
  nameKey: 'controlNumber',
  descriptiveGqlFields: `
  assignedCode
  controlNumber
  reason
`,
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'controlNumber',
      label: 'Control Number',
      hint: 'The GePG number being used again',
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
      key: 'reason',
      label: 'Reason',
      hint: 'Must be unique — describe this bill, not the general case',
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  baseColumns: [
    'index',
    { field: 'controlNumber', header: 'Control Number' },
    { field: 'assignedCode', header: 'Assigned Code' },
    'reason',
  ],
  extraGqlFields: `
  billHeader { ${lookupRefGqlFields} }
`,
  extraFields: [
    {
      key: 'billHeaderUid',
      label: 'Bill Header',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: BILL_HEADER.gql.all },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: ['billHeader.name as Bill Header'],
  /** The record comes back with the header nested; the form edits its id. */
  toModel: (data) => ({ billHeaderUid: data?.billHeader?.id }),
});

export const BILL_CONFIGURATION_LOOKUPS: LookupModule[] = [BILL_HEADER, REUSE];

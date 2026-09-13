import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { defineLookup, entityLinkPanels, lookupRefGqlFields, LookupModule } from '@shared/lookup';

import { billHeaderRecordPanels } from './bill-header.panels';
import { gepgFlowPanels } from './bill-gepg.panels';
import { billHeaderGepgRecordPanels } from './bill-header.records.panels';
import {
  sendCancellationRequestToGepgBtn,
  sendChangeRequestToGepgBtn,
  sendReuseToGepgBtn,
} from './bill-gepg.actions';
import {
  BILL_HEADERS_SETTING,
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

/** The units a header can be linked to, for the tab on its page. */
const ALL_UNITS = gql`
  query allUnits {
    allUnits {
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
   * Every record that names this header, in one list because a lookup takes one
   * `extraContents`. Nineteen tables carry a `bill_headers_id`; these are all of
   * them, grouped by what a reader is actually asking.
   *
   * First, who the bill is raised against. A join table rather than a column on
   * the header, so a header may name several organisations, one, or none —
   * nothing in the schema requires a counterparty. The pair is UNIQUE on this
   * one, unlike its agreement twin, so linking the same organisation twice
   * returns the existing row rather than failing.
   *
   * Then the four things the header owns outright — the bills raised under it,
   * what has been paid against it, the statuses it has passed through, and the
   * control numbers recorded as reused. See `bill-header.panels`.
   *
   * Then what GePG has been told about this header and what it answered: the
   * same four tabs the bill screen shows, because both are reading the same
   * header. GePG issues a control number against a header, not a bill. Those
   * four cover thirteen tables between them, read as conversations rather than
   * as rows.
   *
   * Then those same thirteen tables again, one tab each, because a folded
   * conversation loses what a row says -- a cancellation response has a status,
   * a code and a description that a trail step flattens into one line. The bill
   * screen shows only the flows; this is the header's own record, so it shows
   * both. See `bill-header.records.panels`.
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
        /**
         * Where this bill came from.
         *
         * A settings row is the template an automatic bill is assembled out of,
         * and it is reusable — the same template raises a bill every time the
         * step it hangs off is reached. So this is a join, not a column: one
         * template, many headers. A header with nothing here was typed rather
         * than raised.
         */
        {
          entity: 'BillHeaderBillHeadersSetting',
          byOwnerQuery: 'billHeaderBillHeadersSettingsByBillHeader',
          ownerArg: 'billHeaderUid',
          targetArg: 'billHeadersSettingUid',
          field: 'billHeadersSetting',
          label: 'Bill Template',
          pluralLabel: 'Bill Templates',
          icon: 'settings',
          permission: 'BILL_HEADER_BILL_HEADERS_SETTING',
          optionsQuery: BILL_HEADERS_SETTING.gql.all,
        },
        /**
         * The units billed under this header. A join rather than a column, so a
         * header can cover several units and a unit several headers. The pair is
         * UNIQUE, so linking the same unit twice returns the existing row.
         */
        {
          entity: 'UnitBillHeader',
          byOwnerQuery: 'unitBillHeadersByBillHeader',
          ownerArg: 'billHeaderUid',
          targetArg: 'unitUid',
          field: 'unit',
          label: 'Unit',
          pluralLabel: 'Units',
          icon: 'domain',
          permission: 'UNIT_BILL_HEADER',
          optionsQuery: ALL_UNITS,
        },
      ],
      record?.id,
    ),
    ...billHeaderRecordPanels(comp, record?.id),
    ...gepgFlowPanels(record?.id),
    ...billHeaderGepgRecordPanels(record?.id),
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
  /**
   * Saving a re-use records a decision; this is what sends it. Confined to the
   * row menu because it acts on the record picked out of the list — see
   * `sendReuseToGepgBtn`.
   */
  rowActions: (comp) => [sendReuseToGepgBtn(comp)],
});

/** The bill a request is raised against, as a select over the header list. */
const billHeaderField: FieldConfig = {
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
};

/**
 * A request to move a bill's expiry date at GePG.
 *
 * Saved first and sent second, the way a control number re-use is: the row says
 * which bill, which date and why, and nothing reaches GePG until the row action
 * sends it. Preparing an amendment and reading it back before it goes is worth
 * more here than anywhere else — the date is what a payer has left to pay in.
 *
 * `assignedNumber` and `name` are shown but never edited. Both exist to satisfy
 * UNIQUE constraints on a row identified by the bill it names, so the backend
 * generates them.
 */
export const BILL_CHANGE_REQUEST = defineLookup({
  slug: 'bill-change-requests',
  entity: 'BillChangeRequest',
  entityPlural: 'BillChangeRequests',
  permission: 'BILL_CHANGE_REQUEST',
  label: 'Expiry Change Request',
  pluralLabel: 'Expiry Change Requests',
  subtitle: 'Expiry dates asked of GePG, and why',
  icon: 'calendar',
  nameKey: 'assignedNumber',
  descriptiveGqlFields: `
  assignedNumber
  updateReason
  latestExpiryDate
  requestedAt
`,
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'latestExpiryDate',
      label: 'New Expiry Date',
      hint: 'Must be in the future — GePG refuses a date that has passed',
      type: FieldType.dateTime,
      minDate: new Date(),
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'updateReason',
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
    { field: 'assignedNumber', header: 'Request' },
    { field: 'latestExpiryDate', header: 'New Expiry' },
    { field: 'updateReason', header: 'Reason' },
    { field: 'requestedAt', header: 'Asked At' },
  ],
  extraGqlFields: `
  billHeader { ${lookupRefGqlFields} }
`,
  extraFields: [billHeaderField],
  extraColumns: ['billHeader.name as Bill Header'],
  /** The record comes back with the header nested; the form edits its id. */
  toModel: (data) => ({ billHeaderUid: data?.billHeader?.id }),
  /** Saving records the change; this is what sends it — see `sendChangeRequestToGepgBtn`. */
  rowActions: (comp) => [sendChangeRequestToGepgBtn(comp)],
});

/**
 * A request to cancel a bill's control number at GePG.
 *
 * The same two steps again, and the flow they matter most for: a cancellation
 * retires every bill under the header and cannot be taken back. The number is
 * not asked for — it is whichever number GePG issued for the bill, filled in by
 * the backend, so a cancellation cannot name a number the bill does not hold. A
 * bill still waiting for its first number can be recorded here all the same;
 * whether GePG has anything to cancel is a question for the send.
 *
 * Backed by `normal_bill_control_number_cancellation_reasons`, which is the
 * first row of the DBA's cancellation chain and the one a person fills in; the
 * request row beside it holds the XML and is written by the send.
 */
export const BILL_CANCELLATION_REQUEST = defineLookup({
  slug: 'bill-cancellation-requests',
  entity: 'BillCancellationRequest',
  entityPlural: 'BillCancellationRequests',
  permission: 'BILL_CANCELLATION_REQUEST',
  label: 'Cancellation Request',
  pluralLabel: 'Cancellation Requests',
  subtitle: 'Control numbers asked to be retired, and why',
  icon: 'delete',
  nameKey: 'assignedNumber',
  descriptiveGqlFields: `
  assignedNumber
  reason
  cancelledControlNumber
  requestedAt
`,
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
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
    { field: 'assignedNumber', header: 'Request' },
    // Zero means GePG had not issued a number when the request was written --
    // the column is NOT NULL, so the row had to hold something. The send fills
    // in the real number.
    {
      field: 'cancelledControlNumber',
      header: 'Control Number',
      valueFn: (row) =>
        `${row?.cancelledControlNumber ?? 0}` === '0'
          ? 'Not issued yet'
          : row?.cancelledControlNumber,
    },
    'reason',
    { field: 'requestedAt', header: 'Asked At' },
  ],
  extraGqlFields: `
  billHeader { ${lookupRefGqlFields} }
`,
  extraFields: [billHeaderField],
  extraColumns: ['billHeader.name as Bill Header'],
  toModel: (data) => ({ billHeaderUid: data?.billHeader?.id }),
  /** Saving records the cancellation; this is what sends it. */
  rowActions: (comp) => [sendCancellationRequestToGepgBtn(comp)],
});

export const BILL_CONFIGURATION_LOOKUPS: LookupModule[] = [
  BILL_HEADER,
  REUSE,
  BILL_CHANGE_REQUEST,
  BILL_CANCELLATION_REQUEST,
];

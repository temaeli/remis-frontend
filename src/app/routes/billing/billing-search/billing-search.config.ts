import { DocumentNode, gql } from '@apollo/client/core';

import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { CORE_STATUS_OPTIONS } from '../../settings/settings-lookups';
import { BILL_OPTION_QUERIES } from '../bill-options.graphql';

/**
 * Search the billing tables one column at a time.
 *
 * Each table has a list query and a count query on the backend, both taking the
 * column to search (a GraphQL enum) and its value. Every column maps to one
 * `findBy…` / `countBy…` repository method from the DBA's list, so the screen
 * offers exactly those columns and nothing more.
 */

/**
 * How a column is searched — decides which control the value is typed into.
 * `status` is one of the CoreStatus labels; `amountRange` is an amount searched
 * between amountFrom and amountTo (only on bill amounts).
 */
export type SearchKind =
  | 'range'
  | 'uuid'
  | 'text'
  | 'number'
  | 'integer'
  | 'bool'
  | 'status'
  | 'amountRange'
  | 'priority';

export interface SearchColumn {
  /** The backend enum constant, e.g. APPLIED_DATE. */
  value: string;
  /** Plain words, e.g. "Applied date". */
  label: string;
  kind: SearchKind;
  /**
   * For links: the option list to pick from, a key of {@link OPTION_QUERIES}.
   * Absent on a link means there is no list query for that record, so its id
   * is typed into a text box instead.
   */
  options?: OptionKey;
}

export interface SearchTable {
  key: string;
  label: string;
  /** Who may search it — the table's own view roles. */
  permissions: string[];
  list: DocumentNode;
  count: DocumentNode;
  columns: SearchColumn[];
  keyColumns: GridKeyColumn[];
}

/** The option lists the link selects choose from: the raise form's, plus bill headers. */
export const OPTION_QUERIES: Record<string, DocumentNode> = {
  ...BILL_OPTION_QUERIES,
  billHeaders: gql`
    query allBillHeaders {
      allBillHeaders {
        id
        name
        assignedNumber
      }
    }
  `,
};

export type OptionKey = keyof typeof OPTION_QUERIES;

/** Money and amounts as they are read: thousands separated, two decimals. */
export const money =(value: unknown): string => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return isNaN(n)
    ? String(value)
    : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/** A status label in words, e.g. WAITING_FOR_PAYMENT -> "Waiting For Payment". */
export const statusLabel = (value: unknown): string =>
  CORE_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? (value ? String(value) : '');

/**
 * The two queries for one table, from the backend's naming: xxxBy and countXxxBy.
 * With `amounts`, both also take amountFrom/amountTo (bill amounts only).
 */
export const queries = (
  list: string,
  count: string,
  fieldEnum: string,
  fields: string,
  amounts = false,
): { list: DocumentNode; count: DocumentNode } => {
  const params = `$field: ${fieldEnum}, $value: String, $from: LocalDateTime, $to: LocalDateTime${
    amounts ? ', $amountFrom: BigDecimal, $amountTo: BigDecimal' : ''
  }`;
  const args = `field: $field, value: $value, from: $from, to: $to${
    amounts ? ', amountFrom: $amountFrom, amountTo: $amountTo' : ''
  }`;
  return {
    list: gql`
      query ${list}(${params}) {
        ${list}(${args}) {
          ${fields}
        }
      }
    `,
    count: gql`
      query ${count}(${params}) {
        ${count}(${args})
      }
    `,
  };
};

// ---------------------------------------------------------------- columns
// Shared by several tables: the audit block every row carries.

const auditColumns = (table: string, withNamed = true): SearchColumn[] => [
  { value: 'CREATED_AT', label: 'Created date', kind: 'range' },
  { value: 'ID', label: `${table} id`, kind: 'uuid' },
  { value: 'CREATED_BY', label: 'Created by', kind: 'uuid', options: 'people' },
  ...(withNamed
    ? ([
        { value: 'ASSIGNED_NUMBER', label: 'Assigned number', kind: 'text' },
        { value: 'NAME', label: 'Name', kind: 'text' },
        { value: 'DESCRIPTION', label: 'Description', kind: 'text' },
      ] as SearchColumn[])
    : []),
  { value: 'ACTIVE', label: 'Active', kind: 'bool' },
  { value: 'IS_DELETED', label: 'Deleted', kind: 'bool' },
];

export const audit = `
  id
  uid: id
  active
  isDeleted
  createdAt
`;
export const ref = `id uid: id name`;

// ---------------------------------------------------------------- tables

const BILL_HEADERS: SearchTable = {
  key: 'bill-headers',
  label: 'Bill Headers',
  permissions: ['ROLE_VIEW_ALL_BILL_HEADER', 'ROLE_VIEW_BILL_HEADER'],
  ...queries(
    'billHeadersBy',
    'countBillHeadersBy',
    'BillHeaderSearchField',
    `${audit}
    assignedNumber
    name
    description
    reqId
    grpBillId
    appliedDate
    expiredDate
    systemCode { ${ref} }
    spGrpCode { ${ref} }
    billPayOption { ${ref} }
    billPaymentPlan { ${ref} }
    financialYear { ${ref} }`,
  ),
  columns: [
    ...auditColumns('Bill header'),
    { value: 'SYSTEM_CODE', label: 'System code', kind: 'uuid', options: 'systemCodes' },
    { value: 'REQ_ID', label: 'Request id', kind: 'text' },
    { value: 'SP_GRP_CODE', label: 'SP group code', kind: 'uuid', options: 'spGrpCodes' },
    { value: 'BILL_PAY_OPTION', label: 'Pay option', kind: 'uuid', options: 'billPayOptions' },
    {
      value: 'BILL_PAYMENT_PLAN',
      label: 'Payment plan',
      kind: 'uuid',
      options: 'billPaymentPlans',
    },
    { value: 'GRP_BILL_ID', label: 'Group bill id', kind: 'text' },
    { value: 'APPLIED_DATE', label: 'Applied date', kind: 'range' },
    { value: 'EXPIRED_DATE', label: 'Expiry date', kind: 'range' },
    { value: 'FINANCIAL_YEAR', label: 'Financial year', kind: 'uuid', options: 'financialYears' },
  ],
  keyColumns: [
    'index',
    'assignedNumber as Number',
    'name',
    'reqId as Request Id',
    'grpBillId as Group Bill Id',
    'systemCode.name as System Code',
    'billPayOption.name as Pay Option',
    'financialYear.name as Financial Year',
    { field: 'appliedDate', header: 'Applied', type: 'dateTime' },
    { field: 'expiredDate', header: 'Expires', type: 'dateTime' },
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

const BILL_DETAILS: SearchTable = {
  key: 'bill-details',
  label: 'Bills',
  permissions: ['ROLE_VIEW_ALL_BILL_DETAIL', 'ROLE_VIEW_BILL_DETAIL'],
  // No billId field: on a bill the billid column is mapped as assignedNumber.
  ...queries(
    'billDetailsBy',
    'countBillDetailsBy',
    'BillDetailSearchField',
    `${audit}
    assignedNumber
    name
    description
    generatedAt
    approvedAt
    expiredAt
    billHeader { ${ref} assignedNumber }
    bioData { id name }
    currency { ${ref} }
    financialYear { ${ref} }
    billPayOption { ${ref} }
    collectionCenter { ${ref} }`,
  ),
  columns: [
    { value: 'CREATED_AT', label: 'Created date', kind: 'range' },
    { value: 'ID', label: 'Bill id (record)', kind: 'uuid' },
    { value: 'CREATED_BY', label: 'Created by', kind: 'uuid', options: 'people' },
    { value: 'BILL_ID', label: 'Bill id', kind: 'text' },
    { value: 'NAME', label: 'Name', kind: 'text' },
    { value: 'DESCRIPTION', label: 'Description', kind: 'text' },
    { value: 'ACTIVE', label: 'Active', kind: 'bool' },
    { value: 'IS_DELETED', label: 'Deleted', kind: 'bool' },
    { value: 'BILL_PAY_OPTION', label: 'Pay option', kind: 'uuid', options: 'billPayOptions' },
    {
      value: 'BILL_PAYMENT_PLAN',
      label: 'Payment plan',
      kind: 'uuid',
      options: 'billPaymentPlans',
    },
    {
      value: 'COLLECTION_CENTER',
      label: 'Collection centre',
      kind: 'uuid',
      options: 'collectionCenters',
    },
    { value: 'CURRENCY', label: 'Currency', kind: 'uuid', options: 'currencies' },
    { value: 'BIO_DATA', label: 'Payer', kind: 'uuid', options: 'people' },
    { value: 'EXCHANGE_RATE', label: 'Exchange rate', kind: 'uuid', options: 'exchangeRates' },
    { value: 'FINANCIAL_YEAR', label: 'Financial year', kind: 'uuid', options: 'financialYears' },
    { value: 'GEPG_BILL_TYPE', label: 'GePG bill type', kind: 'uuid', options: 'gepgBillTypes' },
    { value: 'GEPG_PAY_TYPE', label: 'GePG pay type', kind: 'uuid', options: 'gepgPayTypes' },
    { value: 'PAY_PLAN', label: 'Pay plan', kind: 'uuid', options: 'payPlans' },
    { value: 'TIN_DATA', label: 'TIN', kind: 'uuid', options: 'tinDatas' },
    { value: 'BILL_HEADER', label: 'Bill header', kind: 'uuid', options: 'billHeaders' },
    { value: 'SP_CODE', label: 'SP code', kind: 'uuid', options: 'spCodes' },
    { value: 'GENERATED_AT', label: 'Generated date', kind: 'range' },
    { value: 'GENERATED_BY', label: 'Generated by', kind: 'uuid', options: 'people' },
    { value: 'EXPIRED_AT', label: 'Expiry date', kind: 'range' },
    { value: 'APPROVED_AT', label: 'Approved date', kind: 'range' },
    { value: 'APPROVED_BY', label: 'Approved by', kind: 'uuid', options: 'people' },
    { value: 'IDENTITY_TYPE', label: 'Identity type', kind: 'uuid', options: 'identityTypes' },
    {
      value: 'PAYMENT_SERVICE_PROVIDER',
      label: 'Payment service provider',
      kind: 'uuid',
      options: 'paymentServiceProviders',
    },
  ],
  keyColumns: [
    'index',
    'assignedNumber as Bill Id',
    'name',
    'billHeader.name as Bill Header',
    'bioData.name as Payer',
    'currency.name as Currency',
    'financialYear.name as Financial Year',
    { field: 'generatedAt', header: 'Generated', type: 'dateTime' },
    { field: 'expiredAt', header: 'Expires', type: 'dateTime' },
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

const BILL_ITEMS: SearchTable = {
  key: 'bill-items',
  label: 'Bill Items',
  permissions: ['ROLE_VIEW_ALL_BILL_ITEM', 'ROLE_VIEW_BILL_ITEM'],
  ...queries(
    'billItemsBy',
    'countBillItemsBy',
    'BillItemSearchField',
    `${audit}
    assignedNumber
    name
    description
    refBillId
    billItemRef
    quantities
    billItemAmt
    billItemEqvAmt
    finalBillItemAmt
    finalBillItemEqvAmt
    fee { ${ref} }
    financialYear { ${ref} }`,
  ),
  columns: [
    ...auditColumns('Bill item'),
    { value: 'BILL_DETAIL', label: 'Bill (record id)', kind: 'uuid' },
    { value: 'REF_BILL_ID', label: 'Reference bill id', kind: 'text' },
    { value: 'SUB_SP_CODE', label: 'Sub SP code', kind: 'uuid', options: 'subSpCodes' },
    { value: 'GFS_CODE', label: 'GFS code', kind: 'uuid', options: 'gfsCodes' },
    { value: 'BILL_ITEM_REF', label: 'Item reference', kind: 'text' },
    { value: 'BILL_ITEM_AMT', label: 'Amount', kind: 'number' },
    { value: 'BILL_ITEM_EQV_AMT', label: 'Amount (equivalent)', kind: 'number' },
    { value: 'FEE', label: 'Fee', kind: 'uuid', options: 'fees' },
    { value: 'QUANTITIES', label: 'Quantity', kind: 'number' },
    {
      value: 'USE_ITEM_REF_ON_PAY',
      label: 'Use item ref on pay',
      kind: 'uuid',
      options: 'useItemRefOnPays',
    },
    { value: 'VAT', label: 'VAT', kind: 'uuid', options: 'vats' },
    {
      value: 'WITHHOLDING_TAX',
      label: 'Withholding tax',
      kind: 'uuid',
      options: 'withholdingTaxes',
    },
    { value: 'DISCOUNT', label: 'Discount', kind: 'uuid', options: 'discounts' },
    { value: 'FINAL_BILL_ITEM_AMT', label: 'Final amount', kind: 'number' },
    { value: 'FINAL_BILL_ITEM_EQV_AMT', label: 'Final amount (equivalent)', kind: 'number' },
    { value: 'FINANCIAL_YEAR', label: 'Financial year', kind: 'uuid', options: 'financialYears' },
    { value: 'COLLSP', label: 'Collection SP', kind: 'uuid', options: 'collsps' },
  ],
  keyColumns: [
    'index',
    'assignedNumber as Number',
    'name',
    'refBillId as Ref Bill Id',
    'billItemRef as Item Ref',
    'fee.name as Fee',
    { field: 'quantities', header: 'Qty', type: 'number' },
    { field: 'billItemAmt', header: 'Amount', valueFn: (r) => money(r?.billItemAmt) },
    {
      field: 'finalBillItemAmt',
      header: 'Final Amount',
      valueFn: (r) => money(r?.finalBillItemAmt),
    },
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

const CONTROL_NUMBERS: SearchTable = {
  key: 'control-numbers',
  label: 'Control Numbers',
  permissions: ['ROLE_VIEW_ALL_BILL_HEADER', 'ROLE_VIEW_BILL_HEADER'],
  ...queries(
    'normalBillControlNumbersBy',
    'countNormalBillControlNumbersBy',
    'NormalBillControlNumberSearchField',
    `${audit}
    billId
    controlNumber
    resultStatus
    resultStatusCode
    resultStatusDescription
    billHeader { ${ref} assignedNumber }`,
  ),
  columns: [
    ...auditColumns('Control number', false),
    { value: 'BILL_ID', label: 'Bill id', kind: 'text' },
    { value: 'RESULT_STATUS', label: 'Result status', kind: 'text' },
    { value: 'RESULT_STATUS_DESCRIPTION', label: 'Result description', kind: 'text' },
    { value: 'BILL_HEADER', label: 'Bill header', kind: 'uuid', options: 'billHeaders' },
    { value: 'CONTROL_NUMBER', label: 'Control number', kind: 'text' },
    { value: 'RESULT_STATUS_CODE', label: 'Result code', kind: 'number' },
  ],
  keyColumns: [
    'index',
    'controlNumber as Control Number',
    'billId as Bill Id',
    'billHeader.name as Bill Header',
    'resultStatus as Status',
    'resultStatusCode as Code',
    'resultStatusDescription as Description',
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

const PAYMENT_HEADERS: SearchTable = {
  key: 'payment-headers',
  label: 'Payment Headers',
  permissions: ['ROLE_VIEW_ALL_PAYMENT_HEADER', 'ROLE_VIEW_PAYMENT_HEADER'],
  ...queries(
    'paymentHeadersBy',
    'countPaymentHeadersBy',
    'PaymentHeaderSearchField',
    `${audit}
    reqId
    grpBillId
    customerControlNumber
    entryCount
    billHeader { ${ref} assignedNumber }`,
  ),
  columns: [
    ...auditColumns('Payment header', false),
    { value: 'REQ_ID', label: 'Request id', kind: 'text' },
    { value: 'GRP_BILL_ID', label: 'Group bill id', kind: 'text' },
    { value: 'CUSTOMER_CONTROL_NUMBER', label: 'Customer control number', kind: 'text' },
    { value: 'ENTRY_COUNT', label: 'Entry count', kind: 'integer' },
    { value: 'BILL_HEADER', label: 'Bill header', kind: 'uuid', options: 'billHeaders' },
  ],
  keyColumns: [
    'index',
    'reqId as Request Id',
    'grpBillId as Group Bill Id',
    'customerControlNumber as Control Number',
    { field: 'entryCount', header: 'Entries', type: 'number' },
    'billHeader.name as Bill Header',
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

const PAYMENT_TRANSACTIONS: SearchTable = {
  key: 'payment-transactions',
  label: 'Payment Transactions',
  permissions: ['ROLE_VIEW_ALL_PAYMENT_TRANSACTION_DETAIL', 'ROLE_VIEW_PAYMENT_TRANSACTION_DETAIL'],
  ...queries(
    'paymentTransactionDetailsBy',
    'countPaymentTransactionDetailsBy',
    'PaymentTransactionDetailSearchField',
    `${audit}
    assignedNumber
    name
    description
    billId
    billControlNumber
    transactionId
    paymentReferenceId
    billAmount
    paidAmount
    balance
    transactionDateTime
    usedPaymentChannel
    payerName
    payerEmail
    payerCellNumber
    currency { ${ref} }`,
  ),
  columns: [
    ...auditColumns('Payment transaction'),
    { value: 'PAYMENT_HEADER', label: 'Payment header (record id)', kind: 'uuid' },
    { value: 'BILL_ID', label: 'Bill id', kind: 'text' },
    { value: 'BILL_CONTROL_NUMBER', label: 'Control number', kind: 'number' },
    { value: 'TRANSACTION_ID', label: 'Transaction id', kind: 'text' },
    { value: 'BILL_AMOUNT', label: 'Bill amount', kind: 'number' },
    { value: 'PAID_AMOUNT', label: 'Paid amount', kind: 'number' },
    { value: 'TRANSACTION_DATE_TIME', label: 'Transaction date', kind: 'range' },
    { value: 'USED_PAYMENT_CHANNEL', label: 'Payment channel', kind: 'text' },
    { value: 'QUOTE_REFERENCE_ID', label: 'Quote reference', kind: 'text' },
    { value: 'PAYER_EMAIL', label: 'Payer email', kind: 'text' },
    { value: 'PAYER_NAME', label: 'Payer name', kind: 'text' },
    { value: 'PAID_AMOUNT_EQUIVALENT_TZS', label: 'Paid amount (TZS)', kind: 'number' },
    {
      value: 'PAYMENT_SERVICE_PROVIDER',
      label: 'Payment service provider',
      kind: 'uuid',
      options: 'paymentServiceProviders',
    },
    { value: 'CURRENCY', label: 'Currency', kind: 'uuid', options: 'currencies' },
    { value: 'SP_CODE', label: 'SP code', kind: 'uuid', options: 'spCodes' },
    { value: 'BILL_PAY_OPTION', label: 'Pay option', kind: 'uuid', options: 'billPayOptions' },
    { value: 'BALANCE', label: 'Balance', kind: 'number' },
    { value: 'BALANCE_EQUIVALENT_TZS', label: 'Balance (TZS)', kind: 'number' },
    { value: 'THIRD_PARTY_TRANSACTION_ID', label: 'Third-party transaction id', kind: 'text' },
    { value: 'COLLECTION_ACCOUNT_NUMBER', label: 'Collection account', kind: 'text' },
    { value: 'PAYMENT_REFERENCE_ID', label: 'Payment reference', kind: 'text' },
    { value: 'PAYER_CELL_NUMBER', label: 'Payer phone', kind: 'text' },
  ],
  keyColumns: [
    'index',
    'transactionId as Transaction Id',
    'billId as Bill Id',
    'billControlNumber as Control Number',
    'payerName as Payer',
    'currency.name as Currency',
    { field: 'billAmount', header: 'Bill Amount', valueFn: (r) => money(r?.billAmount) },
    { field: 'paidAmount', header: 'Paid', valueFn: (r) => money(r?.paidAmount) },
    { field: 'balance', header: 'Balance', valueFn: (r) => money(r?.balance) },
    'usedPaymentChannel as Channel',
    { field: 'transactionDateTime', header: 'Paid On', type: 'dateTime' },
  ],
};

/**
 * On header statuses and expiry dates the backend calls the number column
 * ASSIGNED_CODE (it still reads the assignedNumber field).
 */
const namedColumns = (table: string): SearchColumn[] => [
  { value: 'CREATED_AT', label: 'Created date', kind: 'range' },
  { value: 'ID', label: `${table} id`, kind: 'uuid' },
  { value: 'CREATED_BY', label: 'Created by', kind: 'uuid', options: 'people' },
  { value: 'ASSIGNED_CODE', label: 'Assigned number', kind: 'text' },
  { value: 'NAME', label: 'Name', kind: 'text' },
  { value: 'DESCRIPTION', label: 'Description', kind: 'text' },
  { value: 'ACTIVE', label: 'Active', kind: 'bool' },
  { value: 'IS_DELETED', label: 'Deleted', kind: 'bool' },
];

const BILL_HEADER_STATUSES: SearchTable = {
  key: 'bill-header-statuses',
  label: 'Bill Header Statuses',
  // No permission set of its own: it answers to the bill header's view roles.
  permissions: ['ROLE_VIEW_ALL_BILL_HEADER', 'ROLE_VIEW_BILL_HEADER'],
  ...queries(
    'billHeaderStatusesBy',
    'countBillHeaderStatusesBy',
    'BillHeaderStatusSearchField',
    `${audit}
    assignedNumber
    name
    description
    status
    billHeader { ${ref} assignedNumber }`,
  ),
  columns: [
    ...namedColumns('Header status'),
    { value: 'BILL_HEADER', label: 'Bill header', kind: 'uuid', options: 'billHeaders' },
    { value: 'STATUS', label: 'Status', kind: 'status' },
  ],
  keyColumns: [
    'index',
    'billHeader.assignedNumber as Header Number',
    'billHeader.name as Bill Header',
    { field: 'status', header: 'Status', valueFn: (r) => statusLabel(r?.status) },
    'assignedNumber as Number',
    'name',
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

const BILL_AMOUNTS: SearchTable = {
  key: 'bill-amounts',
  label: 'Bill Amounts',
  // Answers to the bill's view roles.
  permissions: ['ROLE_VIEW_ALL_BILL_DETAIL', 'ROLE_VIEW_BILL_DETAIL'],
  ...queries(
    'billAmountsBy',
    'countBillAmountsBy',
    'BillAmountSearchField',
    `${audit}
    billAmt
    billEqvAmt
    billDetail { ${ref} assignedNumber }`,
    true,
  ),
  columns: [
    ...auditColumns('Bill amount', false),
    { value: 'BILL_AMT', label: 'Amount', kind: 'amountRange' },
    { value: 'BILL_EQV_AMT', label: 'Amount (equivalent)', kind: 'amountRange' },
    { value: 'BILL_DETAIL', label: 'Bill (record id)', kind: 'uuid' },
  ],
  keyColumns: [
    'index',
    'billDetail.assignedNumber as Bill Id',
    'billDetail.name as Bill',
    { field: 'billAmt', header: 'Amount', valueFn: (r) => money(r?.billAmt) },
    { field: 'billEqvAmt', header: 'Equivalent', valueFn: (r) => money(r?.billEqvAmt) },
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

const BILL_EXPIRY_DATES: SearchTable = {
  key: 'bill-expiry-dates',
  label: 'Bill Expiry Dates',
  permissions: ['ROLE_VIEW_ALL_BILL_EXPIRY_DATE', 'ROLE_VIEW_BILL_EXPIRY_DATE'],
  ...queries(
    'billExpiryDatesBy',
    'countBillExpiryDatesBy',
    'BillExpiryDateSearchField',
    `${audit}
    assignedNumber
    name
    description
    expiryDate
    billHeader { ${ref} assignedNumber }`,
  ),
  columns: [
    ...namedColumns('Expiry date'),
    { value: 'BILL_HEADER', label: 'Bill header', kind: 'uuid', options: 'billHeaders' },
    { value: 'EXPIRY_DATE', label: 'Expiry date', kind: 'range' },
  ],
  keyColumns: [
    'index',
    'billHeader.assignedNumber as Header Number',
    'billHeader.name as Bill Header',
    { field: 'expiryDate', header: 'Expires', type: 'dateTime' },
    'assignedNumber as Number',
    'name',
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

/** The nine tables, in the order the page offers them. */
export const SEARCH_TABLES: SearchTable[] = [
  BILL_HEADERS,
  BILL_DETAILS,
  BILL_ITEMS,
  BILL_HEADER_STATUSES,
  BILL_AMOUNTS,
  BILL_EXPIRY_DATES,
  CONTROL_NUMBERS,
  PAYMENT_HEADERS,
  PAYMENT_TRANSACTIONS,
];

/** Anyone who may search at least one of the tables may open the page. */
export const BILLING_SEARCH_PERMISSIONS = [...new Set(SEARCH_TABLES.flatMap((t) => t.permissions))];

/**
 * What one Search screen offers: its heading, its tables, and the option lists
 * its link columns pick from. The screen reads it from the route's
 * `searchPage` data, and is the billing one when a route gives none.
 */
export interface SearchPage {
  title: string;
  subtitle: string;
  tables: SearchTable[];
  options: Record<string, DocumentNode>;
}

export const BILLING_SEARCH_PAGE: SearchPage = {
  title: 'Billing Search',
  subtitle:
    'Find bills, items, statuses, amounts, expiry dates, control numbers and payments by any one column',
  tables: SEARCH_TABLES,
  options: OPTION_QUERIES,
};

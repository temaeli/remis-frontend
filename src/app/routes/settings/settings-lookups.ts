import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { USERS_BY_DESIGNATION_PAGEABLE } from '@routes/users-managment/users/user.graphql';

import { defineLookup, lookupRefGqlFields, LookupModule } from '@shared/lookup';

/**
 * Every lookup table in the settings module: the general configuration, the GePG
 * billing codes and the reference data costing and valuation share.
 *
 * They are all the same screen with a different name — a paged list, a detail
 * page and an upsert form over a five-operation CRUD API — so they are declared
 * here as configs and rendered by the shared lookup screens rather than copied
 * out twenty-five times.
 */

/** A required amount, the shape the numeric columns on these tables take. */
const amountField = (key: string, label: string, hint?: string): FieldConfig => ({
  key,
  label,
  hint,
  type: FieldType.decimal,
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/** The start/end pair that `Discount` and `FinancialYear` both carry. */
const dateRangeFields = (): FieldConfig[] => [
  {
    key: 'startedAt',
    label: 'Start Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'endedAt',
    label: 'End Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
  },
];

//  General — configuration that is not access control, under `modules.setting.general`.

export const IDENTITY_TYPE = defineLookup({
  slug: 'identity-types',
  entity: 'IdentityType',
  entityPlural: 'IdentityTypes',
  permission: 'IDENTITY_TYPE',
  label: 'Identity Type',
  pluralLabel: 'Identity Types',
  subtitle: 'How people and organisations on the register are identified',
  icon: 'id_card',
});

export const BUSINESS_NAME = defineLookup({
  slug: 'business-names',
  entity: 'BusinessName',
  entityPlural: 'BusinessNames',
  permission: 'BUSINESS_NAME',
  label: 'Business Name',
  pluralLabel: 'Business Names',
  subtitle: 'Organisations and other named entities on the register',
  icon: 'institution',
  extraGqlFields: `
  identityType {
    ${lookupRefGqlFields}
  }
  isPublic
`,
  extraFields: [
    {
      key: 'identityTypeUid',
      label: 'Identity Type',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: IDENTITY_TYPE.gql.all },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'isPublic',
      label: 'Publicly Visible',
      type: FieldType.toggle,
      value: true,
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    { field: 'identityType', valueFn: (row) => row?.identityType?.name },
    {
      field: 'isPublic',
      header: 'Public',
      valueFn: (row) => (row?.isPublic ? 'Yes' : 'No'),
      valueClassMapper: (row) => (row?.isPublic ? 'text-success' : 'text-danger'),
    },
  ],
  toModel: (data) => ({ identityTypeUid: data?.identityType?.id }),
});

/**
 * Departments and designations live in `uaa`, not the DBA's schema: they carry a
 * real generated `uid`, a different audit block, and their own descriptive
 * columns rather than the assignedNumber/name/description triple. Their
 * controllers also leave the save argument named `dto`.
 */
export const DEPARTMENT = defineLookup({
  slug: 'departments',
  entity: 'Department',
  entityPlural: 'Departments',
  permission: 'DEPARTMENT',
  label: 'Department',
  pluralLabel: 'Departments',
  subtitle: 'Departments staff are assigned to',
  icon: 'group',
  schema: 'uaa',
  saveArg: 'dto',
  descriptiveGqlFields: `
  name
  code
`,
  baseFields: [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'code',
      label: 'Code',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  baseColumns: ['index', 'name', 'code'],
});

export const DESIGNATION = defineLookup({
  slug: 'designations',
  entity: 'Designation',
  entityPlural: 'Designations',
  permission: 'DESIGNATION',
  label: 'Designation',
  pluralLabel: 'Designations',
  subtitle: 'Job titles staff hold',
  icon: 'designation',
  schema: 'uaa',
  saveArg: 'dto',
  // The display name is `title` here, not `name`.
  nameKey: 'title',
  descriptiveGqlFields: `
  code
  title
`,
  baseFields: [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'code',
      label: 'Code',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'title',
      label: 'Title',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  baseColumns: ['index', 'code', 'title'],
  extraContents: (comp, record): ContentParameter[] => {
    const keyColumns: GridKeyColumn[] = [
      'index',
      'bioData.firstName as First Name',
      'bioData.thirdName as Last Name',
      'email',
      'bioData.mobileNumber as Phone Number',
    ];

    return [
      {
        type: 'table',
        name: 'Associated Users',
        label: 'Associated Users',
        icon: 'users',
        keyColumns,
        isPageable: true,
        fetchParameter: {
          query: USERS_BY_DESIGNATION_PAGEABLE,
          variables: { designationUid: record?.uid },
        },
      },
    ];
  },
});

//  Billing — the GePG configuration, under `modules.setting.billing`.

export const BANK_ACCOUNT = defineLookup({
  slug: 'bank-accounts',
  entity: 'BankAccount',
  entityPlural: 'BankAccounts',
  permission: 'BANK_ACCOUNT',
  label: 'Bank Account',
  pluralLabel: 'Bank Accounts',
  subtitle: 'Accounts held by organisations on the register',
  icon: 'bank',
  extraGqlFields: `
  issuer {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    {
      key: 'issuerUid',
      label: 'Issuer',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: BUSINESS_NAME.gql.all },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [{ field: 'issuer', valueFn: (row) => row?.issuer?.name }],
  toModel: (data) => ({ issuerUid: data?.issuer?.id }),
});

export const BILL_PAY_OPTION = defineLookup({
  slug: 'bill-pay-options',
  entity: 'BillPayOption',
  entityPlural: 'BillPayOptions',
  permission: 'BILL_PAY_OPTION',
  label: 'Bill Pay Option',
  pluralLabel: 'Bill Pay Options',
  subtitle: 'How a bill may be paid',
  icon: 'payment',
});

export const BILL_PAYMENT_PLAN = defineLookup({
  slug: 'bill-payment-plans',
  entity: 'BillPaymentPlan',
  entityPlural: 'BillPaymentPlans',
  permission: 'BILL_PAYMENT_PLAN',
  label: 'Bill Payment Plan',
  pluralLabel: 'Bill Payment Plans',
  subtitle: 'The schedules a bill may be settled on',
  icon: 'bill',
});

export const COLLECTION_CENTER = defineLookup({
  slug: 'collection-centers',
  entity: 'CollectionCenter',
  entityPlural: 'CollectionCenters',
  permission: 'COLLECTION_CENTER',
  label: 'Collection Center',
  pluralLabel: 'Collection Centers',
  subtitle: 'Where payments are collected',
  icon: 'location',
});

export const DISCOUNT = defineLookup({
  slug: 'discounts',
  entity: 'Discount',
  entityPlural: 'Discounts',
  permission: 'DISCOUNT',
  label: 'Discount',
  pluralLabel: 'Discounts',
  subtitle: 'Reductions applied to a bill, valid over a date range',
  icon: 'price_tag',
  extraGqlFields: `
  discounts
  days
  startedAt
  endedAt
`,
  extraFields: [
    amountField('discounts', 'Discount'),
    amountField('days', 'Days', 'The table restricts this to -90..90'),
    ...dateRangeFields(),
  ],
  extraColumns: [
    { field: 'discounts', header: 'Discount' },
    'days',
    { field: 'startedAt', header: 'Start Date' },
    { field: 'endedAt', header: 'End Date' },
  ],
});

export const GEPG_BILL_TYPE = defineLookup({
  slug: 'gepg-bill-types',
  entity: 'GepgBillType',
  entityPlural: 'GepgBillTypes',
  permission: 'GEPG_BILL_TYPE',
  label: 'GePG Bill Type',
  pluralLabel: 'GePG Bill Types',
  subtitle: 'The bill types GePG recognises',
  icon: 'bill_alt',
});

export const GEPG_PAY_TYPE = defineLookup({
  slug: 'gepg-pay-types',
  entity: 'GepgPayType',
  entityPlural: 'GepgPayTypes',
  permission: 'GEPG_PAY_TYPE',
  label: 'GePG Pay Type',
  pluralLabel: 'GePG Pay Types',
  subtitle: 'The payment types GePG recognises',
  icon: 'payment_alt',
});

export const GFS_CODE = defineLookup({
  slug: 'gfs-codes',
  entity: 'GfsCode',
  entityPlural: 'GfsCodes',
  permission: 'GFS_CODE',
  label: 'GFS Code',
  pluralLabel: 'GFS Codes',
  subtitle: 'Government Finance Statistics codes',
  icon: 'numbers',
});

export const PAY_LIM_AMOUNT = defineLookup({
  slug: 'pay-lim-amounts',
  entity: 'PayLimAmount',
  entityPlural: 'PayLimAmounts',
  permission: 'PAY_LIM_AMOUNT',
  label: 'Payment Limit Amount',
  pluralLabel: 'Payment Limit Amounts',
  subtitle: 'The ceilings a payment may not exceed',
  icon: 'scales',
  extraGqlFields: `
  payLimAmounts
`,
  extraFields: [amountField('payLimAmounts', 'Limit Amount')],
  extraColumns: [{ field: 'payLimAmounts', header: 'Limit Amount' }],
});

export const PAY_LIM_TYPE = defineLookup({
  slug: 'pay-lim-types',
  entity: 'PayLimType',
  entityPlural: 'PayLimTypes',
  permission: 'PAY_LIM_TYPE',
  label: 'Payment Limit Type',
  pluralLabel: 'Payment Limit Types',
  subtitle: 'How a payment limit is applied',
  icon: 'scales',
});

export const PAY_PLAN = defineLookup({
  slug: 'pay-plans',
  entity: 'PayPlan',
  entityPlural: 'PayPlans',
  permission: 'PAY_PLAN',
  label: 'Payment Plan',
  pluralLabel: 'Payment Plans',
  subtitle: 'The plans a payment may follow',
  icon: 'plan',
});

export const SERVICE_ITEM = defineLookup({
  slug: 'service-items',
  entity: 'ServiceItem',
  entityPlural: 'ServiceItems',
  permission: 'SERVICE_ITEM',
  label: 'Service Item',
  pluralLabel: 'Service Items',
  subtitle: 'The services a bill may be raised for',
  icon: 'services',
});

export const SP_CODE = defineLookup({
  slug: 'sp-codes',
  entity: 'SpCode',
  entityPlural: 'SpCodes',
  permission: 'SP_CODE',
  label: 'Service Provider Code',
  pluralLabel: 'Service Provider Codes',
  subtitle: 'GePG service provider codes',
  icon: 'numbers',
});

export const SP_GRP_CODE = defineLookup({
  slug: 'sp-grp-codes',
  entity: 'SpGrpCode',
  entityPlural: 'SpGrpCodes',
  permission: 'SP_GRP_CODE',
  label: 'Service Provider Group Code',
  pluralLabel: 'Service Provider Group Codes',
  subtitle: 'GePG service provider group codes',
  icon: 'numbers',
  extraGqlFields: `
  spgrpcodes
`,
  extraFields: [amountField('spgrpcodes', 'Group Code Value')],
  extraColumns: [{ field: 'spgrpcodes', header: 'Group Code Value' }],
});

export const SUB_SP_CODE = defineLookup({
  slug: 'sub-sp-codes',
  entity: 'SubSpCode',
  entityPlural: 'SubSpCodes',
  permission: 'SUB_SP_CODE',
  label: 'Sub Service Provider Code',
  pluralLabel: 'Sub Service Provider Codes',
  subtitle: 'GePG sub service provider codes',
  icon: 'numbers',
});

export const SYSTEM_CODE = defineLookup({
  slug: 'system-codes',
  entity: 'SystemCode',
  entityPlural: 'SystemCodes',
  permission: 'SYSTEM_CODE',
  label: 'System Code',
  pluralLabel: 'System Codes',
  subtitle: 'GePG system codes',
  icon: 'system',
  extraGqlFields: `
  systemCodes
`,
  extraFields: [amountField('systemCodes', 'System Code Value')],
  extraColumns: [{ field: 'systemCodes', header: 'System Code Value' }],
});

//  Reference — the data costing and valuation share, under `modules.setting.reference`.

export const COUNTRY = defineLookup({
  slug: 'countries',
  entity: 'Country',
  entityPlural: 'Countries',
  permission: 'COUNTRY',
  label: 'Country',
  pluralLabel: 'Countries',
  subtitle: 'Countries currencies are issued by',
  icon: 'flag',
});

export const CURRENCY = defineLookup({
  slug: 'currencies',
  entity: 'Currency',
  entityPlural: 'Currencies',
  permission: 'CURRENCY',
  label: 'Currency',
  pluralLabel: 'Currencies',
  subtitle: 'Currencies and the country that issues each',
  icon: 'coins',
  extraGqlFields: `
  country {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    {
      key: 'countryUid',
      label: 'Country',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: COUNTRY.gql.all },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [{ field: 'country', valueFn: (row) => row?.country?.name }],
  toModel: (data) => ({ countryUid: data?.country?.id }),
});

export const EXCHANGE_RATE = defineLookup({
  slug: 'exchange-rates',
  entity: 'ExchangeRate',
  entityPlural: 'ExchangeRates',
  permission: 'EXCHANGE_RATE',
  label: 'Exchange Rate',
  pluralLabel: 'Exchange Rates',
  subtitle: 'What each currency is worth against the shilling',
  icon: 'money_exchange',
  extraGqlFields: `
  rateAgainstTzs
  latitude
  longitude
  currency {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    {
      key: 'currencyUid',
      label: 'Currency',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: CURRENCY.gql.all },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    amountField('rateAgainstTzs', 'Rate Against TZS'),
    // Faithful to the table as built rather than meaningful for a rate, and both
    // are NOT NULL, so the form has to ask for them.
    amountField('latitude', 'Latitude'),
    amountField('longitude', 'Longitude'),
  ],
  extraColumns: [
    { field: 'currency', valueFn: (row) => row?.currency?.name },
    { field: 'rateAgainstTzs', header: 'Rate Against TZS' },
  ],
  toModel: (data) => ({ currencyUid: data?.currency?.id }),
});

export const FINANCIAL_YEAR = defineLookup({
  slug: 'financial-years',
  entity: 'FinancialYear',
  entityPlural: 'FinancialYears',
  permission: 'FINANCIAL_YEAR',
  label: 'Financial Year',
  pluralLabel: 'Financial Years',
  subtitle: 'The years costing and valuation are reported against',
  icon: 'calendar',
  extraGqlFields: `
  startedAt
  endedAt
`,
  extraFields: dateRangeFields(),
  extraColumns: [
    { field: 'startedAt', header: 'Start Date' },
    { field: 'endedAt', header: 'End Date' },
  ],
});

export const METER = defineLookup({
  slug: 'meters',
  entity: 'Meter',
  entityPlural: 'Meters',
  permission: 'METER',
  label: 'Meter',
  pluralLabel: 'Meters',
  subtitle: 'Meters on the register',
  icon: 'table',
});

/** Grouped the way the backend groups the packages they come from. */
export const GENERAL_LOOKUPS: LookupModule[] = [
  BUSINESS_NAME,
  IDENTITY_TYPE,
  DEPARTMENT,
  DESIGNATION,
];

export const BILLING_LOOKUPS: LookupModule[] = [
  BANK_ACCOUNT,
  BILL_PAY_OPTION,
  BILL_PAYMENT_PLAN,
  COLLECTION_CENTER,
  DISCOUNT,
  GEPG_BILL_TYPE,
  GEPG_PAY_TYPE,
  GFS_CODE,
  PAY_LIM_AMOUNT,
  PAY_LIM_TYPE,
  PAY_PLAN,
  SERVICE_ITEM,
  SP_CODE,
  SP_GRP_CODE,
  SUB_SP_CODE,
  SYSTEM_CODE,
];

export const REFERENCE_LOOKUPS: LookupModule[] = [
  COUNTRY,
  CURRENCY,
  EXCHANGE_RATE,
  FINANCIAL_YEAR,
  METER,
];

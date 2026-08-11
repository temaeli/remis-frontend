import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { USERS_BY_DESIGNATION_PAGEABLE } from '@routes/users-managment/users/user.graphql';

import { gql } from '@apollo/client/core';
import {
  defineLookup,
  lookupChildGqlFields,
  lookupChildPanel,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';
import { businessNamePeoplePanel, personOrganisationsPanel } from './person-links';

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

/**
 * The coordinate pair every level of the location hierarchy carries. Both are
 * required and stored as `numeric(9,6)`, so the controls round to six places to
 * match rather than letting the database truncate.
 */
const coordinateFields = (): FieldConfig[] => [
  {
    key: 'latitude',
    label: 'Latitude',
    hint: 'Between -90 and 90',
    type: FieldType.decimal,
    decimals: 6,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'longitude',
    label: 'Longitude',
    hint: 'Between -180 and 180',
    type: FieldType.decimal,
    decimals: 6,
    validations: [VALIDATOR_REQUIRED],
  },
];

/**
 * The select each level of the location hierarchy uses to pick its parent. The
 * lookup is passed as a thunk so a level can point at one declared after it.
 */
const parentSelect = (key: string, label: string, parent: () => LookupModule): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query: parent().gql.all },
  },
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

/**
 * The people on the register — `bio_data`, the party record.
 *
 * The primary record of a person: someone exists here whether or not they ever
 * sign in, and a login is attached to them afterwards through the user screen.
 * Creating a user no longer creates a person.
 *
 * Its columns are not the usual `assignedNumber`/`name`/`description` triple —
 * a person has three names, a national ID and contact details — so the
 * descriptive block is replaced rather than extended.
 */
export const PERSON = defineLookup({
  slug: 'people',
  entity: 'BioData',
  entityPlural: 'BioData',
  permission: 'BIO_DATA',
  label: 'Person',
  pluralLabel: 'People',
  subtitle: 'Everyone on the register, whether or not they hold a login',
  icon: 'users',
  descriptiveGqlFields: `
  firstName
  secondName
  thirdName
  name
  nin
  email
  mobileNumber
  identityType {
    ${lookupRefGqlFields}
  }
`,
  nameKey: 'firstName',
  baseFields: [
    { key: 'firstName', label: 'First Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    // bio_data.second_name is NOT NULL, so a middle name is not optional.
    { key: 'secondName', label: 'Middle Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'thirdName', label: 'Last Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
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
    },
    // The four below are UNIQUE on the table where given, and all optional: a
    // person can be registered before their documents are to hand.
    { key: 'nin', label: 'National ID', type: FieldType.input },
    { key: 'mobileNumber', label: 'Mobile Number', type: FieldType.input },
    { key: 'email', label: 'Email', type: FieldType.input, class: 'col-span-full' },
    {
      key: 'name',
      label: 'Listed Name',
      hint: 'Optional. Must be unique — leave blank unless this person is listed under a particular name.',
      type: FieldType.input,
      class: 'col-span-full',
    },
  ],
  baseColumns: [
    { field: 'firstName', header: 'First Name' },
    { field: 'secondName', header: 'Middle Name' },
    { field: 'thirdName', header: 'Last Name' },
    { field: 'nin', header: 'National ID' },
    { field: 'mobileNumber', header: 'Mobile' },
  ],
  toModel: (data) => ({ identityTypeUid: data?.identityType?.id }),
  extraContents: (comp, record) => [personOrganisationsPanel(comp, record?.id)],
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
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => BANK_ACCOUNT, BANK_ACCOUNTS_BY_ISSUER, {
      issuerUid: record?.id,
    }),
    businessNamePeoplePanel(comp, record?.id),
  ],
});

/**
 * A taxpayer's number, held beside the other ways a party is identified. The
 * number is the record's own identifier and is nine characters, far shorter than
 * the generator's twenty, so the form requires it.
 */
export const TIN_DATA = defineLookup({
  slug: 'tin-data',
  entity: 'TinData',
  entityPlural: 'TinDatas',
  permission: 'TIN_DATA',
  label: 'TIN',
  pluralLabel: 'TINs',
  subtitle: 'Taxpayer identification numbers',
  icon: 'id_card',
  descriptiveGqlFields: `
  assignedNumber
  name
  description
  tin
`,
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'assignedNumber',
      label: 'TIN',
      type: FieldType.input,
      hint: 'Nine digits',
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    amountField('tin', 'TIN (numeric)', 'The table holds a second, numeric copy of the number'),
  ],
  baseColumns: ['index', { field: 'assignedNumber', header: 'TIN' }, 'name', 'description'],
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

/**
 * The bank or mobile operator a bill is settled through. Each one is an
 * organisation already on the business name register, so the row points at one
 * rather than repeating its details.
 */
export const PAYMENT_SERVICE_PROVIDER = defineLookup({
  slug: 'payment-service-providers',
  entity: 'PaymentServiceProvider',
  entityPlural: 'PaymentServiceProviders',
  permission: 'PAYMENT_SERVICE_PROVIDER',
  label: 'Payment Service Provider',
  pluralLabel: 'Payment Service Providers',
  subtitle: 'The banks and operators a bill can be paid through',
  icon: 'payment',
  extraGqlFields: `
  businessName {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    {
      key: 'businessNameUid',
      label: 'Business Name',
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
  extraColumns: [{ field: 'businessName', valueFn: (row) => row?.businessName?.name }],
  toModel: (data) => ({ businessNameUid: data?.businessName?.id }),
});

/**
 * The collection service provider a bill line is collected through. The table is
 * named `collsp` and the screen keeps that spelling, so the code and the DBA's
 * schema stay recognisable as the same thing.
 */
export const COLLSP = defineLookup({
  slug: 'collsps',
  entity: 'Collsp',
  entityPlural: 'Collsps',
  permission: 'COLLSP',
  label: 'Collection Service Provider',
  pluralLabel: 'Collection Service Providers',
  subtitle: 'The providers a bill item is collected through',
  icon: 'payment',
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

/**
 * The only billing table with no assigned number. Its `assignedCode` is numeric
 * where the rest of the module has a string, so it is a field of its own rather
 * than the inherited one, and the base block is overridden to match: it is
 * required, because a column with a -90..90 CHECK on it cannot be generated.
 */
export const MINIMUM_PAYMENT = defineLookup({
  slug: 'minimum-payments',
  entity: 'MinimumPayment',
  entityPlural: 'MinimumPayments',
  permission: 'MINIMUM_PAYMENT',
  label: 'Minimum Payment',
  pluralLabel: 'Minimum Payments',
  subtitle: 'The least a payment may be',
  icon: 'money_alt',
  descriptiveGqlFields: `
  name
  description
  minimum
  assignedCode
`,
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    amountField('minimum', 'Minimum'),
    amountField('assignedCode', 'Assigned Code', 'The table restricts this to -90..90'),
  ],
  baseColumns: [
    'index',
    { field: 'assignedCode', header: 'Assigned Code' },
    'name',
    'description',
    'minimum',
  ],
});

export const PAYMENT_GRACE_PERIOD = defineLookup({
  slug: 'payment-grace-periods',
  entity: 'PaymentGracePeriod',
  entityPlural: 'PaymentGracePeriods',
  permission: 'PAYMENT_GRACE_PERIOD',
  label: 'Payment Grace Period',
  pluralLabel: 'Payment Grace Periods',
  subtitle: 'How long a payment may be deferred, before, during and after construction',
  icon: 'clock',
  extraGqlFields: `
  beforeConstructionGracePeriod
  duringConstructionGracePeriod
  afterConstructionGracePeriod
  beforeConstructionDownPaymentPeriod
  duringConstructionDownPaymentPeriod
  afterConstructionDownPaymentPeriod
  beforeConstructionBalanceGracePeriod
  duringConstructionBalanceGracePeriod
  afterConstructionBalanceGracePeriod
`,
  // Nine periods: a grace period, a down payment period and a balance grace
  // period, each stated for the three phases of construction.
  extraFields: [
    amountField('beforeConstructionGracePeriod', 'Grace — Before Construction'),
    amountField('duringConstructionGracePeriod', 'Grace — During Construction'),
    amountField('afterConstructionGracePeriod', 'Grace — After Construction'),
    amountField('beforeConstructionDownPaymentPeriod', 'Down Payment — Before Construction'),
    amountField('duringConstructionDownPaymentPeriod', 'Down Payment — During Construction'),
    amountField('afterConstructionDownPaymentPeriod', 'Down Payment — After Construction'),
    amountField('beforeConstructionBalanceGracePeriod', 'Balance Grace — Before Construction'),
    amountField('duringConstructionBalanceGracePeriod', 'Balance Grace — During Construction'),
    amountField('afterConstructionBalanceGracePeriod', 'Balance Grace — After Construction'),
  ],
  // The nine read better on the detail page than squeezed into the list.
  extraColumns: [
    { field: 'beforeConstructionGracePeriod', header: 'Grace (Before)' },
    { field: 'duringConstructionGracePeriod', header: 'Grace (During)' },
    { field: 'afterConstructionGracePeriod', header: 'Grace (After)' },
  ],
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
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => CURRENCY, CURRENCIES_BY_COUNTRY, { countryUid: record?.id }),
  ],
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
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => EXCHANGE_RATE, EXCHANGE_RATES_BY_CURRENCY, {
      currencyUid: record?.id,
    }),
  ],
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

/**
 * The rates a bill item is priced with. Both hold a multiplier rather than a
 * percentage — 0.18, not 18 — because the billing formula multiplies the bill
 * item amount by them directly. The column is numeric(15,2), so a rate finer
 * than two decimal places cannot be stored.
 */
export const VAT = defineLookup({
  slug: 'vat-rates',
  entity: 'Vat',
  entityPlural: 'Vats',
  permission: 'VAT',
  label: 'VAT Rate',
  pluralLabel: 'VAT Rates',
  subtitle: 'The multiplier applied to a bill item for VAT',
  icon: 'calculator',
  extraGqlFields: `
  vat
`,
  extraFields: [amountField('vat', 'Rate', 'A multiplier, not a percentage — 0.18 for 18%')],
  extraColumns: [{ field: 'vat', header: 'Rate' }],
});

export const WITHHOLDING_TAX = defineLookup({
  slug: 'withholding-taxes',
  entity: 'WithholdingTax',
  entityPlural: 'WithholdingTaxes',
  permission: 'WITHHOLDING_TAX',
  label: 'Withholding Tax',
  pluralLabel: 'Withholding Taxes',
  subtitle: 'The multiplier withheld from a bill item',
  icon: 'scales',
  extraGqlFields: `
  withholdingTax
`,
  extraFields: [
    amountField('withholdingTax', 'Rate', 'A multiplier, not a percentage — 0.05 for 5%'),
  ],
  extraColumns: [{ field: 'withholdingTax', header: 'Rate' }],
});

/**
 * The code is a single character and is UNIQUE, so this table holds one row per
 * distinct code. It cannot be generated — the column takes one character and the
 * generator produces twenty — so the form requires it.
 */
export const USE_ITEM_REF_ON_PAY = defineLookup({
  slug: 'use-item-ref-on-pay',
  entity: 'UseItemRefOnPay',
  entityPlural: 'UseItemRefOnPays',
  permission: 'USE_ITEM_REF_ON_PAY',
  label: 'Use Item Ref On Pay',
  pluralLabel: 'Use Item Ref On Pay',
  subtitle: 'Whether a bill item\'s own reference is used when paying',
  icon: 'price_tag',
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'assignedNumber',
      label: 'Code',
      type: FieldType.input,
      hint: 'A single character',
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  baseColumns: ['index', { field: 'assignedNumber', header: 'Code' }, 'name', 'description'],
});

/**
 * What one unit of a billable thing costs. Every bill item starts here: its
 * amount is this multiplied by the quantity, and the VAT, discount and
 * withholding tax are all multiplied onto that.
 */
export const FEE = defineLookup({
  slug: 'fees',
  entity: 'Fee',
  entityPlural: 'Fees',
  permission: 'FEE',
  label: 'Fee',
  pluralLabel: 'Fees',
  subtitle: 'What one unit of a billable thing costs',
  icon: 'coins',
  extraGqlFields: `
  amount
  minimumPayment {
    id
    uid: id
    name
  }
  paymentGracePeriod {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    amountField('amount', 'Amount'),
    {
      key: 'minimumPaymentUid',
      label: 'Minimum Payment',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: MINIMUM_PAYMENT.gql.all },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'paymentGracePeriodUid',
      label: 'Payment Grace Period',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: PAYMENT_GRACE_PERIOD.gql.all },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    'amount',
    { field: 'minimumPayment', valueFn: (row) => row?.minimumPayment?.name },
  ],
  toModel: (data) => ({
    minimumPaymentUid: data?.minimumPayment?.id,
    paymentGracePeriodUid: data?.paymentGracePeriod?.id,
  }),
});

//  Location — the administrative hierarchy, under `modules.setting.location`.
//
//  country -> region -> district -> council -> ward -> street, one table per
//  level in remis_core_schema. `COUNTRY` sits with the reference data above
//  because currencies hang off it too.
//
//  Every level is the same shape: the descriptive triple, a required coordinate
//  pair, and a select onto the level above. `assignedNumber` is `assigned_code`
//  on these tables and is capped at three characters.

export const REGION = defineLookup({
  slug: 'regions',
  entity: 'Region',
  entityPlural: 'Regions',
  permission: 'REGION',
  label: 'Region',
  pluralLabel: 'Regions',
  subtitle: 'First level of the administrative hierarchy, below the country',
  icon: 'map',
  extraGqlFields: `
  latitude
  longitude
  country {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('countryUid', 'Country', () => COUNTRY), ...coordinateFields()],
  extraColumns: [{ field: 'country', valueFn: (row) => row?.country?.name }],
  toModel: (data) => ({ countryUid: data?.country?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => DISTRICT, DISTRICTS_BY_REGION, { regionUid: record?.id }),
  ],
});

export const DISTRICT = defineLookup({
  slug: 'districts',
  entity: 'District',
  entityPlural: 'Districts',
  permission: 'DISTRICT',
  label: 'District',
  pluralLabel: 'Districts',
  subtitle: 'Districts and the region each belongs to',
  icon: 'location_city',
  extraGqlFields: `
  latitude
  longitude
  region {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('regionUid', 'Region', () => REGION), ...coordinateFields()],
  extraColumns: [{ field: 'region', valueFn: (row) => row?.region?.name }],
  toModel: (data) => ({ regionUid: data?.region?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => COUNCIL, COUNCILS_BY_DISTRICT, { districtUid: record?.id }),
  ],
});

export const COUNCIL = defineLookup({
  slug: 'councils',
  entity: 'Council',
  entityPlural: 'Councils',
  permission: 'COUNCIL',
  label: 'Council',
  pluralLabel: 'Councils',
  subtitle: 'Councils and the district each belongs to',
  icon: 'domain',
  extraGqlFields: `
  latitude
  longitude
  district {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('districtUid', 'District', () => DISTRICT), ...coordinateFields()],
  extraColumns: [{ field: 'district', valueFn: (row) => row?.district?.name }],
  toModel: (data) => ({ districtUid: data?.district?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => WARD, WARDS_BY_COUNCIL, { councilUid: record?.id }),
  ],
});

export const WARD = defineLookup({
  slug: 'wards',
  entity: 'Ward',
  entityPlural: 'Wards',
  permission: 'WARD',
  label: 'Ward',
  pluralLabel: 'Wards',
  subtitle: 'Wards and the council each belongs to',
  icon: 'place',
  extraGqlFields: `
  latitude
  longitude
  council {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('councilUid', 'Council', () => COUNCIL), ...coordinateFields()],
  extraColumns: [{ field: 'council', valueFn: (row) => row?.council?.name }],
  toModel: (data) => ({ councilUid: data?.council?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => STREET, STREETS_BY_WARD, { wardUid: record?.id }),
  ],
});

export const STREET = defineLookup({
  slug: 'streets',
  entity: 'Street',
  entityPlural: 'Streets',
  permission: 'STREET',
  label: 'Street',
  pluralLabel: 'Streets',
  subtitle: 'Streets and the ward each belongs to',
  icon: 'near_me',
  extraGqlFields: `
  latitude
  longitude
  ward {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('wardUid', 'Ward', () => WARD), ...coordinateFields()],
  extraColumns: [{ field: 'ward', valueFn: (row) => row?.ward?.name }],
  toModel: (data) => ({ wardUid: data?.ward?.id }),
});

//  The parent-filtered reads the drill-downs above are built on. Exported so
//  they are checked against the schema alongside the generated ones.

export const BANK_ACCOUNTS_BY_ISSUER = gql`
  query bankAccountsByIssuer($issuerUid: String) {
    bankAccountsByIssuer(issuerUid: $issuerUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const CURRENCIES_BY_COUNTRY = gql`
  query currencysByCountry($countryUid: String) {
    currencysByCountry(countryUid: $countryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const EXCHANGE_RATES_BY_CURRENCY = gql`
  query exchangeRatesByCurrency($currencyUid: String) {
    exchangeRatesByCurrency(currencyUid: $currencyUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const DISTRICTS_BY_REGION = gql`
  query districtsByRegion($regionUid: String) {
    districtsByRegion(regionUid: $regionUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const COUNCILS_BY_DISTRICT = gql`
  query councilsByDistrict($districtUid: String) {
    councilsByDistrict(districtUid: $districtUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const WARDS_BY_COUNCIL = gql`
  query wardsByCouncil($councilUid: String) {
    wardsByCouncil(councilUid: $councilUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const STREETS_BY_WARD = gql`
  query streetsByWard($wardUid: String) {
    streetsByWard(wardUid: $wardUid) {
      ${lookupChildGqlFields}
    }
  }
`;

/** Grouped the way the backend groups the packages they come from. */
export const GENERAL_LOOKUPS: LookupModule[] = [
  PERSON,
  BUSINESS_NAME,
  IDENTITY_TYPE,
  TIN_DATA,
  DEPARTMENT,
  DESIGNATION,
];

export const BILLING_LOOKUPS: LookupModule[] = [
  BANK_ACCOUNT,
  BILL_PAY_OPTION,
  BILL_PAYMENT_PLAN,
  COLLECTION_CENTER,
  COLLSP,
  PAYMENT_SERVICE_PROVIDER,
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
  MINIMUM_PAYMENT,
  PAYMENT_GRACE_PERIOD,
  VAT,
  WITHHOLDING_TAX,
  USE_ITEM_REF_ON_PAY,
  FEE,
];

export const REFERENCE_LOOKUPS: LookupModule[] = [
  COUNTRY,
  CURRENCY,
  EXCHANGE_RATE,
  FINANCIAL_YEAR,
  METER,
];

/** In hierarchy order, so the menu reads country-downwards. */
export const LOCATION_LOOKUPS: LookupModule[] = [REGION, DISTRICT, COUNCIL, WARD, STREET];

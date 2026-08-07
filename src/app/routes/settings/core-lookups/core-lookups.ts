import { Subject } from 'rxjs';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

import { ALL_BUSINESS_NAMES } from '../business-names/business-name.graphql';
import { buildCoreLookupGql, coreLookupRefGqlFields } from './core-lookup.graphql';
import { CoreLookupConfig, CoreLookupModule } from './core-lookup.interface';

/**
 * The lookup tables the backend maps under `modules.setting.billing` and
 * `modules.setting.reference`.
 *
 * All twenty-one are the same table with a different name — `CoreNamedEntity`
 * plus, for a few of them, an amount, a date range or a parent — so they are
 * declared here as configs and rendered by one pair of generic screens rather
 * than copied out twenty-one times.
 */
const build = (config: CoreLookupConfig): CoreLookupModule => ({
  ...config,
  gql: buildCoreLookupGql(config.entity, config.entityPlural, config.extraGqlFields),
  changed$: new Subject(),
  viewPermissions: [`ROLE_VIEW_ALL_${config.permission}`, `ROLE_VIEW_${config.permission}`],
  upsertPermissions: [`ROLE_CREATE_${config.permission}`, `ROLE_UPDATE_${config.permission}`],
  deletePermissions: [`ROLE_DELETE_${config.permission}`],
});

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

//  Billing — the GePG configuration, under `modules.setting.billing`.

export const BANK_ACCOUNT = build({
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
    ${coreLookupRefGqlFields}
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
        fetchParameter: { query: ALL_BUSINESS_NAMES },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [{ field: 'issuer', valueFn: (row) => row?.issuer?.name }],
  toModel: (data) => ({ issuerUid: data?.issuer?.id }),
});

export const BILL_PAY_OPTION = build({
  slug: 'bill-pay-options',
  entity: 'BillPayOption',
  entityPlural: 'BillPayOptions',
  permission: 'BILL_PAY_OPTION',
  label: 'Bill Pay Option',
  pluralLabel: 'Bill Pay Options',
  subtitle: 'How a bill may be paid',
  icon: 'payment',
});

export const BILL_PAYMENT_PLAN = build({
  slug: 'bill-payment-plans',
  entity: 'BillPaymentPlan',
  entityPlural: 'BillPaymentPlans',
  permission: 'BILL_PAYMENT_PLAN',
  label: 'Bill Payment Plan',
  pluralLabel: 'Bill Payment Plans',
  subtitle: 'The schedules a bill may be settled on',
  icon: 'bill',
});

export const COLLECTION_CENTER = build({
  slug: 'collection-centers',
  entity: 'CollectionCenter',
  entityPlural: 'CollectionCenters',
  permission: 'COLLECTION_CENTER',
  label: 'Collection Center',
  pluralLabel: 'Collection Centers',
  subtitle: 'Where payments are collected',
  icon: 'location',
});

export const DISCOUNT = build({
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

export const GEPG_BILL_TYPE = build({
  slug: 'gepg-bill-types',
  entity: 'GepgBillType',
  entityPlural: 'GepgBillTypes',
  permission: 'GEPG_BILL_TYPE',
  label: 'GePG Bill Type',
  pluralLabel: 'GePG Bill Types',
  subtitle: 'The bill types GePG recognises',
  icon: 'bill_alt',
});

export const GEPG_PAY_TYPE = build({
  slug: 'gepg-pay-types',
  entity: 'GepgPayType',
  entityPlural: 'GepgPayTypes',
  permission: 'GEPG_PAY_TYPE',
  label: 'GePG Pay Type',
  pluralLabel: 'GePG Pay Types',
  subtitle: 'The payment types GePG recognises',
  icon: 'payment_alt',
});

export const GFS_CODE = build({
  slug: 'gfs-codes',
  entity: 'GfsCode',
  entityPlural: 'GfsCodes',
  permission: 'GFS_CODE',
  label: 'GFS Code',
  pluralLabel: 'GFS Codes',
  subtitle: 'Government Finance Statistics codes',
  icon: 'numbers',
});

export const PAY_LIM_AMOUNT = build({
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

export const PAY_LIM_TYPE = build({
  slug: 'pay-lim-types',
  entity: 'PayLimType',
  entityPlural: 'PayLimTypes',
  permission: 'PAY_LIM_TYPE',
  label: 'Payment Limit Type',
  pluralLabel: 'Payment Limit Types',
  subtitle: 'How a payment limit is applied',
  icon: 'scales',
});

export const PAY_PLAN = build({
  slug: 'pay-plans',
  entity: 'PayPlan',
  entityPlural: 'PayPlans',
  permission: 'PAY_PLAN',
  label: 'Payment Plan',
  pluralLabel: 'Payment Plans',
  subtitle: 'The plans a payment may follow',
  icon: 'plan',
});

export const SERVICE_ITEM = build({
  slug: 'service-items',
  entity: 'ServiceItem',
  entityPlural: 'ServiceItems',
  permission: 'SERVICE_ITEM',
  label: 'Service Item',
  pluralLabel: 'Service Items',
  subtitle: 'The services a bill may be raised for',
  icon: 'services',
});

export const SP_CODE = build({
  slug: 'sp-codes',
  entity: 'SpCode',
  entityPlural: 'SpCodes',
  permission: 'SP_CODE',
  label: 'Service Provider Code',
  pluralLabel: 'Service Provider Codes',
  subtitle: 'GePG service provider codes',
  icon: 'numbers',
});

export const SP_GRP_CODE = build({
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

export const SUB_SP_CODE = build({
  slug: 'sub-sp-codes',
  entity: 'SubSpCode',
  entityPlural: 'SubSpCodes',
  permission: 'SUB_SP_CODE',
  label: 'Sub Service Provider Code',
  pluralLabel: 'Sub Service Provider Codes',
  subtitle: 'GePG sub service provider codes',
  icon: 'numbers',
});

export const SYSTEM_CODE = build({
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

export const COUNTRY = build({
  slug: 'countries',
  entity: 'Country',
  entityPlural: 'Countries',
  permission: 'COUNTRY',
  label: 'Country',
  pluralLabel: 'Countries',
  subtitle: 'Countries currencies are issued by',
  icon: 'flag',
});

export const CURRENCY = build({
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
    ${coreLookupRefGqlFields}
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

export const EXCHANGE_RATE = build({
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
    ${coreLookupRefGqlFields}
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

export const FINANCIAL_YEAR = build({
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

export const METER = build({
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
export const BILLING_LOOKUPS: CoreLookupModule[] = [
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

export const REFERENCE_LOOKUPS: CoreLookupModule[] = [
  COUNTRY,
  CURRENCY,
  EXCHANGE_RATE,
  FINANCIAL_YEAR,
  METER,
];

/** Keyed by slug — how the two generic screens find the config for their route. */
export const CORE_LOOKUPS: Record<string, CoreLookupModule> = [
  ...BILLING_LOOKUPS,
  ...REFERENCE_LOOKUPS,
].reduce((all, lookup) => ({ ...all, [lookup.slug]: lookup }), {});

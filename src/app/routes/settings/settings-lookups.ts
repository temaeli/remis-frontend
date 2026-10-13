import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_EMAIL, VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { getDisplayName } from '@shared/components/view-component/view.helpers';

import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { USERS_BY_DESIGNATION_PAGEABLE } from '@routes/users-managment/users/user.graphql';

import { gql } from '@apollo/client/core';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import {
  defineLookup,
  entityLinkPanels,
  EntityLinkConfig,
  lookupChildGqlFields,
  lookupChildPanel,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';
import { businessNamePeoplePanel, personOrganisationsPanel } from './person-links';
import {
  businessNameIdentificationsPanel,
  identityTypeIdentificationsPanel,
  personIdentificationsPanel,
  personRenewalNumberPanel,
} from './person-identifications';
import { businessNameTinsPanel, personTinsPanel } from './tin-links';
import { billSettingPeoplePanel, personBillSettingsPanel } from './bill-setting-people';
import { runRenewalsForNewNumberBtn, runRenewalsForReuseBtn } from './renewal-run';
import {
  raiseQuantityBillForNewNumberBtn,
  raiseQuantityBillForReuseBtn,
} from './quantity-bill-run';
import { CORE_ATTACHMENT, coreAttachmentPanels } from './attachment-lookups';
import { gracePeriodBillSettingsPanel, renewBillSettingsPanel } from './grace-period-bill-settings';
import { recordLinkPanels } from '@routes/unit-management/unit-links';
import {
  dayField,
  graceMonthFields,
  graceMonthGqlFields,
  graceMonthKeys,
  graceMonthsToModel,
  monthField,
  monthName,
} from './calendar-fields';
import {
  BIO_DATA_PROCESS_LINK,
  MATERIAL_GRADE_LINK,
  OBJECTS_ID_GRADE_LINK,
} from './grade-process-links';

/**
 * Every lookup table in the settings module: the general configuration, the GePG
 * billing codes and the reference data costing and valuation share.
 *
 * They are all the same screen with a different name — a paged list, a detail
 * page and an upsert form over a five-operation CRUD API — so they are declared
 * here as configs and rendered by the shared lookup screens rather than copied
 * out twenty-five times.
 */

/**
 * The expenses a person can be linked to, for the tab on their page. Declared as
 * a bare read rather than imported from the billing registry, which imports this
 * file.
 */
const ALL_EXPENSES = gql`
  query allExpenses {
    allExpenses {
      id
      name
    }
  }
`;

/**
 * Every person by display name, for the pickers that link a person to something.
 * PERSON's own list selects the name parts rather than `name`, which the picker
 * labels with.
 */
const ALL_BIO_DATA_NAMES = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

/** The units a material is counted in. */
const ALL_UNIT_OF_MEASURES = gql`
  query allUnitOfMeasures {
    allUnitOfMeasures {
      id
      name
    }
  }
`;

/**
 * What an approval leaves a thing in.
 *
 * A static list rather than a read: `statuses` is a database enum, and SPQR
 * publishes it as a GraphQL enum, so there is no table to fetch it from. These
 * are the labels an approval plausibly confers; the column itself accepts every
 * label the type declares.
 */
const APPROVAL_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FORWARDED', label: 'Forwarded' },
  { value: 'PASSED', label: 'Passed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

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

/**
 * A month of the year, named rather than numbered: `renews` and `grace_periods`
 * both store the number, and "month 9" on a form is a worse way of saying
 * September than September is.
 */
/**
 * One of `grace_periods`' three steps: how many minutes of grace, and the window
 * of the year it applies in. The column names are the step's name followed by
 * the field, so both are built from the prefix rather than written out three
 * times.
 */
const graceStepKeys = (prefix: 'first' | 'second' | 'third'): string[] => [
  `${prefix}GracePeriodMinutes`,
  `${prefix}GracePeriodStartedDay`,
  `${prefix}GracePeriodStartedMonth`,
  `${prefix}GracePeriodEndedDay`,
  `${prefix}GracePeriodEndedMonth`,
];

const graceStepFields = (prefix: 'first' | 'second' | 'third', label: string): FieldConfig[] => [
  {
    key: `${prefix}GracePeriodMinutes`,
    label: `${label} Grace Period (minutes)`,
    type: FieldType.decimal,
    decimals: 2,
    min: 0,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  dayField(`${prefix}GracePeriodStartedDay`, 'Starts On (Day)'),
  monthField(`${prefix}GracePeriodStartedMonth`, 'Starts In (Month)'),
  dayField(`${prefix}GracePeriodEndedDay`, 'Ends On (Day)'),
  monthField(`${prefix}GracePeriodEndedMonth`, 'Ends In (Month)'),
];

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
  // Which of the fixed identification labels mean this type. The labels are an
  // enum the application ships; this is where they are tied to the lookup rows
  // an operator maintains.
  extraContents: (comp, record) => [identityTypeIdentificationsPanel(comp, record?.id)],
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
  email
  mobileNumber
`,
  nameKey: 'firstName',
  baseFields: [
    {
      key: 'firstName',
      label: 'First Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    // bio_data.second_name is NOT NULL, so a middle name is not optional.
    {
      key: 'secondName',
      label: 'Middle Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'thirdName',
      label: 'Last Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    // No identity type and no national ID: bio_data no longer carries either.
    // A person's documents, the national ID among them, are filed in the
    // Identifications panel on their page.
    //
    // The three below are checked for clashes where given.
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
    'index',
    { field: 'firstName', header: 'First Name' },
    { field: 'secondName', header: 'Middle Name' },
    { field: 'thirdName', header: 'Last Name' },
    { field: 'mobileNumber', header: 'Mobile' },
    { field: 'email', header: 'Email' },
  ],
  extraContents: (comp, record) => [
    ...recordLinkPanels(comp, 'BioData', record?.id),
    personOrganisationsPanel(comp, record?.id),
    // The person's documents: national ID, ZANID, driving licence. bio_data
    // itself holds none.
    personIdentificationsPanel(comp, record?.id),
    // Where GePG's CustId reads a TIN from, when the bill's identity type
    // means TIN.
    personTinsPanel(comp, record?.id),
    // Which automatic bill settings are raised for this person, and the control
    // number those renewals reuse. Without the number the run skips them.
    personBillSettingsPanel(comp, record?.id),
    personRenewalNumberPanel(comp, record?.id),
    ...entityLinkPanels(
      comp,
      [
        {
          entity: 'BioDataExpense',
          byOwnerQuery: 'bioDataExpensesByBioData',
          ownerArg: 'bioDataUid',
          targetArg: 'expenseUid',
          field: 'expense',
          label: 'Expense',
          pluralLabel: 'Expenses',
          icon: 'receipt',
          permission: 'BIO_DATA_EXPENSE',
          optionsQuery: ALL_EXPENSES,
        },
        {
          entity: 'BioDataStreet',
          byOwnerQuery: 'bioDataStreetsByBioData',
          ownerArg: 'bioDataUid',
          targetArg: 'streetUid',
          field: 'street',
          label: 'Street',
          pluralLabel: 'Streets',
          icon: 'location',
          permission: 'BIO_DATA_STREET',
          optionsQuery: STREET.gql.all,
        },
        // The cases this person is the subject of (bio_data_processes).
        BIO_DATA_PROCESS_LINK,
      ],
      record?.id,
    ),
    ...coreAttachmentPanels(comp, 'bioData', record?.id),
  ],
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
  // No identity type: business_names no longer carries one.
  extraGqlFields: `
  isPublic
  email
  mobileNumber
`,
  extraFields: [
    // Both are required and unique on the register. The number is held with
    // its country code, so one typed as 0754000000 comes back as 255754000000.
    {
      key: 'email',
      label: 'Email',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_EMAIL],
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number',
      hint: 'A Tanzanian mobile number, e.g. 0754000000',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
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
    { field: 'email', header: 'Email' },
    { field: 'mobileNumber', header: 'Mobile Number' },
    {
      field: 'isPublic',
      header: 'Public',
      valueFn: (row) => (row?.isPublic ? 'Yes' : 'No'),
      valueClassMapper: (row) => (row?.isPublic ? 'text-success' : 'text-danger'),
    },
  ],
  // The number arrives as a number; the form and the mutation take text.
  toModel: (data) => ({
    mobileNumber: data?.mobileNumber != null ? String(data.mobileNumber) : null,
  }),
  extraContents: (comp, record) => [
    ...recordLinkPanels(comp, 'BusinessName', record?.id),
    lookupChildPanel(comp, () => BANK_ACCOUNT, BANK_ACCOUNTS_BY_ISSUER, {
      issuerUid: record?.id,
    }),
    businessNamePeoplePanel(comp, record?.id),
    businessNameIdentificationsPanel(comp, record?.id),
    businessNameTinsPanel(comp, record?.id),
    ...coreAttachmentPanels(comp, 'businessName', record?.id),
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
  accountNumber
  accountName
  swiftCode
  internal
  currency {
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
    // What a transfer needs to reach the account.
    {
      key: 'accountNumber',
      label: 'Account Number',
      hint: 'Up to 34 characters. No two accounts may share one',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'accountName',
      label: 'Account Name',
      hint: 'The name the account is held in. Up to 100 characters',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'swiftCode',
      label: 'SWIFT Code',
      hint: '8 or 11 characters, such as NMIBTZTZ',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'internal',
      label: 'Internal',
      hint: 'Whether this is an internal account. On unless changed',
      type: FieldType.toggle,
      value: true,
      class: 'col-span-full',
    },
    // The query is written out rather than read off CURRENCY: that lookup is
    // declared further down this file, after this one has been evaluated.
    {
      key: 'currencyUid',
      label: 'Currency',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: {
          query: gql`
            query allCurrencies {
              allCurrencies {
                id
                name
              }
            }
          `,
        },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    { field: 'issuer', valueFn: (row) => row?.issuer?.name },
    { field: 'accountNumber', header: 'Account Number' },
    { field: 'swiftCode', header: 'SWIFT Code' },
    { field: 'currency', header: 'Currency', valueFn: (row) => row?.currency?.name },
    { field: 'internal', header: 'Internal', valueFn: (row) => (row?.internal ? 'Yes' : 'No') },
  ],
  toModel: (data) => ({ issuerUid: data?.issuer?.id, currencyUid: data?.currency?.id }),
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'BankAccount', record?.id),
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
  // The code is what a bill sends to GePG as CollPsp, so it is typed, never
  // generated: a generated one would go out as if it were the provider's.
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
      key: 'assignedNumber',
      label: 'GePG PSP Code',
      hint: 'The code GePG knows this provider by. Sent on every bill as CollPsp',
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
  baseColumns: [
    'index',
    { field: 'assignedNumber', header: 'GePG PSP Code' },
    'name',
    'description',
  ],
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
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'BillPayOption', record?.id),
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
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'CollectionCenter', record?.id),
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
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Discount', record?.id),
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

/**
 * What a configured GePG endpoint is for — mirrors the native PostgreSQL enum
 * `remis_core_schema.gepg_end_point_type`, and so `GepgEndPointType` on the
 * backend. The three lists have to stay in step.
 */
export enum GepgEndPointType {
  BILL_CONTROL_NUMBER_REQUEST = 'BILL_CONTROL_NUMBER_REQUEST',
  BILL_CONTROL_NUMBER_CANCELLATION = 'BILL_CONTROL_NUMBER_CANCELLATION',
  RECONCILIATION_REQUEST = 'RECONCILIATION_REQUEST',
  CONTROL_NUMBER_REUSE = 'CONTROL_NUMBER_REUSE',
  BILL_CHANGE_UPDATE = 'BILL_CHANGE_UPDATE',
  // Not outbound calls: these key Code Statuses, so the status a GePG payment
  // leaves a bill in is configured. No endpoint URL is needed for them.
  GEPG_FULL_PAYMENT_NOTIFICATION = 'GEPG_FULL_PAYMENT_NOTIFICATION',
  GEPG_PARTIAL_PAYMENT_NOTIFICATION = 'GEPG_PARTIAL_PAYMENT_NOTIFICATION',
  GEPG_EXACT_PAYMENT_NOTIFICATION = 'GEPG_EXACT_PAYMENT_NOTIFICATION',
}

export const GEPG_END_POINT_TYPE_OPTIONS: Option[] = Object.values(GepgEndPointType).map(
  (value) => ({ value, label: getDisplayName(value) as string }),
);

/**
 * The only table in the core schema that is not name-and-description shaped: it
 * carries a url and an endpoint type instead, so the descriptive block is
 * declared rather than inherited and `assignedCode` stands in as the name.
 */
export const GEPG_END_POINT = defineLookup({
  slug: 'gepg-end-points',
  entity: 'GepgEndPoint',
  entityPlural: 'GepgEndPoints',
  permission: 'GEPG_END_POINT',
  label: 'GePG Endpoint',
  pluralLabel: 'GePG Endpoints',
  subtitle: 'The URLs the GePG integration calls, one per operation',
  icon: 'link',
  nameKey: 'assignedCode',
  descriptiveGqlFields: `
  assignedCode
  url
  gepgEndPointType
`,
  baseFields: [
    {
      key: 'assignedCode',
      label: 'Assigned Code',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'url',
      label: 'URL',
      // varchar(100) in the database, so a longer URL is rejected on save
      // rather than truncated.
      hint: 'Up to 100 characters',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'gepgEndPointType',
      label: 'Endpoint Type',
      hint: 'Only one endpoint may be configured per type',
      type: FieldType.select,
      options: GEPG_END_POINT_TYPE_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  baseColumns: [
    'index',
    { field: 'assignedCode', header: 'Assigned Code' },
    { field: 'gepgEndPointType', header: 'Type' },
    'url',
  ],
});

/**
 * The three protocol headers every GePG request carries: `Gepg-Com` names the
 * operation, `Gepg-Code` identifies us as the service provider, and `Gepg-Alg`
 * names the signing algorithm.
 *
 * GePG expects a different set per operation, so the DBA gave each one its own
 * table — `headers_for_normal_bill`, `headers_for_bill_change` and
 * `headers_for_cn_reuse` — and they are three screens here for the same reason
 * they are three permission sets: a wrong value stops that one operation and
 * leaves the others working.
 *
 * The tables are the only source. Whatever is saved here is what the next
 * request sends, with nothing cached in between and no property behind it, so
 * an operation whose row is missing or deleted stops with a message naming the
 * table rather than falling back on a stale default.
 */
const gepgHeaderGqlFields = `
  gepgCom
  gepgCode
  gepgAlg
`;

/** The controls all three screens share, differing only in what the com means. */
const gepgHeaderFields = (comHint: string): FieldConfig[] => [
  {
    key: 'gepgCom',
    label: 'Gepg-Com',
    hint: comHint,
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'gepgCode',
    label: 'Gepg-Code',
    hint: 'The SP code EGA issues at onboarding',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'gepgAlg',
    label: 'Gepg-Alg',
    hint: 'The signing algorithm GePG expects, e.g. 00S2',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

/** All three columns are UNIQUE per table, so each one is worth showing. */
const gepgHeaderColumns: GridKeyColumn[] = [
  'index',
  { field: 'gepgCom', header: 'Gepg-Com' },
  { field: 'gepgCode', header: 'Gepg-Code' },
  { field: 'gepgAlg', header: 'Gepg-Alg' },
];

/**
 * Also what cancellation and reconciliation send: the client library reads their
 * `Gepg-Com` off the same field a normal bill uses, and neither has a table.
 */
export const HEADERS_FOR_NORMAL_BILL = defineLookup({
  slug: 'headers-for-normal-bill',
  entity: 'HeadersForNormalBill',
  entityPlural: 'HeadersForNormalBills',
  permission: 'HEADERS_FOR_NORMAL_BILL',
  label: 'GePG Bill Submission Headers',
  pluralLabel: 'GePG Bill Submission Headers',
  subtitle: 'What a new bill, a cancellation and a reconciliation announce themselves as',
  icon: 'generic_bill',
  nameKey: 'gepgCom',
  descriptiveGqlFields: gepgHeaderGqlFields,
  baseFields: gepgHeaderFields('The operation a bill submission announces, e.g. default.sp.in'),
  baseColumns: gepgHeaderColumns,
});

export const HEADERS_FOR_BILL_CHANGE = defineLookup({
  slug: 'headers-for-bill-change',
  entity: 'HeadersForBillChange',
  entityPlural: 'HeadersForBillChanges',
  permission: 'HEADERS_FOR_BILL_CHANGE',
  label: 'GePG Bill Change Headers',
  pluralLabel: 'GePG Bill Change Headers',
  subtitle: 'What a change to an already issued bill announces itself as',
  icon: 'changebill',
  nameKey: 'gepgCom',
  descriptiveGqlFields: gepgHeaderGqlFields,
  baseFields: gepgHeaderFields('The operation a bill change announces, e.g. changebill.sp.in'),
  baseColumns: gepgHeaderColumns,
});

export const HEADERS_FOR_CN_REUSE = defineLookup({
  slug: 'headers-for-cn-reuse',
  entity: 'HeadersForCnReuse',
  entityPlural: 'HeadersForCnReuses',
  permission: 'HEADERS_FOR_CN_REUSE',
  label: 'GePG Control Number Reuse Headers',
  pluralLabel: 'GePG Control Number Reuse Headers',
  subtitle: 'What a bill sent against an already issued control number announces itself as',
  icon: 'loop_alt',
  nameKey: 'gepgCom',
  descriptiveGqlFields: gepgHeaderGqlFields,
  baseFields: gepgHeaderFields(
    'The operation a control number reuse announces, e.g. reusebill.sp.in',
  ),
  baseColumns: gepgHeaderColumns,
});

/**
 * The twenty labels of the PostgreSQL enum `remis_core_schema.statuses`,
 * mirroring `CoreStatus` on the backend. The two lists have to stay in step.
 */
export enum CoreStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  CONTROL_NUMBER_REQUESTED = 'CONTROL_NUMBER_REQUESTED',
  WAITING_FOR_CONTROL_NUMBER = 'WAITING_FOR_CONTROL_NUMBER',
  WAITING_FOR_PAYMENT = 'WAITING_FOR_PAYMENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FULL_PAID = 'FULL_PAID',
  OVERPAID = 'OVERPAID',
  EXACTLY_PAID = 'EXACTLY_PAID',
  PARTIALLY_SETTLED = 'PARTIALLY_SETTLED',
  FULL_SETTLED = 'FULL_SETTLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  FORWARDED = 'FORWARDED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WIP = 'WIP',
}

export const CORE_STATUS_OPTIONS: Option[] = Object.values(CoreStatus).map((value) => ({
  value,
  // Spelt out: title-casing the label would read "Wip".
  label: value === CoreStatus.WIP ? 'Work in Progress' : (getDisplayName(value) as string),
}));

/**
 * A GePG result code: the number itself, and what it is called.
 *
 * The number is maintained here once and read per operation next door in
 * `CODE_STATUS`, because the same code means different things depending on
 * which endpoint answered with it. `assignedNumber` is required rather than
 * generated — it is GePG's number, not one this system hands out.
 */
export const CODE = defineLookup({
  slug: 'codes',
  entity: 'Code',
  entityPlural: 'Codes',
  permission: 'CODE',
  label: 'GePG Code',
  pluralLabel: 'GePG Codes',
  subtitle: 'The result codes GePG answers with',
  icon: 'tag',
  nameKey: 'assignedNumber',
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'assignedNumber',
      label: 'GePG Code',
      hint: 'The code GePG returns, e.g. 7101',
      type: FieldType.input,
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
      hint: "What GePG means by this code, in the operator's words",
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  baseColumns: ['index', { field: 'assignedNumber', header: 'GePG Code' }, 'name', 'description'],
});

/**
 * What a GePG result code means for the bill it came back about.
 *
 * Until this table existed the reading was in Java: a control number response
 * moved the bill to Waiting For Payment and a cancellation to Cancelled,
 * whatever code GePG returned. Codes are GePG's to change, so they are rows
 * here instead — read on every response, so a correction takes effect on the
 * next callback rather than the next deploy.
 *
 * One row per operation a code can arrive on: the code is picked from `CODE`
 * rather than typed, and the same code appears here as many times as it has
 * meanings. `name` is not a column — the backend derives it from the code and
 * the status so the detail page and the delete prompt have something to show.
 *
 * The relation is selected as `codeRef` because `Lookup` already declares a
 * scalar `code`, which some uaa tables carry as a column of their own.
 *
 * Nothing here is required. A code with no row leaves the status the
 * integration would have set anyway, so a half-filled table narrows what is
 * known rather than breaking anything.
 */
export const CODE_STATUS = defineLookup({
  slug: 'code-statuses',
  entity: 'CodeStatus',
  entityPlural: 'CodeStatuses',
  permission: 'CODE_STATUS',
  label: 'GePG Code Status',
  pluralLabel: 'GePG Code Statuses',
  subtitle: 'What each GePG result code means for the bill it answered',
  icon: 'check_circle',
  descriptiveGqlFields: `
  name
  codeRef: code {
    ${lookupRefGqlFields}
    description
  }
  status
  gepgEndPointType
`,
  saveArg: 'input',
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'codeUid',
      label: 'GePG Code',
      hint: 'Maintained under GePG Codes',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'assignedNumber',
        valueKey: 'id',
        fetchParameter: { query: CODE.gql.all },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'gepgEndPointType',
      label: 'Operation',
      hint: 'The same code can mean different things per operation',
      type: FieldType.select,
      options: GEPG_END_POINT_TYPE_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'status',
      label: 'Resulting Status',
      hint: 'Where the bill goes when GePG answers with this code',
      type: FieldType.select,
      options: CORE_STATUS_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  baseColumns: [
    'index',
    { field: 'codeRef', header: 'GePG Code', valueFn: (row) => row?.codeRef?.assignedNumber },
    { field: 'gepgEndPointType', header: 'Operation' },
    { field: 'status', header: 'Resulting Status' },
    { field: 'codeName', header: 'Meaning', valueFn: (row) => row?.codeRef?.name },
  ],
  toModel: (data) => ({ codeUid: data?.codeRef?.id }),
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
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'GfsCode', record?.id),
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
  // What collects under this code — read from this side too, where someone
  // looking at the code expects it.
  extraContents: (comp, record) => recordLinkPanels(comp, 'SpCode', record?.id),
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
  // assigned_code is varchar(3) -- the three-letter code, such as TZS -- so the
  // form requires it: the backend cannot generate one that fits.
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'assignedNumber',
      label: 'Code',
      type: FieldType.input,
      hint: 'Three letters, such as TZS',
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
  extraGqlFields: `
  domestic
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
    {
      key: 'domestic',
      label: 'Domestic',
      type: FieldType.toggle,
      hint: 'On for the one home currency (TZS); off for every other',
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    { field: 'country', valueFn: (row) => row?.country?.name },
    { field: 'domestic', header: 'Domestic', valueFn: (row) => (row?.domestic ? 'Yes' : 'No') },
  ],
  // A new currency starts as foreign: only one currency may be domestic, and the
  // backend refuses a second. Set on the model rather than as the toggle's value,
  // which would win over an existing currency's saved value on edit.
  toModel: (data) => ({ countryUid: data?.country?.id, domestic: data?.domestic ?? false }),
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

/**
 * Switches a financial year on or off. Only one year is in force at a time, so
 * the backend refuses to switch one on while another is on and says which to
 * switch off first.
 */
const PATCH_FINANCIAL_YEAR_ACTIVE = gql`
  mutation patchFinancialYearActive($uid: String, $active: Boolean) {
    patchFinancialYearActive(uid: $uid, active: $active) {
      ${responseGqlFields(`
    id
    name
    active
  `)}
    }
  }
`;

/** Switch this year on, or off; only the one that applies is shown per row. */
const financialYearActiveBtn = (comp: BaseComponent, active: boolean): ActionButton => ({
  icon: active ? 'check_circle' : 'block',
  label: active ? 'Set Active' : 'Set Inactive',
  permissions: ['ROLE_CREATE_FINANCIAL_YEAR', 'ROLE_UPDATE_FINANCIAL_YEAR'],
  showFunction: (data: any) => !!data?.id && !!data?.active !== active,
  confirmDataMapper: (data?: any) => ({
    title: active ? 'Set Active' : 'Set Inactive',
    message: active
      ? `Make ${data?.name ?? 'this financial year'} the year in force? Only one year can be ` +
        'active, so switch the current one off first if it still is.'
      : `Switch ${data?.name ?? 'this financial year'} off? Until another is switched on, no ` +
        'financial year will be offered on the forms.',
    confirmText: active ? 'Set Active' : 'Set Inactive',
  }),
  click: async (data?: any) => {
    await comp.fs.fetch({
      mutation: PATCH_FINANCIAL_YEAR_ACTIVE,
      notify: true,
      loadingOn: 'content',
      variables: { uid: data?.id, active },
      successFn: () => FINANCIAL_YEAR.changed$.next(data),
    });
  },
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
  // One year is in force at a time: switch the current one off, then the next on.
  rowActions: (comp) => [financialYearActiveBtn(comp, true), financialYearActiveBtn(comp, false)],
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
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Meter', record?.id),
});

/**
 * The undecorated type → category → subcategory hierarchy the DBA added as
 * `remis_core_schema.types` / `categories` / `subcategories`.
 *
 * Not the asset registry's classification: that is its own three tables
 * (`asset_types` downwards) with its own screens under Asset Management. These
 * are shared reference data, and nothing references them yet — no other table
 * carries a foreign key to them — so for now the screens only maintain the
 * hierarchy itself.
 *
 * The code column is spelled `assigned_code` rather than `assigned_number` in
 * the database, but the entity remaps it onto the inherited `assignedNumber`
 * field, so the generic documents need no override.
 */
export const TYPE = defineLookup({
  slug: 'types',
  entity: 'Type',
  entityPlural: 'Types',
  permission: 'TYPE',
  label: 'Type',
  pluralLabel: 'Types',
  subtitle: 'Top of the shared classification hierarchy',
  icon: 'list',
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => CATEGORY, CATEGORIES_BY_TYPE, { typeUid: record?.id }),
  ],
});

export const CATEGORY = defineLookup({
  slug: 'categories',
  entity: 'Category',
  entityPlural: 'Categories',
  permission: 'CATEGORY',
  label: 'Category',
  pluralLabel: 'Categories',
  subtitle: 'Categories and the type each belongs to',
  icon: 'tag',
  extraGqlFields: `
  type {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('typeUid', 'Type', () => TYPE)],
  extraColumns: [{ field: 'type', valueFn: (row) => row?.type?.name }],
  toModel: (data) => ({ typeUid: data?.type?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => SUBCATEGORY, SUBCATEGORIES_BY_CATEGORY, {
      categoryUid: record?.id,
    }),
  ],
});

export const SUBCATEGORY = defineLookup({
  slug: 'subcategories',
  entity: 'Subcategory',
  entityPlural: 'Subcategories',
  permission: 'SUBCATEGORY',
  label: 'Subcategory',
  pluralLabel: 'Subcategories',
  subtitle: 'Subcategories and the category each belongs to',
  icon: 'price_tag',
  extraGqlFields: `
  category {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('categoryUid', 'Category', () => CATEGORY)],
  extraColumns: [{ field: 'category', valueFn: (row) => row?.category?.name }],
  toModel: (data) => ({ categoryUid: data?.category?.id }),
  // What this subcategory renews on, and the grace it is given — both read from
  // this side, where someone looking at the subcategory expects them.
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => RENEW, RENEWS_BY_SUBCATEGORY, { subcategoryUid: record?.id }),
    lookupChildPanel(comp, () => GRACE_PERIOD, GRACE_PERIODS_BY_SUBCATEGORY, {
      subcategoryUid: record?.id,
    }),
    lookupChildPanel(comp, () => PERCENTAGE, PERCENTAGES_BY_SUBCATEGORY, {
      subcategoryUid: record?.id,
    }),
    lookupChildPanel(comp, () => FLAT_AMOUNT, FLAT_AMOUNTS_BY_SUBCATEGORY, {
      subcategoryUid: record?.id,
    }),
    lookupChildPanel(
      comp,
      () => BILL_HEADERS_DESCRIPTION,
      BILL_HEADERS_DESCRIPTIONS_BY_SUBCATEGORY,
      { subcategoryUid: record?.id },
    ),
    lookupChildPanel(comp, () => BILL_DETAILS_TEMPLATE, BILL_DETAILS_TEMPLATES_BY_SUBCATEGORY, {
      subcategoryUid: record?.id,
    }),
    lookupChildPanel(
      comp,
      () => FIRST_WINDOW_BILLING_CYCLE,
      FIRST_WINDOW_BILLING_CYCLES_BY_SUBCATEGORY,
      { subcategoryUid: record?.id },
    ),
    lookupChildPanel(
      comp,
      () => SECOND_WINDOW_BILLING_CYCLE,
      SECOND_WINDOW_BILLING_CYCLES_BY_SUBCATEGORY,
      { subcategoryUid: record?.id },
    ),
  ],
});

/**
 * When what a subcategory covers comes up for renewal: the same day every year,
 * from a start date, with the last renewal recorded.
 */
export const RENEW = defineLookup({
  slug: 'renewals',
  entity: 'Renew',
  entityPlural: 'Renews',
  permission: 'RENEW',
  label: 'Renewal',
  pluralLabel: 'Renewals',
  subtitle: 'The day of the year a subcategory comes up for renewal',
  icon: 'refresh',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  renewedAt
  startedAt
  renewsDay
  renewsMonth
  billHeadersName
  billHeadersDescription
  billDetailsName
  billDetailsDescription
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    dayField('renewsDay', 'Renews On (Day)'),
    monthField('renewsMonth', 'Renews In (Month)'),
    {
      key: 'startedAt',
      label: 'Start Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    // Optional on purpose: a schedule nobody has renewed yet should not have to
    // claim a date. The backend takes today when it is left empty.
    {
      key: 'renewedAt',
      label: 'Last Renewed On',
      hint: 'Left empty, this is set to today',
      type: FieldType.date,
    },
    // Apart from the schedule's own name and description, which identify the
    // schedule and must be unique. Stored only: the renewal run names a bill
    // from its bill header description and its detail from its bill details
    // template.
    {
      key: 'billHeadersName',
      label: 'Bill Name',
      hint: 'Kept on record. A renewal bill is named from its bill header description. Up to 100 characters',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'billHeadersDescription',
      label: 'Bill Description',
      hint: 'Kept on record. A renewal bill is described by its bill header description',
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'billDetailsName',
      label: 'Bill Detail Name',
      hint: 'Kept on record. A renewal bill detail is named from its bill details template. Up to 100 characters',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'billDetailsDescription',
      label: 'Bill Detail Description',
      hint: 'Kept on record. A renewal bill detail is described by its bill details template',
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'renewsDay', header: 'Day' },
    {
      field: 'renewsMonth',
      header: 'Month',
      valueFn: (row) => monthName(row?.renewsMonth),
    },
    { field: 'startedAt', header: 'Start Date' },
    { field: 'renewedAt', header: 'Last Renewed' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  // The nightly run raises these by itself; this is for a day that was missed.
  rowActions: (comp) => [runRenewalsForNewNumberBtn(comp), runRenewalsForReuseBtn(comp)],
  // Read-only: a bill setting belongs to a grace period, and that is where it is
  // maintained. Shown here because a renewal is what decides when it comes round.
  extraContents: (_comp, record) => [renewBillSettingsPanel(record?.id)],
});

/**
 * The fifteen days both window tables gained on 2026-10-05. Every one is
 * required by the table and kept on record; nothing in billing reads them yet,
 * so they are labelled as the columns are named until their use is said.
 */
const BILLING_WINDOW_DAYS: { key: string; label: string }[] = [
  { key: 'before', label: 'Before' },
  { key: 'after', label: 'After' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'startedDay', label: 'Started Day' },
  { key: 'endedDay', label: 'Ended Day' },
  { key: 'firstGracePeriodStartedDay', label: 'First Grace Period Started Day' },
  { key: 'firstGracePeriodEndedDay', label: 'First Grace Period Ended Day' },
  { key: 'secondGracePeriodStartedDay', label: 'Second Grace Period Started Day' },
  { key: 'secondGracePeriodEndedDay', label: 'Second Grace Period Ended Day' },
  {
    key: 'firstBillCreatedInThisMonthExpiredDay',
    label: 'First Bill Created In This Month Expired Day',
  },
  {
    key: 'secondBillCreatedInThisMonthExpiredDay',
    label: 'Second Bill Created In This Month Expired Day',
  },
  { key: 'firstPenaltyDay', label: 'First Penalty Day' },
  { key: 'secondPenaltyDay', label: 'Second Penalty Day' },
  {
    key: 'firstBillCreatedInThisMonthRenewedDay',
    label: 'First Bill Created In This Month Renewed Day',
  },
  {
    key: 'secondBillCreatedInThisMonthRenewedDay',
    label: 'Second Bill Created In This Month Renewed Day',
  },
];

/**
 * One of the two tables a renewal-run bill takes its expiry from. A bill's
 * `expired_date` is the `expiredAt` of the window holding the moment it is
 * raised: the first-window table for a person's first bill, the second for every
 * renewal after it. The bill's financial year is the window's too.
 *
 * Windows in one table may not overlap, for any subcategory, and a deleted
 * window still holds its dates; the backend says which window is in the way.
 */
const billingWindowLookup = (
  which: 'First' | 'Second',
  subtitle: string,
  icon: string,
): LookupModule =>
  defineLookup({
    slug: `${which.toLowerCase()}-window-billing-cycles`,
    entity: `${which}WindowBillingCycle`,
    entityPlural: `${which}WindowBillingCycles`,
    permission: `${which.toUpperCase()}_WINDOW_BILLING_CYCLE`,
    label: `${which} Billing Window`,
    pluralLabel: `${which} Billing Windows`,
    subtitle,
    icon,
    extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  startedAt
  expiredAt
  restartDay
  penaltyDay
  renewDay
  runDay
  billExpireDay
  financialYear {
    ${lookupRefGqlFields}
  }
  ${BILLING_WINDOW_DAYS.map((day) => day.key).join('\n  ')}
`,
    extraFields: [
      parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
      parentSelect('financialYearUid', 'Financial Year', () => FINANCIAL_YEAR),
      {
        key: 'startedAt',
        label: 'Starts At',
        type: FieldType.dateTime,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'expiredAt',
        label: 'Ends At',
        hint: 'When the window itself closes',
        type: FieldType.dateTime,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'billExpireDay',
        label: 'Bills Expire At',
        hint: 'Every bill raised inside this window expires at this moment',
        type: FieldType.dateTime,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'restartDay',
        label: 'Restart Day',
        hint: 'When the cycle starts again. Not before the window ends',
        type: FieldType.dateTime,
        validations: [VALIDATOR_REQUIRED],
      },
      // Kept on record: nothing in billing reads these three yet.
      {
        key: 'penaltyDay',
        label: 'Penalty Day',
        hint: 'When a penalty starts to apply',
        type: FieldType.dateTime,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'renewDay',
        label: 'Renew Day',
        hint: 'When what was billed comes up for renewal',
        type: FieldType.dateTime,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'runDay',
        label: 'Run Day',
        hint: 'When the billing run is due',
        type: FieldType.dateTime,
        validations: [VALIDATOR_REQUIRED],
      },
      ...BILLING_WINDOW_DAYS.map((day) => ({
        key: day.key,
        label: day.label,
        type: FieldType.dateTime,
        validations: [VALIDATOR_REQUIRED],
      })),
    ],
    extraColumns: [
      { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
      {
        field: 'financialYear',
        header: 'Financial Year',
        valueFn: (row) => row?.financialYear?.name,
      },
      { field: 'startedAt', header: 'Starts' },
      { field: 'expiredAt', header: 'Ends' },
      { field: 'billExpireDay', header: 'Bills Expire' },
    ],
    toModel: (data) => ({
      subcategoryUid: data?.subcategory?.id,
      financialYearUid: data?.financialYear?.id,
    }),
  });

export const FIRST_WINDOW_BILLING_CYCLE = billingWindowLookup(
  'First',
  "When a person's first renewal-run bill expires",
  'event',
);

export const SECOND_WINDOW_BILLING_CYCLE = billingWindowLookup(
  'Second',
  'When every renewal bill after the first expires',
  'date_range',
);

/**
 * How long a subcategory is given before it counts as late, in three steps. Each
 * step is a number of minutes and the window of the year it applies in, written
 * as a day and a month at each end — so the form is a stepper, one page per
 * step, rather than fifteen controls in a column.
 *
 * A window may run backwards through the turn of the year (December into
 * January); nothing rejects that, here or in the database.
 */
export const GRACE_PERIOD = defineLookup({
  slug: 'grace-periods',
  entity: 'GracePeriod',
  entityPlural: 'GracePeriods',
  permission: 'GRACE_PERIOD',
  label: 'Grace Period',
  pluralLabel: 'Grace Periods',
  subtitle: 'How long a subcategory is given before it is treated as late',
  icon: 'clock',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  firstGracePeriodMinutes
  secondGracePeriodMinutes
  thirdGracePeriodMinutes
  firstGracePeriodStartedDay
  firstGracePeriodStartedMonth
  firstGracePeriodEndedDay
  firstGracePeriodEndedMonth
  secondGracePeriodStartedDay
  secondGracePeriodStartedMonth
  secondGracePeriodEndedDay
  secondGracePeriodEndedMonth
  thirdGracePeriodStartedDay
  thirdGracePeriodStartedMonth
  thirdGracePeriodEndedDay
  thirdGracePeriodEndedMonth
${graceMonthGqlFields}
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    ...graceStepFields('first', 'First'),
    ...graceStepFields('second', 'Second'),
    ...graceStepFields('third', 'Third'),
    ...graceMonthFields(),
  ],
  // Grouped step by step, which is the only grouping these fifteen have. A field
  // in no step still submits but renders nowhere, so every key appears once.
  formSteppers: [
    {
      name: 'Grace Period',
      icon: 'clock',
      keys: ['id', 'name', 'assignedNumber', 'description', 'subcategoryUid'],
    },
    { name: 'First Step', icon: 'looks_one', keys: graceStepKeys('first') },
    { name: 'Second Step', icon: 'looks_two', keys: graceStepKeys('second') },
    { name: 'Third Step', icon: 'looks_3', keys: graceStepKeys('third') },
    // The months row each month of the year keys off, February twice.
    { name: 'Months', icon: 'date_range', keys: graceMonthKeys },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'firstGracePeriodMinutes', header: 'First (min)' },
    { field: 'secondGracePeriodMinutes', header: 'Second (min)' },
    { field: 'thirdGracePeriodMinutes', header: 'Third (min)' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id, ...graceMonthsToModel(data) }),
  // What it bills once it has run out. Its own table, with no name and no flags,
  // so it is a panel with a form of its own rather than a lookup screen.
  extraContents: (comp, record) => [gracePeriodBillSettingsPanel(comp, record?.id)],
});

/**
 * The labels of the PostgreSQL enum `taxes_types`: the two a percentage or a
 * flat amount started with, and the six the DBA added on 2026-10-02. Nothing
 * computes with the six yet; they are offered so a row can carry one.
 */
const TAXES_TYPE_OPTIONS = [
  { value: 'INCREASE', label: 'Increase' },
  { value: 'DECREASE', label: 'Decrease' },
  { value: 'ADDITION', label: 'Addition' },
  { value: 'SUBTRACTION', label: 'Subtraction' },
  { value: 'MULTIPLICATION', label: 'Multiplication' },
  { value: 'DIVISION', label: 'Division' },
  { value: 'MODULUS', label: 'Modulus' },
  { value: 'EXPONENTIATION', label: 'Exponentiation' },
];

const taxesTypeLabel = (value?: string): string =>
  TAXES_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value ?? '';

/**
 * A figure and the direction it moves an amount in — `percentages`, under a
 * subcategory like the two above.
 *
 * `INCREASE` adds to what is owed, `DECREASE` takes away. Neither the table nor
 * the backend says whether 18 means 18% or something else: what it means is
 * decided where it is applied, so the form asks for a figure and a direction and
 * nothing more.
 */
export const PERCENTAGE = defineLookup({
  slug: 'percentages',
  entity: 'Percentage',
  entityPlural: 'Percentages',
  permission: 'PERCENTAGE',
  label: 'Percentage',
  pluralLabel: 'Percentages',
  subtitle: 'Figures that raise or lower what a subcategory is charged',
  icon: 'calculator',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  taxesType
  amount
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'taxesType',
      label: 'Direction',
      hint: 'Increase adds to what is owed, decrease takes away',
      type: FieldType.select,
      options: TAXES_TYPE_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'amount',
      label: 'Amount',
      type: FieldType.decimal,
      decimals: 4,
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    {
      field: 'taxesType',
      header: 'Direction',
      valueFn: (row) => taxesTypeLabel(row?.taxesType),
    },
    { field: 'amount', header: 'Amount' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
});

/**
 * The same as a percentage, but a fixed sum rather than a rate: a flat fee added
 * to what a subcategory is charged, or a flat relief taken off it. Five decimal
 * places, where a percentage has four.
 */
export const FLAT_AMOUNT = defineLookup({
  slug: 'flat-amounts',
  entity: 'FlatAmount',
  entityPlural: 'FlatAmounts',
  permission: 'FLAT_AMOUNT',
  label: 'Flat Amount',
  pluralLabel: 'Flat Amounts',
  subtitle: 'Fixed sums that raise or lower what a subcategory is charged',
  icon: 'money',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  taxesType
  amount
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'taxesType',
      label: 'Direction',
      hint: 'Increase adds to what is owed, decrease takes away',
      type: FieldType.select,
      options: TAXES_TYPE_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'amount',
      label: 'Amount',
      type: FieldType.decimal,
      decimals: 5,
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    {
      field: 'taxesType',
      header: 'Direction',
      valueFn: (row) => taxesTypeLabel(row?.taxesType),
    },
    { field: 'amount', header: 'Amount' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
});

/**
 * What a contract is worth, what is paid up front, and what a material costs.
 *
 * Three tables of the same shape, each hanging off a subcategory, each holding
 * a figure in `numeric(50,6)`. The database CHECKs a contract amount at zero or
 * above and the other two strictly above zero, which is the difference between
 * a contract that happens to be free and a payment that never happened.
 */
export const CONTRACT_AMOUNT = defineLookup({
  slug: 'contract-amounts',
  entity: 'ContractAmount',
  entityPlural: 'ContractAmounts',
  permission: 'CONTRACT_AMOUNT',
  label: 'Contract Amount',
  pluralLabel: 'Contract Amounts',
  subtitle: 'What a contract is worth',
  icon: 'money',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  amount
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'amount',
      label: 'Amount',
      type: FieldType.decimal,
      decimals: 6,
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'amount', header: 'Amount' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
});

export const DOWN_PAYMENT = defineLookup({
  slug: 'down-payments',
  entity: 'DownPayment',
  entityPlural: 'DownPayments',
  permission: 'DOWN_PAYMENT',
  label: 'Down Payment',
  pluralLabel: 'Down Payments',
  subtitle: 'What is paid up front, when, and for which units',
  icon: 'money',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  amount
  downPaymentDay
  deadline
  fromDay
  toDay
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'amount',
      label: 'Amount',
      hint: 'Greater than zero',
      type: FieldType.decimal,
      decimals: 6,
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
    // Two pairs, each CHECKed by the table and refused by the backend the
    // wrong way round: the day before its deadline, and from before to.
    {
      key: 'downPaymentDay',
      label: 'Down Payment Day',
      hint: 'Before the deadline',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'deadline',
      label: 'Deadline',
      hint: 'After the down payment day',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'fromDay',
      label: 'From Day',
      hint: 'Before the to day',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'toDay',
      label: 'To Day',
      hint: 'After the from day',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  // The stretch it stands for reads better on the detail page than squeezed
  // into the list.
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'amount', header: 'Amount' },
    { field: 'downPaymentDay', header: 'Down Payment Day' },
    { field: 'deadline', header: 'Deadline' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  extraContents: (comp, record) => recordLinkPanels(comp, 'DownPayment', record?.id),
});

/**
 * What is paid in parts, under a subcategory. The same shape as a down payment,
 * without the from and to days; the figure sits in a column named like the
 * table, so its key is `installments`.
 */
export const INSTALLMENT = defineLookup({
  slug: 'installments',
  entity: 'Installment',
  entityPlural: 'Installments',
  permission: 'INSTALLMENT',
  label: 'Installment',
  pluralLabel: 'Installments',
  subtitle: 'What is paid in parts, when, and for which units',
  icon: 'money',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  installments
  installmentDay
  deadline
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'installments',
      label: 'Installments',
      hint: 'Greater than zero',
      type: FieldType.input,
      inputType: 'number',
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
    // CHECKed by the table and refused by the backend the wrong way round.
    {
      key: 'installmentDay',
      label: 'Installment Day',
      hint: 'Before the deadline',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'deadline',
      label: 'Deadline',
      hint: 'After the installment day',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'installments', header: 'Installments' },
    { field: 'installmentDay', header: 'Installment Day' },
    { field: 'deadline', header: 'Deadline' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  extraContents: (comp, record) => recordLinkPanels(comp, 'Installment', record?.id),
});

/**
 * Assessments, and the judgments and findings they come to. Each is a named
 * record under a subcategory; an assessment also says the stretch of time it
 * covers. What an assessment covers -- people, tasks, objects -- and the
 * judgments and findings on it are panels on the assessment's own page; see
 * `LINKS_BY_RECORD`.
 */
export const ASSESSMENT = defineLookup({
  slug: 'assessments',
  entity: 'Assessment',
  entityPlural: 'Assessments',
  permission: 'ASSESSMENT',
  label: 'Assessment',
  pluralLabel: 'Assessments',
  subtitle: 'What is assessed, over which stretch of time',
  icon: 'verified_user',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  fromDate
  toDate
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'fromDate',
      label: 'From',
      hint: 'When the stretch assessed starts',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'toDate',
      label: 'To',
      hint: 'When it ends. Not before it starts',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'fromDate', header: 'From' },
    { field: 'toDate', header: 'To' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  extraContents: (comp, record) => recordLinkPanels(comp, 'Assessment', record?.id),
});

export const JUDGMENT = defineLookup({
  slug: 'judgments',
  entity: 'Judgment',
  entityPlural: 'Judgments',
  permission: 'JUDGMENT',
  label: 'Judgment',
  pluralLabel: 'Judgments',
  subtitle: 'Judgments, and the day each was given',
  icon: 'scales',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  judgmentsDay
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'judgmentsDay',
      label: 'Judgment Day',
      hint: 'When the judgment was given',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'judgmentsDay', header: 'Judgment Day' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  extraContents: (comp, record) => recordLinkPanels(comp, 'Judgment', record?.id),
});

export const FINDING = defineLookup({
  slug: 'findings',
  entity: 'Finding',
  entityPlural: 'Findings',
  permission: 'FINDING',
  label: 'Finding',
  pluralLabel: 'Findings',
  subtitle: 'What an assessment found',
  icon: 'list',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY)],
  extraColumns: [{ field: 'subcategory', valueFn: (row) => row?.subcategory?.name }],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  extraContents: (comp, record) => recordLinkPanels(comp, 'Finding', record?.id),
});

/**
 * What an inspection noted, under a subcategory (`observations`) — where a
 * finding is what it concluded. Which inspections recorded it is on its page.
 */
export const OBSERVATION = defineLookup({
  slug: 'observations',
  entity: 'Observation',
  entityPlural: 'Observations',
  permission: 'OBSERVATION',
  label: 'Observation',
  pluralLabel: 'Observations',
  subtitle: 'What an inspection noted',
  icon: 'view',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY)],
  extraColumns: [{ field: 'subcategory', valueFn: (row) => row?.subcategory?.name }],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  extraContents: (comp, record) => recordLinkPanels(comp, 'Observation', record?.id),
});

/**
 * What a person can be put on a piece of work as, under a subcategory
 * (`positions`). Picked when someone is put on an inspection, an assessment, a
 * project or a task; it replaced a fixed list of twelve roles.
 *
 * Not a designation, which is a member of staff's job title on their login.
 */
export const POSITION = defineLookup({
  slug: 'positions',
  entity: 'Position',
  entityPlural: 'Positions',
  permission: 'POSITION',
  label: 'Position',
  pluralLabel: 'Positions',
  subtitle: 'What a person is on an inspection, an assessment, a project or a task as',
  icon: 'users',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY)],
  extraColumns: [{ field: 'subcategory', valueFn: (row) => row?.subcategory?.name }],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
});

/**
 * Centres under a subcategory, at one of six levels (`centers`). Which centre
 * sits under which is on the centre's own page — `centers_centers`, see
 * `LINKS_BY_RECORD`. Not the GePG collection centre.
 */
export const CENTER = defineLookup({
  slug: 'centers',
  entity: 'Center',
  entityPlural: 'Centers',
  permission: 'CENTER',
  label: 'Centre',
  pluralLabel: 'Centres',
  subtitle: 'Centres under a subcategory, and the level each sits at',
  icon: 'institution',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  hierarchy
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'hierarchy',
      label: 'Hierarchy Level',
      hint: 'From 1 to 6',
      type: FieldType.select,
      // The six the table allows (`centers32`). Numbers until the levels are named.
      options: [1, 2, 3, 4, 5, 6].map((level) => ({ value: level, label: `Level ${level}` })),
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'hierarchy', header: 'Level' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  // The centres under this one, and the ones it sits under (centers_centers).
  extraContents: (comp, record) => recordLinkPanels(comp, 'Center', record?.id),
});

export const MATERIAL = defineLookup({
  slug: 'materials',
  entity: 'Material',
  entityPlural: 'Materials',
  permission: 'MATERIAL',
  label: 'Material',
  pluralLabel: 'Materials',
  subtitle: 'What a material costs, and how much there is',
  icon: 'package',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  price
  quantity
  unitOfMeasure {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'price',
      label: 'Price',
      hint: 'Greater than zero',
      type: FieldType.decimal,
      decimals: 6,
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'quantity',
      label: 'Quantity',
      hint: 'Greater than zero',
      type: FieldType.decimal,
      decimals: 6,
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'unitOfMeasureUid',
      label: 'Unit of Measure',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: ALL_UNIT_OF_MEASURES },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'price', header: 'Price' },
    { field: 'quantity', header: 'Quantity' },
    { field: 'unitOfMeasure', header: 'Unit', valueFn: (row) => row?.unitOfMeasure?.name },
  ],
  toModel: (data) => ({
    subcategoryUid: data?.subcategory?.id,
    unitOfMeasureUid: data?.unitOfMeasure?.id,
  }),
  // The grades a material comes in (materials_grades).
  extraContents: (comp, record) => entityLinkPanels(comp, [MATERIAL_GRADE_LINK], record?.id),
});

/**
 * An object, filed under one subcategory — `remis_core_schema.objectsid`, one
 * word, as the DBA named it. The backend builds its reads from `ObjectsId`, so
 * `allObjectsIds`, `saveObjectsId` and the rest.
 *
 * Code, name and description are each UNIQUE, and soft-deleted rows still hold
 * theirs.
 */
export const OBJECTS_ID = defineLookup({
  slug: 'objects',
  entity: 'ObjectsId',
  entityPlural: 'ObjectsIds',
  permission: 'OBJECTS_ID',
  label: 'Object',
  pluralLabel: 'Objects',
  subtitle: 'Objects under a subcategory, and the grades each carries',
  icon: 'category',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY)],
  extraColumns: [{ field: 'subcategory', valueFn: (row) => row?.subcategory?.name }],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  // The grades an object carries (objectsid_grades), then the inspections that
  // looked at it (inspections_objectsid). Deleting the object is refused while
  // any of either are linked.
  extraContents: (comp, record) => [
    ...entityLinkPanels(comp, [OBJECTS_ID_GRADE_LINK], record?.id),
    ...recordLinkPanels(comp, 'ObjectsId', record?.id),
  ],
});

/** A moment on the certificate. All five are timestamps in the table. */
const certificateMoment = (key: string, label: string, hint?: string): FieldConfig => ({
  key,
  label,
  hint,
  type: FieldType.dateTime,
  validations: [VALIDATOR_REQUIRED],
});

/**
 * A certificate under a subcategory: who issued it and when, the period it is
 * valid for, and the days a penalty falls and it is renewed.
 *
 * The table checks valid from < valid to < renew day; the backend says so
 * before the constraint does. Left empty, the issuer is the person saving it
 * and a new certificate is issued now.
 *
 * One certificate can sit under another (certificates_certificates), read from
 * both ends on the certificate's page.
 */
export const CERTIFICATE: LookupModule = defineLookup({
  slug: 'certificates',
  entity: 'Certificate',
  entityPlural: 'Certificates',
  permission: 'CERTIFICATE',
  label: 'Certificate',
  pluralLabel: 'Certificates',
  subtitle: 'Certificates issued under a subcategory, and when each runs out',
  icon: 'verified_user',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  issuedAt
  issuedBy {
    id
    name
  }
  validFrom
  validTo
  penaltyDay
  renewDay
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'issuedByUid',
      label: 'Issued By',
      hint: 'Left empty, you are recorded as the issuer',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: ALL_BIO_DATA_NAMES },
      },
    },
    {
      key: 'issuedAt',
      label: 'Issued At',
      hint: 'Left empty, a new certificate is issued now',
      type: FieldType.dateTime,
    },
    certificateMoment('validFrom', 'Valid From'),
    certificateMoment('validTo', 'Valid To', 'After valid from'),
    certificateMoment('penaltyDay', 'Penalty Day'),
    certificateMoment('renewDay', 'Renew Day', 'After valid to'),
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'validFrom', header: 'Valid From' },
    { field: 'validTo', header: 'Valid To' },
    { field: 'renewDay', header: 'Renews' },
  ],
  toModel: (data) => ({
    subcategoryUid: data?.subcategory?.id,
    issuedByUid: data?.issuedBy?.id,
  }),
  // The certificates under this one, and those it sits under. Deleting it is
  // refused while either list has anything in it.
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      [
        {
          entity: 'CertificateCertificate',
          byOwnerQuery: 'certificateCertificatesByParent',
          ownerArg: 'parentUid',
          targetArg: 'childUid',
          field: 'child',
          label: 'Certificate',
          pluralLabel: 'Certificates Under This One',
          icon: 'verified_user',
          permission: 'CERTIFICATE_CERTIFICATE',
          optionsQuery: CERTIFICATE.gql.all,
        },
        {
          entity: 'CertificateCertificate',
          byOwnerQuery: 'certificateCertificatesByChild',
          ownerArg: 'childUid',
          targetArg: 'parentUid',
          field: 'parent',
          label: 'Certificate',
          pluralLabel: 'Sits Under',
          icon: 'verified_user',
          permission: 'CERTIFICATE_CERTIFICATE',
          optionsQuery: CERTIFICATE.gql.all,
        },
      ],
      record?.id,
    ),
});

/**
 * A budget: what is set aside, and which version of it this is.
 *
 * `flags` says whether it is the one in force, a superseded one, the main one
 * or an additional one. The amount defaults to zero in the database — a budget
 * of nothing is a real state, unlike a down payment of nothing — so the form
 * leaves it optional.
 */
export const BUDGET = defineLookup({
  slug: 'budgets',
  entity: 'Budget',
  entityPlural: 'Budgets',
  permission: 'BUDGET',
  label: 'Budget',
  pluralLabel: 'Budgets',
  subtitle: 'What is set aside, and which version it is',
  icon: 'wallet',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  amount
  flag
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'amount',
      label: 'Amount',
      hint: 'Zero when left empty',
      type: FieldType.decimal,
      decimals: 6,
      min: 0,
    },
    {
      key: 'flag',
      label: 'Flag',
      type: FieldType.select,
      options: [
        { value: 'LATEST', label: 'Latest' },
        { value: 'OLD', label: 'Old' },
        { value: 'MAIN', label: 'Main' },
        { value: 'ADDITIONAL', label: 'Additional' },
      ],
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'amount', header: 'Amount' },
    { field: 'flag', header: 'Flag' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  // What this budget is broken into, and what draws on it.
  extraContents: (comp, record) => entityLinkPanels(comp, BUDGET_LINKS, record?.id),
});

const ALL_BUDGETS = gql`
  query allBudgets {
    allBudgets {
      id
      name
    }
  }
`;

const ALL_CONTRACT_AMOUNTS_FOR_LINK = gql`
  query allContractAmounts {
    allContractAmounts {
      id
      name
    }
  }
`;

/** What a budget is broken into, and what is charged to it. */
const BUDGET_LINKS: EntityLinkConfig[] = [
  {
    entity: 'BudgetBudget',
    byOwnerQuery: 'budgetBudgetsByParent',
    ownerArg: 'parentUid',
    targetArg: 'childUid',
    field: 'child',
    label: 'Child Budget',
    pluralLabel: 'Child Budgets',
    icon: 'wallet',
    permission: 'BUDGET_BUDGET',
    optionsQuery: ALL_BUDGETS,
  },
  {
    entity: 'ContractAmountBudget',
    byOwnerQuery: 'contractAmountBudgetsByBudget',
    ownerArg: 'budgetUid',
    targetArg: 'contractAmountUid',
    field: 'contractAmount',
    label: 'Contract Amount',
    pluralLabel: 'Contract Amounts',
    icon: 'money',
    permission: 'CONTRACT_AMOUNT_BUDGET',
    optionsQuery: ALL_CONTRACT_AMOUNTS_FOR_LINK,
  },
];

/**
 * One approval on its own: who gave it, when, and the status it conferred.
 *
 * Nothing here says what was approved — the join tables pointing at it do that,
 * so the same decision can be attached wherever it applies.
 */
export const APPROVE = defineLookup({
  slug: 'approvals',
  entity: 'Approve',
  entityPlural: 'Approves',
  permission: 'APPROVE',
  label: 'Approval',
  pluralLabel: 'Approvals',
  subtitle: 'Who approved something, when, and to what status',
  icon: 'check',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  approvedAt
  approvedBy {
    id
    uid: id
    name
  }
  status
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'approvedByUid',
      label: 'Approved By',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: ALL_BIO_DATA_NAMES },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'approvedAt',
      label: 'Approved At',
      hint: 'Left empty, this is set to now',
      type: FieldType.dateTime,
    },
    {
      key: 'status',
      label: 'Status',
      type: FieldType.select,
      options: APPROVAL_STATUS_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'approvedBy', header: 'Approved By', valueFn: (row) => row?.approvedBy?.name },
    { field: 'approvedAt', header: 'Approved At' },
    { field: 'status', header: 'Status' },
  ],
  toModel: (data) => ({
    subcategoryUid: data?.subcategory?.id,
    approvedByUid: data?.approvedBy?.id,
  }),
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
  subtitle: "Whether a bill item's own reference is used when paying",
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
 * Accounts under a subcategory, and the day each started (`accounts`). The fees
 * that belong to an account are a panel on its own page -- `accounts_fees`, see
 * `LINKS_BY_RECORD`. Not a bank account.
 */
export const ACCOUNT = defineLookup({
  slug: 'accounts',
  entity: 'Account',
  entityPlural: 'Accounts',
  permission: 'ACCOUNT',
  label: 'Account',
  pluralLabel: 'Accounts',
  subtitle: 'Accounts, and the fees that belong to each',
  icon: 'wallet',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  startedDay
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'startedDay',
      label: 'Started Day',
      hint: 'When the account started',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'startedDay', header: 'Started' },
  ],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  extraContents: (comp, record) => recordLinkPanels(comp, 'Account', record?.id),
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
  renewable
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
    {
      key: 'renewable',
      label: 'Renewable',
      hint: 'Off: billed to a person once, then left out of their renewals',
      type: FieldType.toggle,
      value: true,
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    'amount',
    { field: 'minimumPayment', valueFn: (row) => row?.minimumPayment?.name },
    { field: 'renewable', header: 'Renewable', valueFn: (row) => (row?.renewable ? 'Yes' : 'No') },
  ],
  toModel: (data) => ({
    minimumPaymentUid: data?.minimumPayment?.id,
    paymentGracePeriodUid: data?.paymentGracePeriod?.id,
  }),
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Fee', record?.id),
});

/**
 * The select each of a bill template's twenty-three relations uses.
 *
 * Declared here rather than beside `parentSelect` because it takes the lookup
 * itself rather than a thunk: every one of these is declared above this point,
 * so there is nothing to defer.
 */
/**
 * One of the three people a template files its automatic bills under.
 *
 * Its own helper because these read from `bio_data` rather than a lookup, and
 * people are labelled from their name parts — `bio_data.name` is nullable and
 * nothing on the user-creation path fills it in.
 */
const templatePerson = (key: string, label: string, hint: string): FieldConfig => ({
  key,
  label,
  hint,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query: ALL_BIO_DATA_NAMES },
  },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/**
 * What a bill details template is described by: a named record under one
 * subcategory. Every template names one.
 */
export const BILL_HEADERS_DESCRIPTION = defineLookup({
  slug: 'bill-headers-descriptions',
  entity: 'BillHeadersDescription',
  entityPlural: 'BillHeadersDescriptions',
  permission: 'BILL_HEADERS_DESCRIPTION',
  label: 'Bill Header Description',
  pluralLabel: 'Bill Header Descriptions',
  subtitle: 'What a renewal bill is named and described by',
  icon: 'bill',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY)],
  extraColumns: [{ field: 'subcategory', valueFn: (row) => row?.subcategory?.name }],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
});

/**
 * What an automatic bill setting belongs to: a named group of them under one
 * subcategory. Every setting names one, and each names the bill header
 * description it is described by.
 */
export const BILL_DETAILS_TEMPLATE = defineLookup({
  slug: 'bill-details-templates',
  entity: 'BillDetailsTemplate',
  entityPlural: 'BillDetailsTemplates',
  permission: 'BILL_DETAILS_TEMPLATE',
  label: 'Bill Details Template',
  pluralLabel: 'Bill Details Templates',
  subtitle: 'What a renewal bill detail is named and described by',
  icon: 'bill',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  billHeadersDescription {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    parentSelect(
      'billHeadersDescriptionUid',
      'Bill Header Description',
      () => BILL_HEADERS_DESCRIPTION,
    ),
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    {
      field: 'billHeadersDescription',
      header: 'Bill Header Description',
      valueFn: (row) => row?.billHeadersDescription?.name,
    },
  ],
  toModel: (data) => ({
    subcategoryUid: data?.subcategory?.id,
    billHeadersDescriptionUid: data?.billHeadersDescription?.id,
  }),
});

const templateSelect = (key: string, label: string, lookup: LookupModule): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query: lookup.gql.all },
  },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/**
 * The template a bill is raised from without anyone filling a form — an
 * application fee, say.
 *
 * Configuration, not a bill. The twenty-three relations are the union of what the
 * three operational tables need: the codes a `bill_header` is raised under, the
 * currency and payer codes of a `bill_detail`, and one `bill_item`'s worth of
 * fee, quantity and rates. Whatever generates the bill reads one row here and
 * writes all three.
 *
 * Every relation is required, because every foreign key on the table is NOT
 * NULL — there is no partial template, and a half-filled one could not be saved
 * at all. That is why the form is a stepper: twenty-six controls in one list
 * gives no sense of which belong together, and these fall into the three records
 * they will become.
 *
 * The applied/expiry pair is the window this template is in force for, not the
 * life of the bills it raises — those expire `ttlSeconds` after they are
 * generated. Which step raises which template is the join on the workflow step's
 * own screen.
 *
 * The last three fields say who an automatically raised bill is filed under.
 * There is no operator behind a renewal run and `bill_details` needs all three,
 * so the template names them.
 */
/**
 * The penalties billed from a bill setting — `bill_headers_settings_penalties`.
 *
 * A penalty that falls due has to become a bill line, and a line is assembled
 * from a setting. The link says which setting that is; nothing raises a penalty
 * line from it yet. The same link is offered from the penalty's own page.
 */
const BILL_SETTING_PENALTY_LINK: EntityLinkConfig = {
  entity: 'BillHeadersSettingPenalty',
  byOwnerQuery: 'billHeadersSettingPenaltiesBySetting',
  ownerArg: 'billHeadersSettingUid',
  targetArg: 'penaltyUid',
  field: 'penalty',
  label: 'Penalty',
  pluralLabel: 'Penalties',
  icon: 'warning',
  permission: 'BILL_HEADERS_SETTING_PENALTY',
  optionsQuery: gql`
    query allPenalties {
      allPenalties {
        id
        name
      }
    }
  `,
};

export const BILL_HEADERS_SETTING = defineLookup({
  slug: 'bill-headers-settings',
  entity: 'BillHeadersSetting',
  entityPlural: 'BillHeadersSettings',
  permission: 'BILL_HEADERS_SETTING',
  label: 'Automatic Bill Setting',
  pluralLabel: 'Automatic Bill Settings',
  subtitle: 'The template an automatically raised bill is built from',
  icon: 'bill',
  extraGqlFields: `
  appliedDate
  expiredDate
  ttlSeconds
  quantities
  billHeadersName
  billHeadersDescription
  billItemsName
  billItemsDescription
  compound
  billDetailsTemplate { ${lookupRefGqlFields} }
  generatedBy { id name }
  approvedBy { id name }
  requestedBy { id name }
  systemCode { ${lookupRefGqlFields} }
  spGrpCode { ${lookupRefGqlFields} }
  billPayOption { ${lookupRefGqlFields} }
  billPaymentPlan { ${lookupRefGqlFields} }
  financialYear { ${lookupRefGqlFields} }
  collectionCenter { ${lookupRefGqlFields} }
  currency { ${lookupRefGqlFields} }
  exchangeRate { ${lookupRefGqlFields} }
  gepgBillType { ${lookupRefGqlFields} }
  gepgPayType { ${lookupRefGqlFields} }
  payPlan { ${lookupRefGqlFields} }
  spCode { ${lookupRefGqlFields} }
  identityType { ${lookupRefGqlFields} }
  paymentServiceProvider { ${lookupRefGqlFields} }
  subSpCode { ${lookupRefGqlFields} }
  gfsCode { ${lookupRefGqlFields} }
  fee { ${lookupRefGqlFields} }
  useItemRefOnPay { ${lookupRefGqlFields} }
  vat { ${lookupRefGqlFields} }
  withholdingTax { ${lookupRefGqlFields} }
  discount { ${lookupRefGqlFields} }
  collsp { ${lookupRefGqlFields} }
`,
  extraFields: [
    {
      key: 'appliedDate',
      label: 'In Force From',
      hint: 'When this template starts applying',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'expiredDate',
      label: 'In Force Until',
      hint: 'After this the template stops applying. Not the life of its bills',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'ttlSeconds',
      label: 'Bill Lifetime (seconds)',
      hint: 'How long a bill raised from this template stays payable. 86400 is one day',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'quantities',
      label: 'Quantity',
      hint: 'How many units the generated line carries',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    templateSelect('billDetailsTemplateUid', 'Bill Details Template', BILL_DETAILS_TEMPLATE),
    // Kept on record: the DBA has not yet said what billing does with it.
    {
      key: 'compound',
      label: 'Compound',
      type: FieldType.toggle,
      value: false,
      class: 'col-span-full',
    },
    templateSelect('systemCodeUid', 'System Code', SYSTEM_CODE),
    templateSelect('spGrpCodeUid', 'SP Group Code', SP_GRP_CODE),
    templateSelect('billPayOptionUid', 'Bill Pay Option', BILL_PAY_OPTION),
    templateSelect('billPaymentPlanUid', 'Bill Payment Plan', BILL_PAYMENT_PLAN),
    templateSelect('financialYearUid', 'Financial Year', FINANCIAL_YEAR),
    templateSelect('collectionCenterUid', 'Collection Centre', COLLECTION_CENTER),
    templateSelect('currencyUid', 'Currency', CURRENCY),
    templateSelect('exchangeRateUid', 'Exchange Rate', EXCHANGE_RATE),
    templateSelect('gepgBillTypeUid', 'GePG Bill Type', GEPG_BILL_TYPE),
    templateSelect('gepgPayTypeUid', 'GePG Pay Type', GEPG_PAY_TYPE),
    templateSelect('payPlanUid', 'Pay Plan', PAY_PLAN),
    templateSelect('spCodeUid', 'SP Code', SP_CODE),
    templateSelect('identityTypeUid', 'Identity Type', IDENTITY_TYPE),
    templateSelect(
      'paymentServiceProviderUid',
      'Payment Service Provider',
      PAYMENT_SERVICE_PROVIDER,
    ),
    templateSelect('subSpCodeUid', 'Sub SP Code', SUB_SP_CODE),
    templateSelect('gfsCodeUid', 'GFS Code', GFS_CODE),
    templateSelect('feeUid', 'Fee', FEE),
    templateSelect('useItemRefOnPayUid', 'Use Item Reference On Pay', USE_ITEM_REF_ON_PAY),
    templateSelect('vatUid', 'VAT', VAT),
    templateSelect('withholdingTaxUid', 'Withholding Tax', WITHHOLDING_TAX),
    templateSelect('discountUid', 'Discount', DISCOUNT),
    templateSelect('collspUid', 'Collection Service Provider', COLLSP),
    templatePerson(
      'generatedByUid',
      'Generated By',
      'Who a bill raised from this template is recorded as generated by',
    ),
    // All three have to be one person: the table's trigger refuses anything
    // else, and the backend says so before it gets that far.
    templatePerson('approvedByUid', 'Approved By', 'Must be the same person as Generated By'),
    templatePerson('requestedByUid', 'Requested By', 'Must be the same person as Generated By'),
    // Apart from the template's own name and description, which identify the
    // template and must be unique. Stored only: the renewal run names a line
    // from the setting's own name, and the bill from the setting's bill details
    // template and that template's bill header description.
    {
      key: 'billHeadersName',
      label: 'Bill Name',
      hint: 'Kept on record. A renewal bill is named from its bill header description. Up to 100 characters',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'billHeadersDescription',
      label: 'Bill Description',
      hint: 'Kept on record. A renewal bill is described by its bill header description',
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'billItemsName',
      label: 'Bill Line Name',
      hint: "Kept on record. A renewal bill line takes this setting's own name. Up to 100 characters",
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'billItemsDescription',
      label: 'Bill Line Description',
      hint: "Kept on record. A renewal bill line takes this setting's own description",
      type: FieldType.textarea,
      rows: 3,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  // Grouped by the record each field becomes, which is the only grouping these
  // thirty-one have. A field in no step still submits but renders nowhere, so
  // every key above appears exactly once below.
  formSteppers: [
    {
      name: 'Template',
      icon: 'settings',
      keys: [
        'id',
        'name',
        'assignedNumber',
        'description',
        'billDetailsTemplateUid',
        'compound',
        'appliedDate',
        'expiredDate',
      ],
    },
    {
      name: 'Bill Header',
      icon: 'bill',
      keys: [
        'systemCodeUid',
        'spGrpCodeUid',
        'billPayOptionUid',
        'billPaymentPlanUid',
        'financialYearUid',
        'ttlSeconds',
        'billHeadersName',
        'billHeadersDescription',
      ],
    },
    {
      name: 'Bill',
      icon: 'institution',
      keys: [
        'collectionCenterUid',
        'currencyUid',
        'exchangeRateUid',
        'gepgBillTypeUid',
        'gepgPayTypeUid',
        'payPlanUid',
        'spCodeUid',
        'identityTypeUid',
        'paymentServiceProviderUid',
      ],
    },
    {
      name: 'Bill Line',
      icon: 'list',
      keys: [
        'subSpCodeUid',
        'gfsCodeUid',
        'feeUid',
        'quantities',
        'useItemRefOnPayUid',
        'vatUid',
        'withholdingTaxUid',
        'discountUid',
        'collspUid',
        'billItemsName',
        'billItemsDescription',
      ],
    },
    // A renewal has no operator behind it, and bill_details needs all three.
    {
      name: 'Filed Under',
      icon: 'users',
      keys: ['generatedByUid', 'approvedByUid', 'requestedByUid'],
    },
  ],
  extraColumns: [
    { field: 'fee', header: 'Fee', valueFn: (row) => row?.fee?.name },
    { field: 'quantities', header: 'Qty' },
    { field: 'ttlSeconds', header: 'Bill Lifetime (s)' },
    { field: 'appliedDate', header: 'In Force From' },
    { field: 'expiredDate', header: 'In Force Until' },
  ],
  /** The record comes back with all twenty-six nested; the form edits their ids. */
  toModel: (data) => ({
    billDetailsTemplateUid: data?.billDetailsTemplate?.id,
    systemCodeUid: data?.systemCode?.id,
    spGrpCodeUid: data?.spGrpCode?.id,
    billPayOptionUid: data?.billPayOption?.id,
    billPaymentPlanUid: data?.billPaymentPlan?.id,
    financialYearUid: data?.financialYear?.id,
    collectionCenterUid: data?.collectionCenter?.id,
    currencyUid: data?.currency?.id,
    exchangeRateUid: data?.exchangeRate?.id,
    gepgBillTypeUid: data?.gepgBillType?.id,
    gepgPayTypeUid: data?.gepgPayType?.id,
    payPlanUid: data?.payPlan?.id,
    spCodeUid: data?.spCode?.id,
    identityTypeUid: data?.identityType?.id,
    paymentServiceProviderUid: data?.paymentServiceProvider?.id,
    subSpCodeUid: data?.subSpCode?.id,
    gfsCodeUid: data?.gfsCode?.id,
    feeUid: data?.fee?.id,
    useItemRefOnPayUid: data?.useItemRefOnPay?.id,
    vatUid: data?.vat?.id,
    withholdingTaxUid: data?.withholdingTax?.id,
    discountUid: data?.discount?.id,
    collspUid: data?.collsp?.id,
    generatedByUid: data?.generatedBy?.id,
    approvedByUid: data?.approvedBy?.id,
    requestedByUid: data?.requestedBy?.id,
  }),
  // Whom this setting raises bills for, how much of it for each
  // (bill_headers_settings_quantities), and the penalties billed from it.
  extraContents: (comp, record) => [
    billSettingPeoplePanel(comp, record?.id),
    lookupChildPanel(
      comp,
      () => BILL_HEADERS_SETTING_QUANTITY,
      BILL_SETTING_QUANTITIES_BY_SETTING,
      { billHeadersSettingUid: record?.id },
      {
        presetModel: { billHeadersSettingUid: record?.id },
        keyColumns: [
          'index',
          'name',
          { field: 'bioData', header: 'Person', valueFn: (row) => row?.bioData?.name },
          { field: 'quantities', header: 'Quantity' },
          { field: 'startedDay', header: 'Started Day' },
          { field: 'deadline', header: 'Deadline' },
          'actions',
        ],
      },
    ),
    ...entityLinkPanels(comp, [BILL_SETTING_PENALTY_LINK], record?.id),
  ],
});

/**
 * A quantity a person is billed for, under a subcategory, in a financial year —
 * `bill_headers_settings_quantities`.
 *
 * It belongs to one bill headers setting, and is listed and added on that
 * setting's page too. It has a bill creation day as well, which the table
 * requires to equal the started day, so the form asks for the started day only
 * and the backend writes it twice.
 */
export const BILL_HEADERS_SETTING_QUANTITY = defineLookup({
  slug: 'bill-setting-quantities',
  entity: 'BillHeadersSettingQuantity',
  entityPlural: 'BillHeadersSettingQuantities',
  permission: 'BILL_HEADERS_SETTING_QUANTITY',
  label: 'Bill Setting Quantity',
  pluralLabel: 'Bill Setting Quantities',
  subtitle: 'The quantities a person is billed for, by subcategory and financial year',
  icon: 'calculator',
  extraGqlFields: `
  billHeadersSetting {
    ${lookupRefGqlFields}
  }
  subcategory {
    ${lookupRefGqlFields}
  }
  bioData {
    id
    name
  }
  financialYear {
    ${lookupRefGqlFields}
  }
  quantities
  startedDay
  deadline
  billCreationDay
`,
  extraFields: [
    parentSelect('billHeadersSettingUid', 'Bill Headers Setting', () => BILL_HEADERS_SETTING),
    parentSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'bioDataUid',
      label: 'Person',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: ALL_BIO_DATA_NAMES },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    parentSelect('financialYearUid', 'Financial Year', () => FINANCIAL_YEAR),
    {
      key: 'quantities',
      label: 'Quantity',
      hint: 'Greater than zero',
      type: FieldType.input,
      inputType: 'number',
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
    // CHECKed by the table and refused by the backend the wrong way round.
    {
      key: 'startedDay',
      label: 'Started Day',
      hint: 'Before the deadline. Also the day the bill is created',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'deadline',
      label: 'Deadline',
      hint: 'After the started day',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    {
      field: 'billHeadersSetting',
      header: 'Bill Headers Setting',
      valueFn: (row) => row?.billHeadersSetting?.name,
    },
    { field: 'bioData', header: 'Person', valueFn: (row) => row?.bioData?.name },
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'financialYear', header: 'Financial Year', valueFn: (row) => row?.financialYear?.name },
    { field: 'quantities', header: 'Quantity' },
    { field: 'startedDay', header: 'Started Day' },
    { field: 'deadline', header: 'Deadline' },
  ],
  toModel: (data) => ({
    billHeadersSettingUid: data?.billHeadersSetting?.id,
    subcategoryUid: data?.subcategory?.id,
    bioDataUid: data?.bioData?.id,
    financialYearUid: data?.financialYear?.id,
  }),
  // Nothing bills a quantity by itself: its bill is raised from its row, on a
  // new control number or on the one the payer already holds.
  rowActions: (comp) => [
    raiseQuantityBillForNewNumberBtn(comp),
    raiseQuantityBillForReuseBtn(comp),
  ],
});

export const BILL_SETTING_QUANTITIES_BY_SETTING = gql`
  query billHeadersSettingQuantitiesBySetting($billHeadersSettingUid: String) {
    billHeadersSettingQuantitiesBySetting(billHeadersSettingUid: $billHeadersSettingUid) {
      ${lookupChildGqlFields}
      billHeadersSetting {
        ${lookupRefGqlFields}
      }
      subcategory {
        ${lookupRefGqlFields}
      }
      bioData {
        id
        name
      }
      financialYear {
        ${lookupRefGqlFields}
      }
      quantities
      startedDay
      deadline
    }
  }
`;

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
  // The joins read from this side — which units, and which people, it is tied to.
  extraContents: (comp, record) => [
    ...recordLinkPanels(comp, 'Street', record?.id),
    ...entityLinkPanels(
      comp,
      [
        {
          entity: 'BioDataStreet',
          byOwnerQuery: 'bioDataStreetsByStreet',
          ownerArg: 'streetUid',
          targetArg: 'bioDataUid',
          field: 'bioData',
          label: 'Person',
          pluralLabel: 'People',
          icon: 'person',
          permission: 'BIO_DATA_STREET',
          optionsQuery: ALL_BIO_DATA_NAMES,
          // A person has no assigned number, so the default selection does not apply.
          targetGqlFields: `
    id
    uid: id
    name
  `,
          columns: ['index', 'bioData.name as Person', 'actions'],
        },
      ],
      record?.id,
    ),
  ],
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

export const CATEGORIES_BY_TYPE = gql`
  query categoriesByType($typeUid: String) {
    categoriesByType(typeUid: $typeUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const SUBCATEGORIES_BY_CATEGORY = gql`
  query subcategoriesByCategory($categoryUid: String) {
    subcategoriesByCategory(categoryUid: $categoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const RENEWS_BY_SUBCATEGORY = gql`
  query renewsBySubcategory($subcategoryUid: String) {
    renewsBySubcategory(subcategoryUid: $subcategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const PERCENTAGES_BY_SUBCATEGORY = gql`
  query percentagesBySubcategory($subcategoryUid: String) {
    percentagesBySubcategory(subcategoryUid: $subcategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const FLAT_AMOUNTS_BY_SUBCATEGORY = gql`
  query flatAmountsBySubcategory($subcategoryUid: String) {
    flatAmountsBySubcategory(subcategoryUid: $subcategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const GRACE_PERIODS_BY_SUBCATEGORY = gql`
  query gracePeriodsBySubcategory($subcategoryUid: String) {
    gracePeriodsBySubcategory(subcategoryUid: $subcategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const BILL_HEADERS_DESCRIPTIONS_BY_SUBCATEGORY = gql`
  query billHeadersDescriptionsBySubcategory($subcategoryUid: String) {
    billHeadersDescriptionsBySubcategory(subcategoryUid: $subcategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const BILL_DETAILS_TEMPLATES_BY_SUBCATEGORY = gql`
  query billDetailsTemplatesBySubcategory($subcategoryUid: String) {
    billDetailsTemplatesBySubcategory(subcategoryUid: $subcategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const FIRST_WINDOW_BILLING_CYCLES_BY_SUBCATEGORY = gql`
  query firstWindowBillingCyclesBySubcategory($subcategoryUid: String) {
    firstWindowBillingCyclesBySubcategory(subcategoryUid: $subcategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const SECOND_WINDOW_BILLING_CYCLES_BY_SUBCATEGORY = gql`
  query secondWindowBillingCyclesBySubcategory($subcategoryUid: String) {
    secondWindowBillingCyclesBySubcategory(subcategoryUid: $subcategoryUid) {
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
  // remis_core_schema.attachments, not the uaa.attachments the upload screen
  // serves. See attachment-lookups.ts on why both exist.
  CORE_ATTACHMENT,
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
  GEPG_END_POINT,
  GEPG_PAY_TYPE,
  HEADERS_FOR_NORMAL_BILL,
  HEADERS_FOR_BILL_CHANGE,
  HEADERS_FOR_CN_REUSE,
  CODE,
  CODE_STATUS,
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
  ACCOUNT,
  BILL_HEADERS_DESCRIPTION,
  BILL_DETAILS_TEMPLATE,
  BILL_HEADERS_SETTING,
  BILL_HEADERS_SETTING_QUANTITY,
  // Where a renewal-run bill's expiry comes from: first bill, then renewals.
  FIRST_WINDOW_BILLING_CYCLE,
  SECOND_WINDOW_BILLING_CYCLE,
];

export const REFERENCE_LOOKUPS: LookupModule[] = [
  COUNTRY,
  CURRENCY,
  EXCHANGE_RATE,
  FINANCIAL_YEAR,
  METER,
  // In hierarchy order, so the menu reads type-downwards.
  TYPE,
  CATEGORY,
  SUBCATEGORY,
  // What a subcategory renews on, and the grace it is given — both hang off a
  // subcategory and nothing else, so they follow it.
  RENEW,
  GRACE_PERIOD,
  PERCENTAGE,
  FLAT_AMOUNT,
  CONTRACT_AMOUNT,
  DOWN_PAYMENT,
  INSTALLMENT,
  CENTER,
  ASSESSMENT,
  JUDGMENT,
  FINDING,
  OBSERVATION,
  POSITION,
  MATERIAL,
  OBJECTS_ID,
  CERTIFICATE,
  BUDGET,
  APPROVE,
];

/** In hierarchy order, so the menu reads country-downwards. */
export const LOCATION_LOOKUPS: LookupModule[] = [REGION, DISTRICT, COUNCIL, WARD, STREET];

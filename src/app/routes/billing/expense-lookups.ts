import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  defineLookup,
  EntityLinkConfig,
  entityLinkPanels,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';

import { CURRENCY, SUBCATEGORY } from '@routes/settings/settings-lookups';

/**
 * Expenses: money spent, when, how much and in which currency.
 *
 * Filed under billing because it is the one money screen there is. The expense
 * names none of what it was spent on — units, assets, tasks and people each hang
 * off a join table of their own, so they are tabs on the expense's page, and the
 * same links show from the other end on each of those records' pages.
 *
 * The `all…` reads the link forms pick from are declared here rather than
 * imported, for the reason unit-links.ts and task-links.ts give: pulling the
 * registries they live in back into this file would be a cycle.
 */

const ALL_ASSETS = gql`
  query allAssets {
    allAssets {
      id
      name
    }
  }
`;

const ALL_UNITS = gql`
  query allUnits {
    allUnits {
      id
      name
    }
  }
`;

const ALL_TASKS = gql`
  query allTasks {
    allTasks {
      id
      name
    }
  }
`;

const ALL_BIO_DATA = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

/** A required select over another registry, keyed by `id` like every core table. */
const refSelect = (key: string, label: string, lookup: LookupModule): FieldConfig => ({
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

const ALL_BUDGETS_FOR_EXPENSE = gql`
  query allBudgets {
    allBudgets {
      id
      name
    }
  }
`;

/** In the order a reader asks: what it came out of, where it went, on what work. */
const EXPENSE_LINKS: EntityLinkConfig[] = [
  {
    entity: 'ExpenseBudget',
    byOwnerQuery: 'expenseBudgetsByExpense',
    ownerArg: 'expenseUid',
    targetArg: 'budgetUid',
    field: 'budget',
    label: 'Budget',
    pluralLabel: 'Budgets',
    icon: 'wallet',
    permission: 'EXPENSE_BUDGET',
    optionsQuery: ALL_BUDGETS_FOR_EXPENSE,
  },
  {
    entity: 'UnitExpense',
    byOwnerQuery: 'unitExpensesByExpense',
    ownerArg: 'expenseUid',
    targetArg: 'unitUid',
    field: 'unit',
    label: 'Unit',
    pluralLabel: 'Units',
    icon: 'domain',
    permission: 'UNIT_EXPENSE',
    optionsQuery: ALL_UNITS,
  },
  {
    entity: 'ExpenseAsset',
    byOwnerQuery: 'expenseAssetsByExpense',
    ownerArg: 'expenseUid',
    targetArg: 'assetUid',
    field: 'asset',
    label: 'Asset',
    pluralLabel: 'Assets',
    icon: 'shop',
    permission: 'EXPENSE_ASSET',
    optionsQuery: ALL_ASSETS,
  },
  {
    entity: 'TaskExpense',
    byOwnerQuery: 'taskExpensesByExpense',
    ownerArg: 'expenseUid',
    targetArg: 'taskUid',
    field: 'task',
    label: 'Task',
    pluralLabel: 'Tasks',
    icon: 'assignment',
    permission: 'TASK_EXPENSE',
    optionsQuery: ALL_TASKS,
  },
  {
    entity: 'BioDataExpense',
    byOwnerQuery: 'bioDataExpensesByExpense',
    ownerArg: 'expenseUid',
    targetArg: 'bioDataUid',
    field: 'bioData',
    label: 'Person',
    pluralLabel: 'People',
    icon: 'person',
    permission: 'BIO_DATA_EXPENSE',
    optionsQuery: ALL_BIO_DATA,
    // A person has no assigned number, so the default triple does not apply.
    targetGqlFields: `
    id
    uid: id
    name
  `,
    columns: ['index', 'bioData.name as Person', 'actions'],
  },
];

export const EXPENSE = defineLookup({
  slug: 'expenses',
  entity: 'Expense',
  entityPlural: 'Expenses',
  permission: 'EXPENSE',
  label: 'Expense',
  pluralLabel: 'Expenses',
  subtitle: 'Money spent — what on, when, how much and in which currency',
  icon: 'receipt',
  extraGqlFields: `
  expenseDate
  amount
  subcategory { ${lookupRefGqlFields} }
  currency { ${lookupRefGqlFields} }
`,
  extraFields: [
    {
      key: 'expenseDate',
      label: 'Expense Date',
      hint: 'When the money was spent, not when it is recorded',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    // numeric(50,2), and the table checks it is above zero.
    {
      key: 'amount',
      label: 'Amount',
      hint: 'Greater than zero',
      type: FieldType.decimal,
      decimals: 2,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('currencyUid', 'Currency', CURRENCY),
    refSelect('subcategoryUid', 'Subcategory', SUBCATEGORY),
  ],
  extraColumns: [
    { field: 'expenseDate', header: 'Date' },
    'amount',
    'currency.name as Currency',
    'subcategory.name as Subcategory',
  ],
  /** The record comes back with the references nested; the form edits their ids. */
  toModel: (data) => ({
    currencyUid: data?.currency?.id,
    subcategoryUid: data?.subcategory?.id,
  }),
  extraContents: (comp, record) => entityLinkPanels(comp, EXPENSE_LINKS, record?.id),
});

export const EXPENSE_LOOKUPS: LookupModule[] = [EXPENSE];

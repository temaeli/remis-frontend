import { DocumentNode, gql } from '@apollo/client/core';

import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import {
  audit,
  money,
  queries,
  ref,
  SearchColumn,
  SearchPage,
  SearchTable,
  statusLabel,
} from '../billing/billing-search/billing-search.config';
import { priorityLabel } from './priorities';

/**
 * The project, expense and status tables the DBA listed on 2026-11-04, searched
 * one column at a time on the same Search screen as billing. Each column is one
 * `findBy…` / `countBy…` pair on the backend.
 */

const named = `id uid: id name assignedNumber`;

/** The lists the link columns pick from. */
const OPTIONS: Record<string, DocumentNode> = {
  people: gql`query allBioData { allBioData { id uid: id name } }`,
  projects: gql`query allRegistryProjects { allRegistryProjects { ${named} } }`,
  projectSubcategories: gql`query allProjectSubcategories { allProjectSubcategories { ${named} } }`,
  expenses: gql`query allExpenses { allExpenses { ${named} } }`,
  tasks: gql`query allTasks { allTasks { ${named} } }`,
  units: gql`query allUnits { allUnits { ${named} } }`,
  subcategories: gql`query allSubcategories { allSubcategories { ${named} } }`,
  positions: gql`query allPositions { allPositions { ${named} } }`,
  currencies: gql`query allCurrencies { allCurrencies { ${named} } }`,
};

/**
 * The audit block and the three descriptive columns. `numberKey` is the
 * backend's name for the number column: ASSIGNED_NUMBER on projects,
 * ASSIGNED_CODE where the table calls it assigned_code.
 */
const namedColumns = (table: string, numberKey: string): SearchColumn[] => [
  { value: 'ID', label: `${table} id`, kind: 'uuid' },
  { value: 'CREATED_AT', label: 'Created date', kind: 'range' },
  { value: 'CREATED_BY', label: 'Created by', kind: 'uuid', options: 'people' },
  { value: numberKey, label: 'Assigned number', kind: 'text' },
  { value: 'NAME', label: 'Name', kind: 'text' },
  { value: 'DESCRIPTION', label: 'Description', kind: 'text' },
  { value: 'ACTIVE', label: 'Active', kind: 'bool' },
  { value: 'IS_DELETED', label: 'Deleted', kind: 'bool' },
];

const statusColumn: GridKeyColumn = {
  field: 'status',
  header: 'Status',
  valueFn: (r) => statusLabel(r?.status),
};

const PROJECTS: SearchTable = {
  key: 'projects',
  label: 'Projects',
  permissions: ['ROLE_VIEW_ALL_PROJECT', 'ROLE_VIEW_PROJECT'],
  ...queries(
    'registryProjectsBy',
    'countRegistryProjectsBy',
    'RegistryProjectSearchField',
    `${audit}
    assignedNumber
    name
    description
    days
    startedAt
    endedAt
    projectSubcategory { ${ref} }`,
  ),
  columns: [
    ...namedColumns('Project', 'ASSIGNED_NUMBER'),
    { value: 'DAYS', label: 'Days', kind: 'number' },
    { value: 'STARTED_AT', label: 'Start date', kind: 'range' },
    { value: 'ENDED_AT', label: 'End date', kind: 'range' },
    {
      value: 'PROJECT_SUBCATEGORY',
      label: 'Project subcategory',
      kind: 'uuid',
      options: 'projectSubcategories',
    },
  ],
  keyColumns: [
    'index',
    'assignedNumber as Number',
    'name',
    'projectSubcategory.name as Subcategory',
    { field: 'days', header: 'Days', type: 'number' },
    { field: 'startedAt', header: 'Starts', type: 'dateTime' },
    { field: 'endedAt', header: 'Ends', type: 'dateTime' },
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

const PROJECT_PEOPLE: SearchTable = {
  key: 'project-people',
  label: 'Project Team',
  permissions: ['ROLE_VIEW_ALL_PROJECT_PERSON', 'ROLE_VIEW_PROJECT_PERSON'],
  ...queries(
    'projectPeopleBy',
    'countProjectPeopleBy',
    'ProjectPersonSearchField',
    `${audit}
    assignedNumber
    name
    description
    project { ${ref} }
    person { ${ref} }
    position { ${ref} }`,
  ),
  columns: [
    ...namedColumns('Team member', 'ASSIGNED_CODE'),
    { value: 'PROJECT', label: 'Project', kind: 'uuid', options: 'projects' },
    { value: 'BIO_DATA', label: 'Person', kind: 'uuid', options: 'people' },
    { value: 'POSITION', label: 'Position', kind: 'uuid', options: 'positions' },
  ],
  keyColumns: [
    'index',
    'project.name as Project',
    'person.name as Person',
    'position.name as Position',
    'name',
    { field: 'createdAt', header: 'Created', type: 'dateTime' },
  ],
};

const PROJECT_STATUSES: SearchTable = {
  key: 'project-statuses',
  label: 'Project Statuses',
  permissions: ['ROLE_VIEW_ALL_PROJECT_STATUS_CHANGE', 'ROLE_VIEW_PROJECT_STATUS_CHANGE'],
  ...queries(
    'projectStatusChangesBy',
    'countProjectStatusChangesBy',
    'ProjectStatusChangeSearchField',
    `id
    uid: id
    status
    changeDay
    project { ${ref} }`,
  ),
  columns: [
    { value: 'ID', label: 'Status row id', kind: 'uuid' },
    { value: 'PROJECT', label: 'Project', kind: 'uuid', options: 'projects' },
    { value: 'STATUS', label: 'Status', kind: 'status' },
    { value: 'CHANGE_DAY', label: 'Change date', kind: 'range' },
  ],
  keyColumns: [
    'index',
    'project.name as Project',
    statusColumn,
    { field: 'changeDay', header: 'Changed', type: 'dateTime' },
  ],
};

const PROJECT_PRIORITIES: SearchTable = {
  key: 'project-priorities',
  label: 'Project Priorities',
  permissions: ['ROLE_VIEW_ALL_PROJECT_PRIORITY', 'ROLE_VIEW_PROJECT_PRIORITY'],
  ...queries(
    'projectPrioritiesBy',
    'countProjectPrioritiesBy',
    'ProjectPrioritySearchField',
    `id
    uid: id
    priority
    project { ${ref} }`,
  ),
  columns: [
    { value: 'ID', label: 'Priority row id', kind: 'uuid' },
    { value: 'PROJECT', label: 'Project', kind: 'uuid', options: 'projects' },
    { value: 'PRIORITY', label: 'Priority', kind: 'priority' },
  ],
  keyColumns: [
    'index',
    'project.name as Project',
    { field: 'priority', header: 'Priority', valueFn: (r) => priorityLabel(r?.priority) },
  ],
};

const EXPENSES: SearchTable = {
  key: 'expenses',
  label: 'Expenses',
  permissions: ['ROLE_VIEW_ALL_EXPENSE', 'ROLE_VIEW_EXPENSE'],
  ...queries(
    'expensesBy',
    'countExpensesBy',
    'ExpenseSearchField',
    `${audit}
    assignedNumber
    name
    description
    expenseDate
    amount
    currency { ${ref} }
    subcategory { ${ref} }`,
  ),
  columns: [
    ...namedColumns('Expense', 'ASSIGNED_CODE'),
    { value: 'SUBCATEGORY', label: 'Subcategory', kind: 'uuid', options: 'subcategories' },
    { value: 'EXPENSE_DATE', label: 'Expense date', kind: 'range' },
    { value: 'AMOUNT', label: 'Amount', kind: 'number' },
    { value: 'CURRENCY', label: 'Currency', kind: 'uuid', options: 'currencies' },
  ],
  keyColumns: [
    'index',
    'assignedNumber as Number',
    'name',
    'subcategory.name as Subcategory',
    { field: 'amount', header: 'Amount', valueFn: (r) => money(r?.amount) },
    'currency.name as Currency',
    { field: 'expenseDate', header: 'Date', type: 'dateTime' },
  ],
};

const PROJECT_EXPENSES: SearchTable = {
  key: 'project-expenses',
  label: 'Project Expenses',
  permissions: ['ROLE_VIEW_ALL_PROJECT_EXPENSE', 'ROLE_VIEW_PROJECT_EXPENSE'],
  ...queries(
    'projectExpensesBy',
    'countProjectExpensesBy',
    'ProjectExpenseSearchField',
    `id
    uid: id
    project { ${ref} }
    expense { ${ref} assignedNumber amount }`,
  ),
  columns: [
    { value: 'ID', label: 'Link id', kind: 'uuid' },
    { value: 'PROJECT', label: 'Project', kind: 'uuid', options: 'projects' },
    { value: 'EXPENSE', label: 'Expense', kind: 'uuid', options: 'expenses' },
  ],
  keyColumns: [
    'index',
    'project.name as Project',
    'expense.assignedNumber as Expense Number',
    'expense.name as Expense',
    { field: 'expense.amount', header: 'Amount', valueFn: (r) => money(r?.expense?.amount) },
  ],
};

const TASK_EXPENSES: SearchTable = {
  key: 'task-expenses',
  label: 'Task Expenses',
  permissions: ['ROLE_VIEW_ALL_TASK_EXPENSE', 'ROLE_VIEW_TASK_EXPENSE'],
  ...queries(
    'taskExpensesBy',
    'countTaskExpensesBy',
    'TaskExpenseSearchField',
    `id
    uid: id
    task { ${ref} }
    expense { ${ref} assignedNumber amount }`,
  ),
  columns: [
    { value: 'ID', label: 'Link id', kind: 'uuid' },
    { value: 'TASK', label: 'Task', kind: 'uuid', options: 'tasks' },
    { value: 'EXPENSE', label: 'Expense', kind: 'uuid', options: 'expenses' },
  ],
  keyColumns: [
    'index',
    'task.name as Task',
    'expense.assignedNumber as Expense Number',
    'expense.name as Expense',
    { field: 'expense.amount', header: 'Amount', valueFn: (r) => money(r?.expense?.amount) },
  ],
};

const TASK_STATUSES: SearchTable = {
  key: 'task-statuses',
  label: 'Task Statuses',
  permissions: ['ROLE_VIEW_ALL_TASK_STATUS_CHANGE', 'ROLE_VIEW_TASK_STATUS_CHANGE'],
  ...queries(
    'taskStatusChangesBy',
    'countTaskStatusChangesBy',
    'TaskStatusChangeSearchField',
    `id
    uid: id
    status
    since
    task { ${ref} }`,
  ),
  columns: [
    { value: 'ID', label: 'Status row id', kind: 'uuid' },
    { value: 'TASK', label: 'Task', kind: 'uuid', options: 'tasks' },
    { value: 'STATUS', label: 'Status', kind: 'status' },
    { value: 'SINCE', label: 'Since', kind: 'range' },
  ],
  keyColumns: [
    'index',
    'task.name as Task',
    statusColumn,
    { field: 'since', header: 'Since', type: 'dateTime' },
  ],
};

const UNIT_STATUSES: SearchTable = {
  key: 'unit-statuses',
  label: 'Unit Statuses',
  permissions: ['ROLE_VIEW_ALL_UNIT_STATUS_CHANGE', 'ROLE_VIEW_UNIT_STATUS_CHANGE'],
  ...queries(
    'unitStatusChangesBy',
    'countUnitStatusChangesBy',
    'UnitStatusChangeSearchField',
    `id
    uid: id
    status
    since
    unit { ${ref} }`,
  ),
  columns: [
    { value: 'ID', label: 'Status row id', kind: 'uuid' },
    { value: 'UNIT', label: 'Unit', kind: 'uuid', options: 'units' },
    { value: 'STATUS', label: 'Status', kind: 'status' },
    { value: 'SINCE', label: 'Since', kind: 'range' },
  ],
  keyColumns: [
    'index',
    'unit.name as Unit',
    statusColumn,
    { field: 'since', header: 'Since', type: 'dateTime' },
  ],
};

/** The nine tables, in the order the page offers them. */
export const PROJECT_SEARCH_TABLES: SearchTable[] = [
  PROJECTS,
  PROJECT_PEOPLE,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  EXPENSES,
  PROJECT_EXPENSES,
  TASK_EXPENSES,
  TASK_STATUSES,
  UNIT_STATUSES,
];

export const PROJECT_SEARCH_PAGE: SearchPage = {
  title: 'Project Search',
  subtitle: 'Find projects, team members, statuses, priorities and expenses by any one column',
  tables: PROJECT_SEARCH_TABLES,
  options: OPTIONS,
};

/** Anyone who may search at least one of the tables may open the page. */
export const PROJECT_SEARCH_PERMISSIONS = [
  ...new Set(PROJECT_SEARCH_TABLES.flatMap((t) => t.permissions)),
];

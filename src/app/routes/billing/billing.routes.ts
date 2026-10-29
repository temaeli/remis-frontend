import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';
import { matchRoute } from '@shared/components/view-component/view.helpers';

import { BILL_CONFIGURATION_LOOKUPS } from './bill-lookups';
import { EXPENSE_LOOKUPS } from './expense-lookups';
import { CHARGE_LOOKUPS } from './charge-lookups';
import { BILL_RAISE_PERMISSIONS, BILL_VIEW_PERMISSIONS } from './bill.form';
import { PAYMENT_VIEW_PERMISSIONS } from './payment.form';
import { BILL_ITEMS_REPORT_PERMISSIONS } from './bill-items-report.graphql';
import { permissionGuard } from '../auth/permission.guard';

export const BILLING_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'bills',
    pathMatch: 'full',
  },

  // The bills themselves.
  {
    path: 'bills',
    data: {
      isMenu: true,
      name: 'Bills',
      icon: 'bill',
      permissions: BILL_VIEW_PERMISSIONS,
    },
    loadComponent: () => import('./bills.component').then((m) => m.BillsComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'bills', 'uid'),
    data: { name: 'Bill' },
    loadComponent: () => import('./bill.component').then((m) => m.BillComponent),
  },

  /**
   * What has been paid, as GePG reports it.
   *
   * A screen rather than a lookup: payments are written from a callback, not by
   * a clerk, so there is nothing to add or edit — and the backend exposes
   * transactions and totals through queries of their own rather than the five a
   * lookup config expects.
   */
  {
    path: 'payments',
    data: {
      isMenu: true,
      name: 'Payments',
      icon: 'coins',
      permissions: PAYMENT_VIEW_PERMISSIONS,
    },
    loadComponent: () => import('./payments.component').then((m) => m.PaymentsComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'payments', 'uid'),
    data: { name: 'Payment' },
    loadComponent: () => import('./payment.component').then((m) => m.PaymentComponent),
  },

  /**
   * Reconciliation, which is neither a bill nor a payment: it names a date and
   * a service provider group, and the statement covers every bill paid that
   * day. It sat as a button on the payments screen, which made a day's
   * reconciliation look like something you did to a payment.
   */
  {
    path: 'reconciliation',
    data: {
      isMenu: true,
      name: 'Reconciliation',
      icon: 'money_exchange',
      permissions: PAYMENT_VIEW_PERMISSIONS,
    },
    loadComponent: () =>
      import('./reconciliation.component').then((m) => m.ReconciliationComponent),
  },

  /**
   * Bill items with their bill, status, control number and payments, read from
   * the DBA's report function. Its own permission, so the report can be given
   * without the bill screens.
   */
  {
    path: 'bill-items-report',
    canActivate: [permissionGuard],
    data: {
      isMenu: true,
      name: 'Bill Items Report',
      icon: 'reports',
      permissions: BILL_ITEMS_REPORT_PERMISSIONS,
    },
    loadComponent: () =>
      import('./bill-items-report.component').then((m) => m.BillItemsReportComponent),
  },

  /**
   * Raising a bill is its own screen rather than a modal: it carries a header, a
   * bill and any number of items, with the amounts recomputing as they are
   * chosen, which is more than a dialog can hold.
   */
  {
    path: 'raise',
    data: {
      isMenu: true,
      name: 'Raise Bill',
      icon: 'add',
      permissions: BILL_RAISE_PERMISSIONS,
    },
    loadComponent: () => import('./raise-bill.component').then((m) => m.RaiseBillComponent),
  },

  /**
   * Money spent. A lookup rather than a screen of its own: one named record with
   * a date, an amount and a currency, and everything it was spent on hangs off
   * join tables shown as tabs on its page.
   */
  ...lookupRoutes(EXPENSE_LOOKUPS),

  // Amounts due on a date, applied to units — the other side of expenses.
  ...lookupRoutes(CHARGE_LOOKUPS),

  // Bill headers are lookup-shaped, so they render from a config like the rest.
  {
    path: 'configurations',
    data: {
      isMenu: true,
      name: 'Configurations',
      icon: 'settings',
    },
    children: [
      { path: '', redirectTo: 'bill-headers', pathMatch: 'full' },
      ...lookupRoutes(BILL_CONFIGURATION_LOOKUPS),
    ],
  },
];

export default BILLING_ROUTES;

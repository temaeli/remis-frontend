import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';
import { matchRoute } from '@shared/components/view-component/view.helpers';

import { BILL_CONFIGURATION_LOOKUPS } from './bill-lookups';
import { BILL_RAISE_PERMISSIONS, BILL_VIEW_PERMISSIONS } from './bill.form';

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

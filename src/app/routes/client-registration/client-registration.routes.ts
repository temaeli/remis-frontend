import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const CLIENT_REGISTRATION_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    data: {
      isMenu: true,
      name: 'Dashboard',
      icon: 'dashboard',
      visibleFor: ['internal'],
      permissions: ['VIEW_GAS_DASHBOARD'],
    },
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'clients',
    data: { isMenu: true, name: 'Customers', icon: 'users', visibleFor: ['internal'] },
    loadComponent: () => import('./customers/clients').then((m) => m.Clients),
  },
  {
    matcher: (url) => matchRoute(url, 'clients', 'clientUid'),
    loadComponent: () => import('./customers/client.component').then((m) => m.ClientComponent),
  },
  {
    path: 'settings',
    data: {
      isMenu: true,
      name: 'Configuration',
      visibleFor: ['internal'],
      icon: 'settings',
    },
    children: [
      {
        path: 'customer-categories',
        data: {
          isMenu: true,
          name: 'Customer Categories',
          icon: 'file',
          permissions: ['ROLE_VIEW_ALL_CUSTOMER_CATEGORY'],
        },
        loadComponent: () =>
          import('./customers-categories/customers-categories').then((m) => m.CustomerCategories),
      },
      {
        path: 'gas-installation',
        data: {
          isMenu: true,
          name: 'Zones',
          icon: 'zone',
          permissions: ['ROLE_VIEW_ALL_GAS_INSTALLATION'],
        },
        loadComponent: () =>
          import('./customers/gas-installation/gas-installation').then((m) => m.GasInstallation),
      },
    ],
  },
];

export default CLIENT_REGISTRATION_ROUTES;

import { TypedRoutes } from '@core';

export const NOTIFICATIONS_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    data: { isMenu: true, name: 'Dashboard', icon: 'dashboard' },
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'emails',
    title: 'Emails',
    data: { isMenu: true, name: 'Emails', icon: 'email' },
    loadComponent: () => import('./emails/emails').then((m) => m.Emails),
  },
];

export default NOTIFICATIONS_ROUTES;

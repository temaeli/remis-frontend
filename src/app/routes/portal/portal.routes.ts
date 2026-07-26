import { TypedRoutes } from '@core';

export const PORTAL_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
    data: {
      name: 'My Nominations',
    },
  },

  {
    path: 'dashboard',
    data: {
      isMenu: true,
      name: 'Dashboard',
      icon: 'dashboard',
      visibleFor: ['external'],
    },
    loadComponent: () =>
      import('./dashboard/portal-dashboard').then((m) => m.PortalDashboardComponent),
  },

  {
    path: 'profile',
    data: { isMenu: true, name: 'My Profile', icon: 'user', visibleFor: ['external'] },
    loadComponent: () => import('../user/profile/profile').then((m) => m.ProfileComp),
  },

  {
    path: 'my-nominations',
    data: {
      isMenu: true,
      name: 'My Nominations',
      icon: 'natural_gas',
      visibleFor: ['external'],
    },
    loadComponent: () =>
      import('../gas-nomination/my-gas-nominations/my-gas-nominations').then((m) => m.External),
  },
];

export default PORTAL_ROUTES;

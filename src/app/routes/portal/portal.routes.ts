import { TypedRoutes } from '@core';

/**
 * The external user's menu. Placeholders for now: the dashboard and the list
 * of the user's applications, to be filled in as the external processes are
 * built.
 */
export const PORTAL_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    data: { isMenu: true, name: 'Dashboard', icon: 'dashboard', visibleFor: ['external'] },
    loadComponent: () =>
      import('./dashboard/portal-dashboard').then((m) => m.PortalDashboard),
  },
  {
    path: 'applications',
    data: { isMenu: true, name: 'Applications', icon: 'assignment', visibleFor: ['external'] },
    loadComponent: () =>
      import('./applications/portal-applications').then((m) => m.PortalApplications),
  },
];

export default PORTAL_ROUTES;

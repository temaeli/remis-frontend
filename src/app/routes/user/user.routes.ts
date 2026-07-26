import { TypedRoutes } from '@core';

export const USER_ROUTES: TypedRoutes = [
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
    path: 'profile',
    data: { isMenu: true, name: 'My Profile', icon: 'user' },
    loadComponent: () => import('./profile/profile').then((m) => m.ProfileComp),
  },
];

export default USER_ROUTES;

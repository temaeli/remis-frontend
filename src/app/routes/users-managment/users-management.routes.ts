import { TypedRoutes } from '@core';

export const USERS_MANAGEMENT_ROUTES: TypedRoutes = [
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
    path: 'users',
    data: { isMenu: true, name: 'users', icon: 'suitcase' },
    loadComponent: () => import('./users/users').then((m) => m.Users),
  },
  {
    path: 'users/:uid',
    data: { isMenu: false, name: 'User Details' },
    loadComponent: () => import('./users/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'roles',
    data: { isMenu: true, name: 'Roles', icon: 's-give' },
    loadComponent: () => import('./roles/roles').then((m) => m.Roles),
  },
  {
    path: 'roles/:uid',
    data: { isMenu: false, name: 'Role Permissions' },
    loadComponent: () =>
      import('./roles/role-permission-assignment/role-permission-assignment').then(
        (m) => m.RolePermissionAssignment,
      ),
  },
];

export default USERS_MANAGEMENT_ROUTES;

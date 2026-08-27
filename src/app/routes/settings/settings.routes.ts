import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

import { lookupRoutes } from '@shared/lookup';
import {
  BILLING_LOOKUPS,
  GENERAL_LOOKUPS,
  LOCATION_LOOKUPS,
  REFERENCE_LOOKUPS,
} from './settings-lookups';
import { PROJECT_SETTING_LOOKUPS } from './project-setting-lookups';
import { AGREEMENT_SETTING_LOOKUPS } from './agreement-setting-lookups';
import { UNIT_SETTING_LOOKUPS } from './unit-setting-lookups';

/**
 * Grouped the way the backend groups `modules.setting`: access control (uaa),
 * general configuration, locations, reference data, billing and project. Each
 * group is a componentless parent — the children render in the module's existing
 * outlet.
 *
 * A group declares no permissions of its own only where every child is gated;
 * MenuService then aggregates the children's, so the group appears when a user
 * can reach at least one of them. Where a group holds an ungated child, it
 * carries an empty list instead, which keeps it visible for everyone rather than
 * hiding the ungated screens behind its gated siblings' permissions.
 */
export const SETTINGS_ROUTES: TypedRoutes = [
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

  // Access Control — the uaa package: who may sign in and what they may do.
  {
    path: 'access-control',
    data: {
      isMenu: true,
      name: 'Access Control',
      icon: 'users',
      permissions: [],
    },
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },

      // Users Management
      {
        path: 'users',
        data: { isMenu: true, name: 'Users', icon: 'suitcase' },
        loadComponent: () => import('../users-managment/users/users').then((m) => m.Users),
      },
      {
        path: 'users/:uid',
        data: { isMenu: false, name: 'User Details' },
        loadComponent: () =>
          import('../users-managment/users/user.component').then((m) => m.UserComponent),
      },

      // Roles Management
      {
        path: 'roles',
        data: { isMenu: true, name: 'Roles', icon: 's-give' },
        loadComponent: () => import('../users-managment/roles/roles').then((m) => m.Roles),
      },
      {
        path: 'roles/:uid',
        data: { isMenu: false, name: 'Role Permissions' },
        loadComponent: () =>
          import('../users-managment/roles/role-permission-assignment/role-permission-assignment').then(
            (m) => m.RolePermissionAssignment,
          ),
      },
    ],
  },

  // General — the general package: configuration that is not access control.
  {
    path: 'general',
    data: {
      isMenu: true,
      name: 'General',
      icon: 'settings',
      permissions: [],
    },
    children: [
      { path: '', redirectTo: 'business-names', pathMatch: 'full' },
      ...lookupRoutes(GENERAL_LOOKUPS),

      // System Settings
      {
        path: 'system-settings',
        data: { isMenu: true, name: 'System Settings', icon: 'settings' },
        loadComponent: () =>
          import('./system-settings/system-settings.component').then(
            (m) => m.SystemSettingsComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'system-settings', 'uid'),
        loadComponent: () =>
          import('./system-settings/system-setting.component').then(
            (m) => m.SystemSettingComponent,
          ),
      },
    ],
  },

  // Locations — the location package: the administrative hierarchy.
  {
    path: 'locations',
    data: {
      isMenu: true,
      name: 'Locations',
      icon: 'location',
      permissions: [],
    },
    children: [
      { path: '', redirectTo: 'regions', pathMatch: 'full' },
      ...lookupRoutes(LOCATION_LOOKUPS),
    ],
  },

  // Reference — the data costing and valuation share.
  {
    path: 'reference-data',
    data: {
      isMenu: true,
      name: 'Reference Data',
      icon: 'database',
    },
    children: [
      { path: '', redirectTo: 'countries', pathMatch: 'full' },
      ...lookupRoutes(REFERENCE_LOOKUPS),
    ],
  },

  // Billing — the GePG configuration. The bill header, detail and item tables are
  // operational and do not belong here.
  {
    path: 'billing',
    data: {
      isMenu: true,
      name: 'Billing',
      icon: 'billing',
    },
    children: [
      { path: '', redirectTo: 'bank-accounts', pathMatch: 'full' },
      ...lookupRoutes(BILLING_LOOKUPS),
    ],
  },

  // Project — the setting.project package: what a project is planned, measured
  // and built in. The register itself, and the taxonomy that classifies it, are
  // operational and stay in the project management module.
  {
    path: 'project',
    data: {
      isMenu: true,
      name: 'Project',
      icon: 'suitcase',
    },
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      ...lookupRoutes(PROJECT_SETTING_LOOKUPS),
    ],
  },

  // Unit — the setting.unit package: the unit itself and the rates and
  // catalogues it is charged and judged against. What happens to a unit is
  // operational and lives in the unit management module.
  {
    path: 'unit',
    data: {
      isMenu: true,
      name: 'Unit',
      icon: 'domain',
    },
    children: [
      { path: '', redirectTo: 'units', pathMatch: 'full' },
      ...lookupRoutes(UNIT_SETTING_LOOKUPS),
    ],
  },

  // Agreement — the setting.agreement package: the reusable text an agreement is
  // written from. The agreements themselves, and the taxonomy that classifies
  // them, are operational and live in the agreement module.
  {
    path: 'agreement',
    data: {
      isMenu: true,
      name: 'Agreement',
      icon: 'description',
    },
    children: [
      { path: '', redirectTo: 'sections', pathMatch: 'full' },
      ...lookupRoutes(AGREEMENT_SETTING_LOOKUPS),
    ],
  },
];

export default SETTINGS_ROUTES;

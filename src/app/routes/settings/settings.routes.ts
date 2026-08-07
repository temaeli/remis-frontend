import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

import { coreLookupRoutes } from './core-lookups/core-lookup.routes';
import { BILLING_LOOKUPS, REFERENCE_LOOKUPS } from './core-lookups/core-lookups';

/**
 * Grouped the way the backend groups `modules.setting`: access control (uaa),
 * general configuration, locations, reference data and billing. Each group is a
 * componentless parent — the children render in the module's existing outlet.
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

      // Business Names — organisations on the register, held in remis_core_schema
      {
        path: 'business-names',
        data: {
          isMenu: true,
          name: 'Business Names',
          icon: 'suitcase',
          permissions: ['ROLE_VIEW_ALL_BUSINESS_NAME', 'ROLE_VIEW_BUSINESS_NAME'],
        },
        loadComponent: () =>
          import('./business-names/business-names.component').then((m) => m.BusinessNamesComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'business-names', 'uid'),
        loadComponent: () =>
          import('./business-names/business-name.component').then((m) => m.BusinessNameComponent),
      },

      // Identity Types — how business names and people are identified
      {
        path: 'identity-types',
        data: {
          isMenu: true,
          name: 'Identity Types',
          icon: 's-settings',
          permissions: ['ROLE_VIEW_ALL_IDENTITY_TYPE', 'ROLE_VIEW_IDENTITY_TYPE'],
        },
        loadComponent: () =>
          import('./identity-types/identity-types.component').then((m) => m.IdentityTypesComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'identity-types', 'uid'),
        loadComponent: () =>
          import('./identity-types/identity-type.component').then((m) => m.IdentityTypeComponent),
      },

      // Departments Management
      {
        path: 'departments',
        data: { isMenu: true, name: 'Departments', icon: 'suitcase' },
        loadComponent: () =>
          import('./departments/departments.component').then((m) => m.DepartmentsComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'departments', 'departmentUid'),
        loadComponent: () =>
          import('./departments/department.component').then((m) => m.DepartmentComponent),
      },

      // Designations Management
      {
        path: 'designations',
        data: { isMenu: true, name: 'Designations', icon: 's-settings' },
        loadComponent: () =>
          import('./designations/designations.component').then((m) => m.DesignationsComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'designations', 'uid'),
        loadComponent: () =>
          import('./designations/designation.component').then((m) => m.DesignationComponent),
      },

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

      // Report Templates
      // {
      //   path: 'report-template',
      //   data: { isMenu: true, name: 'Report Templates', icon: 'report' },
      //   loadComponent: () =>
      //     import('./report-template/report-templates.component').then(
      //       (m) => m.ReportTemplatesComponent,
      //     ),
      // },
      // {
      //   matcher: (url) => matchRoute(url, 'report-template', 'reportTemplateUid'),
      //   loadComponent: () =>
      //     import('./report-template/report-template.component').then(
      //       (m) => m.ReportTemplateComponent,
      //     ),
      // },
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

      // Regions Management, and the districts and wards beneath them
      {
        path: 'regions',
        data: { isMenu: true, name: 'Regions', icon: 'map' },
        loadComponent: () => import('./regions/regions.component').then((m) => m.RegionsComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'regions', 'regionUid'),
        loadComponent: () => import('./regions/region.component').then((m) => m.RegionComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'districts', 'districtUid'),
        loadComponent: () =>
          import('./regions/district/district.component').then((m) => m.DistrictComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'wards', 'wardUid'),
        loadComponent: () => import('./regions/ward/ward.component').then((m) => m.WardComponent),
      },
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
      ...coreLookupRoutes(REFERENCE_LOOKUPS),
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
      ...coreLookupRoutes(BILLING_LOOKUPS),
    ],
  },

  // Notifications
  {
    path: 'notifications-dashboard',
    data: { isMenu: true, name: 'Notifications', icon: 'comment' },
    loadComponent: () => import('../notifications/dashboard/dashboard').then((m) => m.Dashboard),
  },
];

export default SETTINGS_ROUTES;

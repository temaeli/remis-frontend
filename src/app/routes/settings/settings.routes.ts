import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

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
  //     import('./report-template/report-template.component').then((m) => m.ReportTemplateComponent),
  // },


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

  // Regions Management
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

  // Notifications
  {
    path: 'notifications-dashboard',
    data: { isMenu: true, name: 'Notifications', icon: 'comment' },
    loadComponent: () => import('../notifications/dashboard/dashboard').then((m) => m.Dashboard),
  },


  // System Settings
  {
    path: 'system-settings',
    data: { isMenu: true, name: 'System Settings', icon: 'settings' },
    loadComponent: () =>
      import('./system-settings/system-settings.component').then((m) => m.SystemSettingsComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'system-settings', 'uid'),
    loadComponent: () =>
      import('./system-settings/system-setting.component').then((m) => m.SystemSettingComponent),
  },
];

export default SETTINGS_ROUTES;

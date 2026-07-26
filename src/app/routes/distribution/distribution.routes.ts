import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const DISTRIBUTION_ROUTES: TypedRoutes = [
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
      permissions: ['ROLE_VIEW_ALL_DISTRIBUTION_REPORT', 'ROLE_VIEW_DISTRIBUTION_REPORT'],
    },
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
   {
    path: 'cng-stations',
    data: {
      isMenu: true,
      name: 'CNG Stations',
      icon: 'work_station',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_ALL_CNG_STATION', 'ROLE_VIEW_CNG_STATION'],
    },
    loadComponent: () =>
      import('./cng-station-management/cng-stations-list').then((m) => m.CngStationsComponent),
  },

  {
    path: 'cng-daily-reports',
    data: {
      isMenu: true,
      name: 'CNG Daily Reports',
      icon: 'report',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_ALL_CNG_REPORT', 'ROLE_VIEW_CNG_REPORT'],
    },
    loadComponent: () =>
      import('./cng-daily-report/cng-daily-reports').then((m) => m.CngDailyReportsComponent),
  },

  {
    path: 'distribution-weekly-report',
    data: {
      isMenu: true,
      name: 'CNG Weekly Reports',
      icon: 'report',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_ALL_DISTRIBUTION_REPORT', 'ROLE_VIEW_DISTRIBUTION_REPORT'],
    },
    loadComponent: () =>
      import('./distribution-weekly-report/distribution-weekly-report').then(
        (m) => m.DistributionWeeklyReport,
      ),
  },


  {
    path: 'cng-monthly-reports',
    data: {
      isMenu: true,
      name: 'CNG Monthly Reports',
      icon: 'report',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_ALL_CNG_MONTHLY_REPORT', 'ROLE_VIEW_CNG_MONTHLY_REPORT'],
    },
    loadComponent: () =>
      import('./cng-monthly-report/cng-monthly-reports-list.component').then(
        (m) => m.CngMonthlyReportsComponent,
      ),
  },

    {
    path: 'network',
    data: {
      isMenu: true,
      name: 'Distribution Network',
      icon: 'network',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_ALL_DISTRIBUTION_REPORT', 'ROLE_VIEW_DISTRIBUTION_REPORT'],
    },
    loadComponent: () =>
      import('./network/distribution-network').then((m) => m.DistributionNetworkPage),
  },


  {
    path: 'settings',
    data: {
      isMenu: true,
      name: 'Settings',
      visibleFor: ['internal'],
      icon: 'settings',
    },
    children: [
      {
        path: 'cng-lookups',
        data: {
          isMenu: true,
          name: 'Equipment Tye & Units',
          icon: 'build',
          permissions: ['ROLE_VIEW_ALL_CNG_LOOKUP', 'ROLE_VIEW_CNG_LOOKUP'],
        },
        loadComponent: () =>
          import('./cng-station-management/cng-lookup-management').then(
            (m) => m.CngLookupManagementComponent,
          ),
      },
    ],
  },

  {
    matcher: (url) => matchRoute(url, 'cng-daily-report', 'uid'),
    loadComponent: () =>
      import('./cng-daily-report/cng-daily-report').then((m) => m.CngDailyReportComponent),
  },

  {
    matcher: (url) => matchRoute(url, 'distribution-weekly-report', 'weeklyReportUid'),
    loadComponent: () =>
      import('./distribution-weekly-report/distribution-weekly-report-detail.component').then(
        (m) => m.DistributionWeeklyReportDetailComponent,
      ),
  },

  {
    matcher: (url) => matchRoute(url, 'cng-monthly-report', 'cngMonthlyReportUid'),
    loadComponent: () =>
      import('./cng-monthly-report/cng-monthly-report-detail.component').then(
        (m) => m.CngMonthlyReportDetailComponent,
      ),
  },

  {
    matcher: (url) => matchRoute(url, 'cng-stations', 'cngStationUid'),
    loadComponent: () =>
      import('./cng-station-management/cng-station-detail.component').then(
        (m) => m.CngStationDetailComponent,
      ),
  },

];

export default DISTRIBUTION_ROUTES;

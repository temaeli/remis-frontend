import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const REPORTS_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'my-reports',
    pathMatch: 'full',
  },
  {
    path: 'ewura',
    data: {
      isMenu: true,
      name: 'EWURA Reports',
      icon: 'report',
      permissions: ['ROLE_VIEW_EWURA_REPORT'],
    },
    loadComponent: () => import('./ewura/ewura-reports').then((m) => m.EwuraReports),
  },
  {
    path: 'my-reports',
    data: {
      isMenu: true,
      name: 'My Reports',
      icon: 'inbox',
      permissions: ['ROLE_VIEW_EWURA_REPORT'],
    },
    loadComponent: () => import('./ewura/my-reports').then((m) => m.EwuraMyReports),
  },
  {
    path: 'hse',
    data: {
      isMenu: true,
      name: 'HSE Reports',
      icon: 'report',
      permissions: ['ROLE_VIEW_HSE_REPORT'],
    },
    loadComponent: () => import('./hse/hse-reports').then((m) => m.HseReports),
  },
  {
    path: 'hse-my-reports',
    data: {
      isMenu: true,
      name: 'HSE My Reports',
      icon: 'inbox',
      permissions: ['ROLE_VIEW_HSE_REPORT'],
    },
    loadComponent: () => import('./hse/my-reports').then((m) => m.HseMyReports),
  },
  {
    matcher: (url) => matchRoute(url, 'ewura', 'reportUid'),
    data: { permissions: ['ROLE_VIEW_EWURA_REPORT'] },
    loadComponent: () =>
      import('./ewura/ewura-report-detail.component').then((m) => m.EwuraReportDetailComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'hse', 'reportUid'),
    data: { permissions: ['ROLE_VIEW_HSE_REPORT'] },
    loadComponent: () =>
      import('./hse/hse-report-detail.component').then((m) => m.HseReportDetailComponent),
  },
];

export default REPORTS_ROUTES;

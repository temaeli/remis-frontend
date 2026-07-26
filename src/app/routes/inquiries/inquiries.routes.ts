import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const INQUIRIES_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    data: { isMenu: true, name: 'Dashboard', icon: 'dashboard' },
    loadComponent: () =>
      import('./inquiries-dashboard/inquiries-dashboard').then((m) => m.InquiriesDashboard),
  },

  // ---inquiries---
  {
    path: 'inquiries',
    data: {
      isMenu: true,
      name: 'Feedback / Complaints',
      icon: 'inquiry',
      permissions: ['ROLE_VIEW_INQUIRY', 'ROLE_VIEW_ALL_INQUIRY'],
    },
    loadComponent: () =>
      import('./inquiries/inquiries.component').then((m) => m.InquiriesComponent),
  },

  {
    matcher: (url) => matchRoute(url, 'inquiries', 'inquiryUid'),
    data: { permissions: ['ROLE_VIEW_INQUIRY'] },
    loadComponent: () => import('./inquiries/inquiry.component').then((m) => m.InquiryComponent),
  },
];

export default INQUIRIES_ROUTES;

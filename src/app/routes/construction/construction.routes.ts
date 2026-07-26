import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const CONSTRUCTION_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'project-registration',
    pathMatch: 'full',
  },
  {
    path: 'project-registration',
    data: {
      isMenu: true,
      name: 'Construction Registration',
      icon: 'hammer',
      visibleFor: ['internal'],
      expanded: true,
    },
    children: [
      {
        path: 'construction-projects',
        data: {
          isMenu: true,
          name: 'Project Registration',
          icon: 'hammer',
          permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_PROJECT', 'ROLE_VIEW_CONSTRUCTION_PROJECT'],
        },
        loadComponent: () =>
          import('./construction-projects/construction-projects').then(
            (m) => m.ConstructionProjects,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'construction-projects', 'constructionProjectUid'),
        loadComponent: () =>
          import('./construction-projects/construction-project-detail.component').then(
            (m) => m.ConstructionProjectDetailComponent,
          ),
      },
    ],
  },

  {
    path: 'consultant-works',
    data: {
      isMenu: true,
      name: 'Consultant Works',
      icon: 'category',
      visibleFor: ['internal'],
      expanded: true,
    },
    children: [
      {
        path: '',
        data: {
          isMenu: true,
          name: 'Project Registration',
          icon: 'category',
          permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_CATEGORY', 'ROLE_VIEW_CONSTRUCTION_CATEGORY'],
        },
        loadComponent: () =>
          import('./construction-projects/consultant-works/consultant-works').then(
            (m) => m.ConsultantWorks,
          ),
      },
    ],
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
        path: 'contractors',
        data: {
          isMenu: true,
          name: 'Contractors',
          icon: 'briefcase',
          permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_CONTRACTOR', 'ROLE_VIEW_CONSTRUCTION_CONTRACTOR'],
        },
        loadComponent: () =>
          import('./construction-projects/contractors/contractors').then((m) => m.Contractors),
      },
    ],
  },

  {
    matcher: (url) => matchRoute(url, 'daily-site-reports', 'reportUid'),
    loadComponent: () =>
      import('./construction-projects/daily-reports/construction-daily-report-detail.component').then(
        (m) => m.ConstructionDailyReportDetailComponent,
      ),
  },
];

export default CONSTRUCTION_ROUTES;

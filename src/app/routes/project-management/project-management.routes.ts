import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';

import { permissionGuard } from '../auth/permission.guard';
import { PROJECT_SEARCH_PAGE, PROJECT_SEARCH_PERMISSIONS } from './project-search.config';

import {
  PROJECT_CONFIGURATION_LOOKUPS,
  PROJECT_LOOKUPS,
  PROJECT_PAGE_ONLY_LOOKUPS,
} from './project-lookups';
import {
  ACTIVITY,
  DELIVERABLE,
  MILESTONE,
  MITIGATION,
  PHASE,
  RISK,
  SITE,
  SNAG,
  TASK,
  TIMELINE,
} from '@routes/settings/project-setting-lookups';

/**
 * The lists a project's work is planned and linked against, kept here as well
 * as under Settings → Project: the same screens and the same rows.
 */
const PROJECT_PLANNING_LOOKUPS = [TASK, ACTIVITY, DELIVERABLE, MILESTONE, PHASE, SITE, TIMELINE];

const PROJECT_RISK_LOOKUPS = [RISK, MITIGATION, SNAG];

export const PROJECT_MANAGEMENT_ROUTES: TypedRoutes = [
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

  // The register itself — projects, the links between them, their costs and plans.
  ...lookupRoutes(PROJECT_LOOKUPS),

  /**
   * Search the project, expense and status tables by one column — the DBA's
   * findBy… and countBy… methods. The billing Search screen, given this
   * module's tables; only tables the user may read are offered.
   */
  {
    path: 'search',
    canActivate: [permissionGuard],
    data: {
      isMenu: true,
      name: 'Search',
      icon: 'search',
      permissions: PROJECT_SEARCH_PERMISSIONS,
      searchPage: PROJECT_SEARCH_PAGE,
    },
    loadComponent: () =>
      import('../billing/billing-search/billing-search.component').then(
        (m) => m.BillingSearchComponent,
      ),
  },

  // The team and the links between projects: reached from the project page only.
  ...lookupRoutes(PROJECT_PAGE_ONLY_LOOKUPS).map((route) => ({
    ...route,
    data: { ...route.data, isMenu: false },
  })),

  /**
   * Reference data that classifies the register. Grouped behind one menu and kept
   * last, so the operational screens above lead.
   *
   * The parent declares no permissions of its own: MenuService aggregates the
   * children's, so the group appears when a user can reach at least one of them.
   *
   * Componentless — the children render in the module's existing outlet.
   */
  {
    path: 'configurations',
    data: {
      isMenu: true,
      name: 'Configurations',
      icon: 'settings',
    },
    children: [
      { path: '', redirectTo: 'project-categories', pathMatch: 'full' },
      ...lookupRoutes(PROJECT_CONFIGURATION_LOOKUPS),
      {
        path: 'planning',
        data: { isMenu: true, name: 'Planning', icon: 'calendar' },
        children: [
          { path: '', redirectTo: 'tasks', pathMatch: 'full' },
          ...lookupRoutes(PROJECT_PLANNING_LOOKUPS),
        ],
      },
      {
        path: 'risk-management',
        data: { isMenu: true, name: 'Risks', icon: 'warning' },
        children: [
          { path: '', redirectTo: 'risks', pathMatch: 'full' },
          ...lookupRoutes(PROJECT_RISK_LOOKUPS),
        ],
      },
    ],
  },
];

export default PROJECT_MANAGEMENT_ROUTES;

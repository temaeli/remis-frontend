import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';

import { PROJECT_CONFIGURATION_LOOKUPS, PROJECT_LOOKUPS } from './project-lookups';

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
    ],
  },
];

export default PROJECT_MANAGEMENT_ROUTES;

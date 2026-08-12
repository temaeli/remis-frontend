import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';

import { AGREEMENT_CONFIGURATION_LOOKUPS, AGREEMENT_LOOKUPS } from './agreement-lookups';

export const AGREEMENT_MANAGEMENT_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'agreements',
    pathMatch: 'full',
  },

  // The register itself.
  ...lookupRoutes(AGREEMENT_LOOKUPS),

  /**
   * The taxonomy that classifies the register. Grouped behind one menu and kept
   * last, so the operational screen above leads — the same shape the project and
   * asset modules use.
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
      { path: '', redirectTo: 'agreement-categories', pathMatch: 'full' },
      ...lookupRoutes(AGREEMENT_CONFIGURATION_LOOKUPS),
    ],
  },
];

export default AGREEMENT_MANAGEMENT_ROUTES;

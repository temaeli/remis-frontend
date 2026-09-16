import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';

import { ASSET_CONFIGURATION_LOOKUPS, ASSET_LOOKUPS } from './asset-lookups';

export const ASSET_MANAGEMENT_ROUTES: TypedRoutes = [
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

  // The register itself — assets, the registrations against them, their verifications.
  ...lookupRoutes(ASSET_LOOKUPS),

  // Every registered parcel on one map, drawn from the boundaries the database
  // builds out of each registration's corners.
  {
    path: 'plots-map',
    data: {
      isMenu: true,
      name: 'Plots Map',
      icon: 'map',
      permissions: ['ROLE_VIEW_ALL_LAND_REGISTRATION', 'ROLE_VIEW_LAND_REGISTRATION'],
    },
    loadComponent: () => import('./parcels-map.component').then((m) => m.ParcelsMapComponent),
  },

  /**
   * Reference data that classifies the registry. Grouped behind one menu and kept
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
      { path: '', redirectTo: 'asset-types', pathMatch: 'full' },
      ...lookupRoutes(ASSET_CONFIGURATION_LOOKUPS),
    ],
  },
];

export default ASSET_MANAGEMENT_ROUTES;

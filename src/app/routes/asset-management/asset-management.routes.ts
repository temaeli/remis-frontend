import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';

import { ASSET_CONFIGURATION_LOOKUPS, ASSET_LOOKUPS, ASSET_RECORD_LOOKUPS } from './asset-lookups';

/**
 * The record lists' detail routes, at this level as well as under Records.
 *
 * A tab on an asset's page opens a record at assets/<id>/<slug>/<id>, which only
 * a detail route at this level can match. Under Records alone, every View on
 * those tabs would lead nowhere.
 */
const recordDetailRoutes = () =>
  lookupRoutes(ASSET_RECORD_LOOKUPS).filter((route) => !!route.matcher);

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

  // The register itself. Everything recorded against an asset is done from the
  // asset's own page.
  ...lookupRoutes(ASSET_LOOKUPS),
  ...recordDetailRoutes(),

  // Every registered parcel on one map, drawn from the boundaries the database
  // builds out of each registration's corners. Off the menu: each asset's Land
  // tab has its own map. Still reachable at /plots-map.
  {
    path: 'plots-map',
    data: {
      isMenu: false,
      name: 'Plots Map',
      icon: 'map',
      permissions: ['ROLE_VIEW_ALL_LAND_REGISTRATION', 'ROLE_VIEW_LAND_REGISTRATION'],
    },
    loadComponent: () => import('./parcels-map.component').then((m) => m.ParcelsMapComponent),
  },

  /**
   * Every land registration, verification, acquisition, disposal, valuation and
   * connection across all assets. Off the menu: all of it is done and seen from
   * the asset's own page. The lists are still reachable at /records/<slug>.
   */
  {
    path: 'records',
    data: {
      isMenu: false,
      name: 'Records',
      icon: 'list',
    },
    children: [
      { path: '', redirectTo: 'land-registrations', pathMatch: 'full' },
      ...lookupRoutes(ASSET_RECORD_LOOKUPS),
    ],
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

import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';
import { LAND_PARCEL_VIEW_PERMISSIONS } from './land-parcel/land-parcel.form';
import {
  ASSET_CATEGORY_VIEW_PERMISSIONS,
  ASSET_SUBCATEGORY_VIEW_PERMISSIONS,
  ASSET_TYPE_VIEW_PERMISSIONS,
  ASSET_VERIFICATION_VIEW_PERMISSIONS,
  ASSET_VIEW_PERMISSIONS,
  LAND_REGISTRATION_VIEW_PERMISSIONS,
} from './asset-registry.form';

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

  // Assets — the operational entity
  {
    path: 'assets',
    data: {
      isMenu: true,
      name: 'Assets',
      icon: 'suitcase',
      permissions: ASSET_VIEW_PERMISSIONS,
    },
    loadComponent: () => import('./asset/assets.component').then((m) => m.AssetsComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'assets', 'uid'),
    loadComponent: () => import('./asset/asset.component').then((m) => m.AssetComponent),
  },

  // Land Registrations
  {
    path: 'land-registrations',
    data: {
      isMenu: true,
      name: 'Land Registrations',
      icon: 'land_administration',
      permissions: LAND_REGISTRATION_VIEW_PERMISSIONS,
    },
    loadComponent: () =>
      import('./land-registration/land-registrations.component').then(
        (m) => m.LandRegistrationsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'land-registrations', 'uid'),
    loadComponent: () =>
      import('./land-registration/land-registration.component').then(
        (m) => m.LandRegistrationComponent,
      ),
  },

  // Asset Verifications
  {
    path: 'asset-verifications',
    data: {
      isMenu: true,
      name: 'Asset Verifications',
      icon: 'check',
      permissions: ASSET_VERIFICATION_VIEW_PERMISSIONS,
    },
    loadComponent: () =>
      import('./asset-verification/asset-verifications.component').then(
        (m) => m.AssetVerificationsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'asset-verifications', 'uid'),
    loadComponent: () =>
      import('./asset-verification/asset-verification.component').then(
        (m) => m.AssetVerificationComponent,
      ),
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

      // Asset Types — top of the classification hierarchy
      {
        path: 'asset-types',
        data: {
          isMenu: true,
          name: 'Asset Types',
          icon: 'category',
          permissions: ASSET_TYPE_VIEW_PERMISSIONS,
        },
        loadComponent: () =>
          import('./asset-type/asset-types.component').then((m) => m.AssetTypesComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'asset-types', 'uid'),
        loadComponent: () =>
          import('./asset-type/asset-type.component').then((m) => m.AssetTypeComponent),
      },

      // Asset Categories
      {
        path: 'asset-categories',
        data: {
          isMenu: true,
          name: 'Asset Categories',
          icon: 'list',
          permissions: ASSET_CATEGORY_VIEW_PERMISSIONS,
        },
        loadComponent: () =>
          import('./asset-category/asset-categories.component').then(
            (m) => m.AssetCategoriesComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'asset-categories', 'uid'),
        loadComponent: () =>
          import('./asset-category/asset-category.component').then((m) => m.AssetCategoryComponent),
      },

      // Asset Subcategories
      {
        path: 'asset-subcategories',
        data: {
          isMenu: true,
          name: 'Asset Subcategories',
          icon: 'list',
          permissions: ASSET_SUBCATEGORY_VIEW_PERMISSIONS,
        },
        loadComponent: () =>
          import('./asset-subcategory/asset-subcategories.component').then(
            (m) => m.AssetSubcategoriesComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'asset-subcategories', 'uid'),
        loadComponent: () =>
          import('./asset-subcategory/asset-subcategory.component').then(
            (m) => m.AssetSubcategoryComponent,
          ),
      },

      // Land Parcels — pre-existing screens backed by the project module's own API,
      // not the asset registry. Unrelated to the land-registrations screen above.
      {
        path: 'land-parcels',
        data: {
          isMenu: true,
          name: 'Land Parcels',
          icon: 'map',
          permissions: LAND_PARCEL_VIEW_PERMISSIONS,
        },
        loadComponent: () =>
          import('./land-parcel/land-parcels.component').then((m) => m.LandParcelsComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'land-parcels', 'landParcelUid'),
        loadComponent: () =>
          import('./land-parcel/land-parcel.component').then((m) => m.LandParcelComponent),
      },
    ],
  },
];

export default ASSET_MANAGEMENT_ROUTES;

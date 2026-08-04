import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';
import { LAND_PARCEL_VIEW_PERMISSIONS } from './land-parcel/land-parcel.form';

export const LAND_MANAGEMENT_ROUTES: TypedRoutes = [
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

  // Land Parcels Management
  {
    path: 'land-parcels',
    data: {
      isMenu: true,
      name: 'Land Parcels',
      icon: 'land_administration',
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
];

export default LAND_MANAGEMENT_ROUTES;

import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';
import { UNIT } from '@routes/settings/unit-setting-lookups';

import { UNIT_LOOKUPS } from './unit-lookups';

/**
 * The record lists' detail routes, at this level as well as under Records.
 *
 * A tab on a unit's page opens a record at units/<id>/<slug>/<id>, which only a
 * detail route at this level can match. Under Records alone, every View on
 * those tabs would lead nowhere.
 */
const recordDetailRoutes = () => lookupRoutes(UNIT_LOOKUPS).filter((route) => !!route.matcher);

/**
 * The unit module — `modules.unit` on the backend.
 *
 * Opens on the units themselves: everything that happens to a unit —
 * reserving, booking, leasing, inspecting, ending a tenancy — is done from the
 * unit's own page, with the unit already chosen. The unit is still defined
 * under Settings → Project as well.
 *
 * The record lists stay, grouped under Records, for looking across units.
 */
export const UNIT_MANAGEMENT_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'units',
    pathMatch: 'full',
  },

  ...lookupRoutes([UNIT]),
  ...recordDetailRoutes(),

  /**
   * Every reservation, booking, lease and the rest across all units. Grouped
   * behind one menu entry, so the menu leads with the units. The parent
   * declares no permissions: MenuService aggregates the children's.
   */
  {
    path: 'records',
    data: {
      isMenu: true,
      name: 'Records',
      icon: 'list',
    },
    children: [
      { path: '', redirectTo: 'reservations', pathMatch: 'full' },
      ...lookupRoutes(UNIT_LOOKUPS),
    ],
  },
];

export default UNIT_MANAGEMENT_ROUTES;

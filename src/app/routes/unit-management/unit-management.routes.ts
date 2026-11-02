import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';
import { UNIT } from '@routes/settings/unit-setting-lookups';

import { UNIT_LOOKUPS } from './unit-lookups';

/**
 * Each record's own page — a booking, a lease, an inspection — with no list or
 * menu entry of its own.
 *
 * Records are made from a unit's page only, so each one belongs to a unit; a
 * list of them across units, with its own Create, made records that belonged
 * to none. What remains is the page a record opens on, which the unit's
 * History tab and panels lead to at units/<id>/<slug>/<id>.
 */
const recordDetailRoutes = () => lookupRoutes(UNIT_LOOKUPS).filter((route) => !!route.matcher);

/**
 * The unit module — `modules.unit` on the backend.
 *
 * Opens on the units themselves: everything that happens to a unit —
 * reserving, booking, leasing, inspecting, connecting a service, ending a
 * tenancy — is done from the unit's own page, with the unit already chosen.
 * The unit is still defined under Settings → Project as well.
 */
export const UNIT_MANAGEMENT_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'units',
    pathMatch: 'full',
  },

  ...lookupRoutes([UNIT]),
  ...recordDetailRoutes(),
];

export default UNIT_MANAGEMENT_ROUTES;

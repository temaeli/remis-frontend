import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';

import { UNIT_LOOKUPS } from './unit-lookups';

/**
 * The unit module — `modules.unit` on the backend.
 *
 * Every screen here is one of the records that hangs off a unit. The unit itself
 * is not among them: it is a settings catalogue row and stays under Settings →
 * Project, where the link panels declared in `unit-links.ts` are attached to it.
 *
 * No dashboard of its own yet, so the module lands on reservations — the first
 * thing that happens to a unit.
 */
export const UNIT_MANAGEMENT_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'reservations',
    pathMatch: 'full',
  },

  ...lookupRoutes(UNIT_LOOKUPS),
];

export default UNIT_MANAGEMENT_ROUTES;

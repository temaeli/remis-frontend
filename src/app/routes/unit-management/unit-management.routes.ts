import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';
import {
  COMMISSION,
  NOTICE_DAY,
  PENALTY,
  RENT,
  RENT_BILLING_CYCLE,
  RESERVATION_MINUTE,
  SECURITY_DEPOSIT,
  SOLUTION,
  UNIT,
  UNIT_SHARE,
} from '@routes/settings/unit-setting-lookups';
import {
  BOOLEAN_PARAMETER,
  BOOLEAN_PARAMETER_VALUE,
  CHECKLIST,
  GRADE,
  QUALITATIVE_PARAMETER,
  QUALITATIVE_PARAMETER_VALUE,
  QUANTITATIVE_PARAMETER,
  QUANTITATIVE_PARAMETER_VALUE,
  SERVICE_OFFERING,
} from '@routes/settings/project-setting-lookups';

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
 * The lists a unit's "Link to…" picks from, kept here as well as under
 * Settings → Unit and Settings → Project: the same screens and the same rows.
 */
const UNIT_CHARGE_LOOKUPS = [
  RENT,
  COMMISSION,
  PENALTY,
  SECURITY_DEPOSIT,
  NOTICE_DAY,
  RENT_BILLING_CYCLE,
  RESERVATION_MINUTE,
];

const UNIT_ASSESSMENT_LOOKUPS = [
  BOOLEAN_PARAMETER,
  BOOLEAN_PARAMETER_VALUE,
  QUALITATIVE_PARAMETER,
  QUALITATIVE_PARAMETER_VALUE,
  QUANTITATIVE_PARAMETER,
  QUANTITATIVE_PARAMETER_VALUE,
  CHECKLIST,
  GRADE,
];

const UNIT_OTHER_LOOKUPS = [UNIT_SHARE, SOLUTION, SERVICE_OFFERING];

/** A menu group inside Configurations; componentless, so it renders in the module's outlet. */
const group = (path: string, name: string, icon: string, lookups: typeof UNIT_OTHER_LOOKUPS) => ({
  path,
  data: { isMenu: true, name, icon },
  children: [
    { path: '', redirectTo: lookups[0].slug, pathMatch: 'full' as const },
    ...lookupRoutes(lookups),
  ],
});

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

  /**
   * What a unit is charged, assessed and linked against. Kept last, so the units
   * lead; the group shows when the user can reach at least one of its lists.
   */
  {
    path: 'configurations',
    data: { isMenu: true, name: 'Configurations', icon: 'settings' },
    children: [
      { path: '', redirectTo: 'charges', pathMatch: 'full' },
      group('charges', 'Charges', 'money', UNIT_CHARGE_LOOKUPS),
      group('assessment', 'Assessment', 'assignment', UNIT_ASSESSMENT_LOOKUPS),
      group('other', 'Other', 'settings', UNIT_OTHER_LOOKUPS),
    ],
  },
];

export default UNIT_MANAGEMENT_ROUTES;

import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

import { LookupModule } from './lookup.interface';

/**
 * The list and detail routes for a set of lookup tables.
 *
 * Both point at the same pair of generic components and identify themselves by
 * slug in `data.lookup`; only the list route shows in the menu.
 */
export const lookupRoutes = (lookups: LookupModule[]): TypedRoutes =>
  lookups.flatMap((lookup) => [
    {
      path: lookup.slug,
      data: {
        isMenu: true,
        name: lookup.pluralLabel,
        icon: lookup.icon,
        lookup: lookup.slug,
        permissions: lookup.viewPermissions,
      },
      loadComponent: () => import('./lookups.component').then((m) => m.LookupsComponent),
    },
    {
      matcher: (url) => matchRoute(url, lookup.slug, 'uid'),
      data: { name: lookup.label, lookup: lookup.slug },
      loadComponent: () => import('./lookup.component').then((m) => m.LookupComponent),
    },
  ]);

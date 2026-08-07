import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

import { CoreLookupModule } from './core-lookup.interface';

/**
 * The list and detail routes for a set of lookup tables.
 *
 * Both point at the same pair of generic components and identify themselves by
 * slug in `data.lookup`; only the list route shows in the menu.
 */
export const coreLookupRoutes = (lookups: CoreLookupModule[]): TypedRoutes =>
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
      loadComponent: () => import('./core-lookups.component').then((m) => m.CoreLookupsComponent),
    },
    {
      matcher: (url) => matchRoute(url, lookup.slug, 'uid'),
      data: { name: lookup.label, lookup: lookup.slug },
      loadComponent: () => import('./core-lookup.component').then((m) => m.CoreLookupComponent),
    },
  ]);

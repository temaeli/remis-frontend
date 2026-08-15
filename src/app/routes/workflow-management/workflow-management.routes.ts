import { TypedRoutes } from '@core';
import { lookupRoutes } from '@shared/lookup';

import {
  WORKFLOW_CONFIGURATION_LOOKUPS,
  WORKFLOW_EXECUTION_LOOKUPS,
  WORKFLOW_LOOKUPS,
} from './workflow-lookups';

/**
 * The workflow module — `modules.workflow` on the backend.
 *
 * Three groups, in the order someone actually works through them: the routes
 * themselves, then what each route is built from, then the trail of what has been
 * done on one.
 *
 * The module lands on the definitions, since nothing below them means anything
 * until a route exists.
 */
export const WORKFLOW_MANAGEMENT_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'workflow-definitions',
    pathMatch: 'full',
  },

  // The routes themselves.
  ...lookupRoutes(WORKFLOW_LOOKUPS),

  // The trail. Kept out of the configuration group below: reading what happened
  // is a different job from drawing the route, and usually a different person.
  ...lookupRoutes(WORKFLOW_EXECUTION_LOOKUPS),

  /**
   * What a route is built from. Grouped behind one menu and kept last, so the
   * operational screens above lead — the same shape the agreement, project and
   * asset modules use.
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
      { path: '', redirectTo: 'workflow-steps', pathMatch: 'full' },
      ...lookupRoutes(WORKFLOW_CONFIGURATION_LOOKUPS),
    ],
  },
];

export default WORKFLOW_MANAGEMENT_ROUTES;

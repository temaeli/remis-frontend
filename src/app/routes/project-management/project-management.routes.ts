import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';
import {
  COST_TYPE_VIEW_PERMISSIONS,
  COST_VIEW_PERMISSIONS,
  MASTER_PLAN_VIEW_PERMISSIONS,
  PROJECT_CATEGORY_VIEW_PERMISSIONS,
  PROJECT_CONNECTION_VIEW_PERMISSIONS,
  PROJECT_SUBCATEGORY_VIEW_PERMISSIONS,
  PROJECT_VIEW_PERMISSIONS,
} from './project-registry.form';

export const PROJECT_MANAGEMENT_ROUTES: TypedRoutes = [
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

  // Projects — the central register
  {
    path: 'projects',
    data: {
      isMenu: true,
      name: 'Projects',
      icon: 'suitcase',
      permissions: PROJECT_VIEW_PERMISSIONS,
    },
    loadComponent: () =>
      import('./project/projects.component').then((m) => m.RegistryProjectsComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'projects', 'uid'),
    loadComponent: () =>
      import('./project/project.component').then((m) => m.RegistryProjectComponent),
  },

  // Project Connections — the project-to-project graph
  {
    path: 'project-connections',
    data: {
      isMenu: true,
      name: 'Project Connections',
      icon: 's-give',
      permissions: PROJECT_CONNECTION_VIEW_PERMISSIONS,
    },
    loadComponent: () =>
      import('./project-connection/project-connections.component').then(
        (m) => m.ProjectConnectionsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'project-connections', 'uid'),
    loadComponent: () =>
      import('./project-connection/project-connection.component').then(
        (m) => m.ProjectConnectionComponent,
      ),
  },

  // Costs
  {
    path: 'costs',
    data: { isMenu: true, name: 'Costs', icon: 'notes', permissions: COST_VIEW_PERMISSIONS },
    loadComponent: () => import('./cost/costs.component').then((m) => m.CostsComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'costs', 'uid'),
    loadComponent: () => import('./cost/cost.component').then((m) => m.CostComponent),
  },

  // Master Plans
  {
    path: 'master-plans',
    data: {
      isMenu: true,
      name: 'Master Plans',
      icon: 'map',
      permissions: MASTER_PLAN_VIEW_PERMISSIONS,
    },
    loadComponent: () =>
      import('./master-plan/master-plans.component').then((m) => m.RegistryMasterPlansComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'master-plans', 'uid'),
    loadComponent: () =>
      import('./master-plan/master-plan.component').then((m) => m.RegistryMasterPlanComponent),
  },

  /**
   * Reference data that classifies the register. Grouped behind one menu and kept
   * last, so the operational screens above lead.
   *
   * The parent declares no permissions of its own: MenuService aggregates the
   * children's, so the group appears when a user can reach at least one of them.
   */
  {
    path: 'configurations',
    data: {
      isMenu: true,
      name: 'Configurations',
      icon: 'settings',
    },
    children: [
      { path: '', redirectTo: 'project-categories', pathMatch: 'full' },

      {
        path: 'project-categories',
        data: {
          isMenu: true,
          name: 'Project Categories',
          icon: 'category',
          permissions: PROJECT_CATEGORY_VIEW_PERMISSIONS,
        },
        loadComponent: () =>
          import('./project-category/project-categorys.component').then(
            (m) => m.ProjectCategorysComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'project-categories', 'uid'),
        loadComponent: () =>
          import('./project-category/project-category.component').then(
            (m) => m.ProjectCategoryComponent,
          ),
      },

      {
        path: 'project-subcategories',
        data: {
          isMenu: true,
          name: 'Project Subcategories',
          icon: 'list',
          permissions: PROJECT_SUBCATEGORY_VIEW_PERMISSIONS,
        },
        loadComponent: () =>
          import('./project-subcategory/project-subcategorys.component').then(
            (m) => m.ProjectSubcategorysComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'project-subcategories', 'uid'),
        loadComponent: () =>
          import('./project-subcategory/project-subcategory.component').then(
            (m) => m.ProjectSubcategoryComponent,
          ),
      },

      {
        path: 'cost-types',
        data: {
          isMenu: true,
          name: 'Cost Types',
          icon: 'list',
          permissions: COST_TYPE_VIEW_PERMISSIONS,
        },
        loadComponent: () =>
          import('./cost-type/cost-types.component').then((m) => m.CostTypesComponent),
      },
      {
        matcher: (url) => matchRoute(url, 'cost-types', 'uid'),
        loadComponent: () =>
          import('./cost-type/cost-type.component').then((m) => m.CostTypeComponent),
      },
    ],
  },
];

export default PROJECT_MANAGEMENT_ROUTES;

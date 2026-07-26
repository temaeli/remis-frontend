import { TypedRoutes } from '@core';

export const GAS_NOMINATION_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
    data: {
      name: 'Gas Nomination',
      permissions: ['VIEW_GAS_DASHBOARD'],
    },
  },

  {
    path: 'dashboard',
    data: {
      isMenu: true,
      name: 'Dashboard',
      icon: 'dashboard',
      visibleFor: ['internal'],
      permissions: ['VIEW_GAS_DASHBOARD'],
    },
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },

  {
    path: 'workflows',
    data: {
      isMenu: true,
      name: 'Workflows',
      icon: 'workflow',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_GAS_NOMINATION'],
    },
    loadComponent: () => import('./workflows').then((m) => m.WorkflowsComponent),
  },

  {
    path: 'nominations',
    data: {
      isMenu: true,
      name: 'Nominations',
      icon: 'natural_gas',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_GAS_NOMINATION'],
    },
    loadComponent: () => import('./nominations/nominations').then((m) => m.Internal),
  },

  {
    path: 'assigned',
    data: {
      isMenu: true,
      name: 'Assigned Nominations',
      icon: 'assigned_placement',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_GAS_NOMINATION'],
    },
    loadComponent: () =>
      import('./my-gas-nominations/assigned-gas-nominations').then((m) => m.Assigned),
  },

  {
    path: 'gas-sales-agreement',
    data: {
      isMenu: true,
      name: 'Gas Sales Agreement',
      icon: 'sales',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_GAS_SALES_AGREEMENT'],
    },
    loadComponent: () =>
      import('./gas-sales-agreement/gas-sales-agreement').then((m) => m.GasSalesAgreement),
  },

  {
    path: 'anticipated-productions',
    data: {
      isMenu: true,
      name: 'Anticipated Production',
      icon: 'factory',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_ANTICIPATED_PRODUCTION', 'ROLE_VIEW_ALL_ANTICIPATED_PRODUCTION'],
    },
    loadComponent: () =>
      import('./anticipated-productions/anticipated-productions').then(
        (m) => m.AnticipatedProductions,
      ),
  },

  {
    path: 'gas-sales-agreement/:uid',
    data: {
      name: 'Gas Sales Agreement Details',
    },
    loadComponent: () =>
      import('./gas-sales-agreement/gsa-detail.component').then(
        (m) => m.GsaDetailComponent
      ),
  },

  {
    path: 'gas-sales-agreement/:uid/addendums',
    data: {
      name: 'Addendums',
    },
    loadComponent: () =>
      import('./gas-sales-agreement/gsa-addendums.component').then(
        (m) => m.GsaAddendumComponent
      ),
  },

  {
    path: 'nomination-batches/:batchUid',
    data: {
      name: 'Nomination Batch Details',
    },
    loadComponent: () =>
      import('./nomination-batches/nomination-batch-detail.component').then(
        (m) => m.NominationBatchDetailComponent
      ),
  },

  {
    path: 'plant-nominations/:nominationUid',
    data: {
      name: 'Plant Nomination Details',
    },
    loadComponent: () =>
      import('./nominations/plant-nomination-detail.component').then(
        (m) => m.PlantNominationDetailComponent
      ),
  },
];

export default GAS_NOMINATION_ROUTES;

import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const HSE_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'workflows',
    pathMatch: 'full',
  },

  // ---workflows (SRS reference)---
  {
    path: 'workflows',
    data: { isMenu: true, name: 'Workflows', icon: 'workflow' },
    loadComponent: () =>
      import('./hse/workflows/hse-workflows.component').then((m) => m.HseWorkflowsComponent),
  },

  // ---incidents---
  {
    path: 'incidents',
    data: { isMenu: true, name: 'Incidents', icon: 'warning' },
    loadComponent: () => import('./hse/incidents/incidents').then((m) => m.Incidents),
  },

  // ---trainings---
  {
    path: 'trainings',
    data: {
      isMenu: true,
      name: 'HSE Trainings',
      icon: 'education',
      permissions: ['ROLE_VIEW_HSE_TRAINING'],
    },
    loadComponent: () => import('./hse/trainings/trainings').then((m) => m.HseTrainings),
  },

  // ---meetings---
  {
    path: 'meetings',
    data: {
      isMenu: true,
      name: 'HSE Meetings',
      icon: 'comments',
      permissions: ['ROLE_VIEW_HSE_MEETING'],
    },
    loadComponent: () => import('./hse/meetings/meetings').then((m) => m.HseMeetings),
  },

  // ---drills---
  {
    path: 'drills',
    data: {
      isMenu: true,
      name: 'HSE Drills',
      icon: 'helmet',
      permissions: ['ROLE_VIEW_HSE_DRILL'],
    },
    loadComponent: () => import('./hse/drills/drills').then((m) => m.HseDrills),
  },

  // ---inspection-plans---
  {
    path: 'inspection-plans',
    data: {
      isMenu: true,
      name: 'Inspection Plans',
      icon: 'inspect',
      permissions: ['ROLE_VIEW_INSPECTION_PLAN'],
    },
    loadComponent: () =>
      import('./hse/inspection-plans/inspection-plans').then((m) => m.InspectionPlans),
  },

  // ---environment-management (daily logs grouped)---
  {
    path: '',
    data: {
      name: 'Environment Management',
      icon: 'eco',
      isMenu: true,
      permissions: [
        'ROLE_VIEW_EMISSION_LOG',
        'ROLE_VIEW_WATER_USAGE',
        'ROLE_VIEW_ENERGY_USAGE',
        'ROLE_VIEW_WASTE_GENERATION_LOG',
      ],
    },
    children: [
      {
        path: 'emission-logs',
        data: {
          isMenu: true,
          name: 'Emissions',
          icon: 'cloud_download',
          permissions: ['ROLE_VIEW_EMISSION_LOG'],
        },
        loadComponent: () =>
          import('./hse/emission-logs/emission-logs').then((m) => m.EmissionLogs),
      },
      {
        path: 'water-usages',
        data: {
          isMenu: true,
          name: 'Water Usage',
          icon: 'water',
          permissions: ['ROLE_VIEW_WATER_USAGE'],
        },
        loadComponent: () =>
          import('./hse/water-usages/water-usages').then((m) => m.WaterUsages),
      },
      {
        path: 'energy-usages',
        data: {
          isMenu: true,
          name: 'Energy Usage',
          icon: 'flash',
          permissions: ['ROLE_VIEW_ENERGY_USAGE'],
        },
        loadComponent: () =>
          import('./hse/energy-usages/energy-usages').then((m) => m.EnergyUsages),
      },
      {
        path: 'waste-generation-logs',
        data: {
          isMenu: true,
          name: 'Waste Generation',
          icon: 'delete',
          permissions: ['ROLE_VIEW_WASTE_GENERATION_LOG'],
        },
        loadComponent: () =>
          import('./hse/waste-generation-logs/waste-generation-logs').then(
            (m) => m.WasteGenerationLogs,
          ),
      },
    ],
  },

  // ---hse-reports--- (sits just before Configurations)
  // FLOW ->  OFFICER - SHIFT SUPERVISOR - SUPERINTENDENT - PLANT MANAGER
  {
    path: 'hse-reports',
    data: {
      isMenu: true,
      name: 'HSE Reports',
      icon: 'document_settings',
      permissions: [
        'ROLE_VIEW_ALL_HSE_REPORT',
        'ROLE_PROCESS_HSE_REPORT_AS_OFFICER',
        'ROLE_PROCESS_HSE_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_HSE_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_HSE_REPORT_AS_PLANT_MANAGER',
      ],
    },
    loadComponent: () =>
      import('../plants/hse-reports/hse-reports.component').then((m) => m.HseReportsComponent),
  },

  // ---configurations (merged: HSE setup catalogs + environment catalogs)---
  {
    path: '',
    data: { name: 'Configurations', icon: 'settings', isMenu: true },
    children: [
      {
        path: 'incident-types',
        data: { isMenu: true, name: 'Incident Types', icon: 'category' },
        loadComponent: () =>
          import('./hse/incident-types/incident-types').then((m) => m.IncidentTypes),
      },
      {
        matcher: (url) => matchRoute(url, 'incident-types', 'incidentTypeUid'),
        loadComponent: () =>
          import('./hse/incident-types/incident-type-detail.component').then(
            (m) => m.IncidentTypeDetailComponent,
          ),
      },
      {
        path: 'inspection-types',
        data: {
          isMenu: true,
          name: 'Inspection Types',
          icon: 'checklist',
          permissions: ['ROLE_VIEW_INSPECTION_TYPE'],
        },
        loadComponent: () =>
          import('./hse/inspection-types/inspection-types').then((m) => m.InspectionTypes),
      },
      {
        matcher: (url) => matchRoute(url, 'inspection-types', 'inspectionTypeUid'),
        data: { permissions: ['ROLE_VIEW_INSPECTION_TYPE'] },
        loadComponent: () =>
          import('./hse/inspection-types/inspection-type-detail.component').then(
            (m) => m.InspectionTypeDetailComponent,
          ),
      },
      {
        path: 'waste-groups',
        data: {
          isMenu: true,
          name: 'Waste Groups',
          icon: 'delete',
          permissions: ['ROLE_VIEW_WASTE_GROUP'],
        },
        loadComponent: () => import('./hse/waste-groups/waste-groups').then((m) => m.WasteGroups),
      },
      {
        matcher: (url) => matchRoute(url, 'waste-groups', 'wasteGroupUid'),
        data: { permissions: ['ROLE_VIEW_WASTE_GROUP'] },
        loadComponent: () =>
          import('./hse/waste-groups/waste-group-detail.component').then(
            (m) => m.WasteGroupDetailComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'waste-categories', 'wasteCategoryUid'),
        data: { permissions: ['ROLE_VIEW_WASTE_CATEGORY'] },
        loadComponent: () =>
          import('./hse/waste-categories/waste-category-detail.component').then(
            (m) => m.WasteCategoryDetailComponent,
          ),
      },
      {
        path: 'water-uses',
        data: {
          isMenu: true,
          name: 'Water Uses',
          icon: 'water',
          permissions: ['ROLE_VIEW_WATER_USE'],
        },
        loadComponent: () => import('./hse/water-uses/water-uses').then((m) => m.WaterUses),
      },
      {
        matcher: (url) => matchRoute(url, 'water-uses', 'waterUseUid'),
        data: { permissions: ['ROLE_VIEW_WATER_USE'] },
        loadComponent: () =>
          import('./hse/water-uses/water-use-detail.component').then(
            (m) => m.WaterUseDetailComponent,
          ),
      },
      {
        path: 'energy-uses',
        data: {
          isMenu: true,
          name: 'Energy Uses',
          icon: 'flash',
          permissions: ['ROLE_VIEW_ENERGY_USE'],
        },
        loadComponent: () => import('./hse/energy-uses/energy-uses').then((m) => m.EnergyUses),
      },
      {
        matcher: (url) => matchRoute(url, 'energy-uses', 'energyUseUid'),
        data: { permissions: ['ROLE_VIEW_ENERGY_USE'] },
        loadComponent: () =>
          import('./hse/energy-uses/energy-use-detail.component').then(
            (m) => m.EnergyUseDetailComponent,
          ),
      },
      {
        path: 'emission-substances',
        data: {
          isMenu: true,
          name: 'Emission Substances',
          icon: 'cloud_download',
          permissions: ['ROLE_VIEW_EMISSION_SUBSTANCE'],
        },
        loadComponent: () =>
          import('./hse/emission-substances/emission-substances').then(
            (m) => m.EmissionSubstances,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'emission-substances', 'emissionSubstanceUid'),
        data: { permissions: ['ROLE_VIEW_EMISSION_SUBSTANCE'] },
        loadComponent: () =>
          import('./hse/emission-substances/emission-substance-detail.component').then(
            (m) => m.EmissionSubstanceDetailComponent,
          ),
      },
    ],
  },

  // =====================================================================
  // Detail routes (no menu entry; matched by URL)
  // =====================================================================
  {
    matcher: (url) => matchRoute(url, 'incidents', 'incidentUid'),
    loadComponent: () =>
      import('./hse/incidents/incident-details.component').then((m) => m.IncidentDetailsComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'waste-generation-logs', 'logUid'),
    data: { permissions: ['ROLE_VIEW_WASTE_GENERATION_LOG'] },
    loadComponent: () =>
      import('./hse/waste-generation-logs/waste-generation-log-detail.component').then(
        (m) => m.WasteGenerationLogDetailComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'emission-logs', 'logUid'),
    data: { permissions: ['ROLE_VIEW_EMISSION_LOG'] },
    loadComponent: () =>
      import('./hse/emission-logs/emission-log-detail.component').then(
        (m) => m.EmissionLogDetailComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'water-usages', 'usageUid'),
    data: { permissions: ['ROLE_VIEW_WATER_USAGE'] },
    loadComponent: () =>
      import('./hse/water-usages/water-usage-detail.component').then(
        (m) => m.WaterUsageDetailComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'energy-usages', 'usageUid'),
    data: { permissions: ['ROLE_VIEW_ENERGY_USAGE'] },
    loadComponent: () =>
      import('./hse/energy-usages/energy-usage-detail.component').then(
        (m) => m.EnergyUsageDetailComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'meetings', 'meetingUid'),
    data: { permissions: ['ROLE_VIEW_HSE_MEETING'] },
    loadComponent: () =>
      import('./hse/meetings/meeting-detail.component').then((m) => m.HseMeetingDetailComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'trainings', 'trainingUid'),
    data: { permissions: ['ROLE_VIEW_HSE_TRAINING'] },
    loadComponent: () =>
      import('./hse/trainings/training-detail.component').then((m) => m.HseTrainingDetailComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'inspection-plans', 'planUid'),
    data: { permissions: ['ROLE_VIEW_INSPECTION_PLAN'] },
    loadComponent: () =>
      import('./hse/inspection-plans/inspection-plan-detail.component').then(
        (m) => m.InspectionPlanDetailComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'drills', 'drillUid'),
    data: { permissions: ['ROLE_VIEW_HSE_DRILL'] },
    loadComponent: () =>
      import('./hse/drills/drill-detail.component').then((m) => m.HseDrillDetailComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'hse-reports', 'hseReportUid'),
    data: { permissions: ['ROLE_VIEW_HSE_REPORT'] },
    loadComponent: () =>
      import('../plants/hse-reports/hse-report.component').then((m) => m.HseReportComponent),
  },
  // ---attachments (shared viewer: details + content tabs)---
  {
    matcher: (url) => matchRoute(url, 'attachments', 'attachmentUid'),
    loadComponent: () =>
      import('@shared/components/attachment-viewer/attachment-detail.component').then(
        (m) => m.AttachmentDetailComponent,
      ),
  },
];

export default HSE_ROUTES;

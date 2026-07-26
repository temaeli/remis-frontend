import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const PIPELINE_MANAGEMENT_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'pipeline-station-readings',
    pathMatch: 'full',
  },
  {
    path: 'pipelines',
    data: { isMenu: true, name: 'Pipelines', icon: 'workflow' },
    loadComponent: () => import('./pipelines/pipelines').then((m) => m.Pipelines),
  },
  {
    matcher: (url) => matchRoute(url, 'pipelines', 'pipelineUid'),
    loadComponent: () =>
      import('./pipelines/pipeline-detail.component').then((m) => m.PipelineDetailComponent),
  },
  {
    path: 'sections',
    data: { isMenu: true, name: 'Sections', icon: 'cards' },
    loadComponent: () => import('./sections/sections').then((m) => m.Sections),
  },
  {
    matcher: (url) => matchRoute(url, 'sections', 'sectionUid'),
    loadComponent: () =>
      import('./sections/section-detail.component').then((m) => m.SectionDetailComponent),
  },
  {
    path: 'segments',
    data: { isMenu: true, name: 'Segments', icon: 'location' },
    loadComponent: () => import('./segments/segments').then((m) => m.Segments),
  },
  {
    matcher: (url) => matchRoute(url, 'segments', 'pipelineSegmentUid'),
    loadComponent: () =>
      import('./segments/segment-detail.component').then((m) => m.SegmentDetailComponent),
  },
  {
    path: 'readings',
    data: { isMenu: true, name: 'Readings', icon: 'dashboard' },
    loadComponent: () => import('./readings/readings').then((m) => m.Readings),
  },
  {
    matcher: (url) => matchRoute(url, 'readings', 'pipelineReadingUid'),
    loadComponent: () =>
      import('./readings/reading-detail.component').then((m) => m.ReadingDetailComponent),
  },
  {
    path: 'reports',
    data: { isMenu: true, name: 'Reports', icon: 'report' },
    loadComponent: () => import('./reports/reports').then((m) => m.PipelineReports),
  },
  {
    matcher: (url) => matchRoute(url, 'reports', 'reportUid'),
    loadComponent: () =>
      import('./reports/report-detail.component').then((m) => m.ReportDetailComponent),
  },
  {
    path: 'working-stations',
    data: { isMenu: true, name: 'Working Stations', icon: 'factory' },
    loadComponent: () =>
      import('./working-stations/working-stations').then((m) => m.WorkingStations),
  },
  {
    path: 'maintenance-reports',
    data: {
      isMenu: true,
      name: 'Maintenance Performance',
      icon: 'hammer',
      permissions: ['ROLE_VIEW_MAINTENANCE_ACTIVITY', 'ROLE_MANAGE_MAINTENANCE_ACTIVITY'],
    },
    loadComponent: () =>
      import('./maintenance-reports/maintenance-reports-index').then(
        (m) => m.MaintenanceReportsIndex,
      ),
  },
  {
    path: 'maintenance-reports/pipeline/:pipelineUid',
    data: { permissions: ['ROLE_VIEW_MAINTENANCE_ACTIVITY', 'ROLE_MANAGE_MAINTENANCE_ACTIVITY'] },
    loadComponent: () =>
      import('./maintenance-reports/pipeline-maintenance-reports').then(
        (m) => m.PipelineMaintenanceReports,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'maintenance-reports', 'reportUid'),
    loadComponent: () =>
      import('./maintenance-reports/maintenance-report-detail.component').then(
        (m) => m.PipelineMaintenanceReportDetailComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'working-stations', 'workingStationUid'),
    loadComponent: () =>
      import('./working-stations/working-station-detail.component').then(
        (m) => m.WorkingStationDetailComponent,
      ),
  },
  {
    path: 'equipment-refuels',
    data: { isMenu: true, name: 'Equipment Refuels', icon: 'natural_gas' },
    loadComponent: () =>
      import('./power-generator-refuels/power-generator-refuels').then(
        (m) => m.PowerGeneratorRefuels,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'equipment-refuels', 'powerGeneratorRefuelUid'),
    loadComponent: () =>
      import('./power-generator-refuels/refuel-detail.component').then(
        (m) => m.RefuelDetailComponent,
      ),
  },
  {
    path: 'power-generator-operations',
    loadComponent: () =>
      import('./power-generator-operations/power-generator-operations').then(
        (m) => m.PowerGeneratorOperations,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'power-generator-operations', 'powerGeneratorOperationUid'),
    loadComponent: () =>
      import('./power-generator-operations/operation-detail.component').then(
        (m) => m.OperationDetailComponent,
      ),
  },
  {
    path: 'fuel-tanks',
    data: { isMenu: true, name: 'Fuel Tanks', icon: 'natural_gas' },
    loadComponent: () =>
      import('./fuel-tanks/fuel-tanks').then((m) => m.FuelTanks),
  },
  {
    path: 'main-facility-types',
    data: { isMenu: true, name: 'Main Facility Types', icon: 'settings' },
    loadComponent: () =>
      import('./main-facility-types/main-facility-types').then((m) => m.MainFacilityTypes),
  },
  {
    path: 'main-facilities',
    data: { isMenu: true, name: 'Main Facilities', icon: 'factory' },
    loadComponent: () =>
      import('./main-facilities/main-facilities').then((m) => m.MainFacilities),
  },
  {
    matcher: (url) => matchRoute(url, 'main-facilities', 'mainFacilityUid'),
    data: { permissions: ['ROLE_VIEW_FACILITY', 'ROLE_MANAGE_FACILITY'] },
    loadComponent: () =>
      import('./main-facilities/main-facility-detail.component').then(
        (m) => m.MainFacilityDetailComponent,
      ),
  },
  {
    path: 'pipeline-stations',
    data: { isMenu: true, name: 'Pipeline Stations', icon: 'factory' },
    loadComponent: () =>
      import('./pipeline-stations/pipeline-stations').then((m) => m.PipelineStations),
  },
  {
    matcher: (url) => matchRoute(url, 'pipeline-stations', 'pipelineStationUid'),
    loadComponent: () =>
      import('./pipeline-stations/pipeline-station-detail.component').then(
        (m) => m.PipelineStationDetailComponent,
      ),
  },
  {
    path: 'pipeline-station-readings',
    data: { isMenu: true, name: 'Station Readings', icon: 'dashboard' },
    loadComponent: () =>
      import('./pipeline-station-readings/pipeline-station-readings').then(
        (m) => m.PipelineStationReadings,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'pipeline-station-readings', 'pipelineStationReadingUid'),
    loadComponent: () =>
      import('./pipeline-station-readings/pipeline-station-reading-detail.component').then(
        (m) => m.PipelineStationReadingDetailComponent,
      ),
  },
  {
    path: 'flow-meter-readings',
    data: { isMenu: true, name: 'Flow Meter Readings', icon: 'dashboard' },
    loadComponent: () =>
      import('./flow-meter-readings/flow-meter-readings').then((m) => m.FlowMeterReadings),
  },
  {
    matcher: (url) => matchRoute(url, 'flow-meter-readings', 'flowMeterReadingUid'),
    loadComponent: () =>
      import('./flow-meter-readings/flow-meter-reading-detail.component').then(
        (m) => m.FlowMeterReadingDetailComponent,
      ),
  },
  {
    path: 'pipeline-station-suctions',
    loadComponent: () =>
      import('./pipeline-station-suctions/pipeline-station-suctions').then(
        (m) => m.PipelineStationSuctions,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'pipeline-station-suctions', 'pipelineStationSuctionUid'),
    loadComponent: () =>
      import('./pipeline-station-suctions/suction-detail.component').then(
        (m) => m.PipelineStationSuctionDetailComponent,
      ),
  },
  {
    path: 'pipeline-station-discharges',
    loadComponent: () =>
      import('./pipeline-station-discharges/pipeline-station-discharges').then(
        (m) => m.PipelineStationDischarges,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'pipeline-station-discharges', 'pipelineStationDischargeUid'),
    loadComponent: () =>
      import('./pipeline-station-discharges/discharge-detail.component').then(
        (m) => m.PipelineStationDischargeDetailComponent,
      ),
  },
  {
    path: 'generator-tank-refuels',
    data: { isMenu: true, name: 'Main Tank Refuels', icon: 'refresh' },
    loadComponent: () =>
      import('./generator-tank-refuels/generator-tank-refuels').then((m) => m.GeneratorTankRefuels),
  },
  {
    matcher: (url) => matchRoute(url, 'generator-tank-refuels', 'generatorTankRefuelUid'),
    loadComponent: () =>
      import('./generator-tank-refuels/tank-refuel-detail.component').then(
        (m) => m.TankRefuelDetailComponent,
      ),
  },
  {
    path: 'standby-generators',
    data: { isMenu: true, name: 'Generator Management', icon: 'flash' },
    loadComponent: () =>
      import('./power-generators/power-generators').then((m) => m.PowerGenerators),
  },
  {
    matcher: (url) => matchRoute(url, 'standby-generators', 'powerGeneratorUid'),
    loadComponent: () =>
      import('./power-generators/power-generator-detail.component').then(
        (m) => m.PowerGeneratorDetailComponent,
      ),
  },
  {
    path: 'standby-generators-config',
    data: { isMenu: true, name: 'Standby Generators', icon: 'flash' },
    loadComponent: () =>
      import('./power-generators/power-generators-config').then((m) => m.PowerGeneratorsConfig),
  },
  {
    matcher: (url) => matchRoute(url, 'standby-generators-config', 'powerGeneratorUid'),
    loadComponent: () =>
      import('./power-generators/power-generator-config-detail.component').then(
        (m) => m.PowerGeneratorConfigDetailComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'fuel-tanks', 'powerGeneratorTankUid'),
    data: { permissions: ['ROLE_VIEW_POWER_GENERATOR_TANK'] },
    loadComponent: () =>
      import('./fuel-tanks/tank-detail.component').then((m) => m.TankDetailComponent),
  },
  {
    path: 'fuel-management',
    data: { isMenu: true, name: 'Fuel Management', icon: 'natural_gas' },
    loadComponent: () =>
      import('./fuel-tanks/fuel-management').then((m) => m.FuelManagement),
  },
  {
    matcher: (url) => matchRoute(url, 'fuel-management', 'powerGeneratorTankUid'),
    data: { permissions: ['ROLE_VIEW_POWER_GENERATOR_TANK'] },
    loadComponent: () =>
      import('./fuel-tanks/fuel-management-detail.component').then(
        (m) => m.FuelManagementDetailComponent,
      ),
  },
  // Manpower management moved to HSE. Pipeline keeps only a read-only attendance
  // detail so the Working Station drill-in can view attendance + its children.
  {
    matcher: (url) => matchRoute(url, 'manpower-attendances', 'manpowerAttendanceUid'),
    data: { readOnly: true, permissions: ['ROLE_VIEW_MANPOWER_ATTENDANCE'] },
    loadComponent: () =>
      import('../security/manpower-attendances/manpower-attendance-detail.component').then(
        (m) => m.ManpowerAttendanceDetailComponent,
      ),
  },
];

export default PIPELINE_MANAGEMENT_ROUTES;

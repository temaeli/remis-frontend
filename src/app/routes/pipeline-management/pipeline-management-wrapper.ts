import { Component, inject } from '@angular/core';
import { Menu, MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';

// Non-navigable group rows need a unique `route` value so the sidemenu's
// `@for ... track menuItem.route` doesn't collide on duplicate empty strings
// (Angular NG0955). A whitespace-only string stays distinct as a track key but
// is skipped by MenuService.buildRoute (it filters items where `item.trim()`
// is falsy), so child routerLinks remain unaffected.
const GROUP_CONFIGURATIONS = ' ';

const PIPELINE_MANAGEMENT_MENU: Menu[] = [
  /*{
    route: 'pipeline-management/readings',
    name: 'Readings',
    icon: 'dashboard',
    appendPrefix: false,
  },*/
  {
    route: 'pipeline-management/pipeline-station-readings',
    name: 'Station Readings',
    icon: 'dashboard',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_PIPELINE_STATION_READING', 'ROLE_MANAGE_PIPELINE_STATION_READING'],
  },
  {
    route: 'pipeline-management/flow-meter-readings',
    name: 'Flow Meter Readings',
    icon: 'dashboard',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_FLOW_METER_READING', 'ROLE_MANAGE_FLOW_METER_READING'],
  },
  {
    route: 'pipeline-management/standby-generators',
    name: 'Generator Management',
    icon: 'flash',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_POWER_GENERATOR'],
  },
  {
    route: 'pipeline-management/fuel-management',
    name: 'Fuel Management',
    icon: 'natural_gas',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_POWER_GENERATOR_TANK'],
  },
  {
    route: 'pipeline-management/reports',
    name: 'Reports',
    icon: 'report',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_PIPELINE_REPORT'],
  },
  {
    route: 'pipeline-management/maintenance-reports',
    name: 'Maintenance Performance',
    icon: 'hammer',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_MAINTENANCE_ACTIVITY', 'ROLE_MANAGE_MAINTENANCE_ACTIVITY'],
  },
  {
    route: GROUP_CONFIGURATIONS,
    name: 'Configurations',
    icon: 'settings',
    permissions: [
      'ROLE_VIEW_PIPELINE',
      'ROLE_VIEW_PIPELINE_SECTION',
      'ROLE_VIEW_PIPELINE_SEGMENT',
      'ROLE_VIEW_PIPELINE_STATION',
      'ROLE_MANAGE_PIPELINE_STATION',
      'ROLE_VIEW_POWER_GENERATOR',
      'ROLE_MANAGE_POWER_GENERATOR',
      'ROLE_VIEW_POWER_GENERATOR_TANK',
      'ROLE_MANAGE_POWER_GENERATOR_TANK',
      'ROLE_VIEW_WORKING_STATION',
      'ROLE_MANAGE_WORKING_STATION',
      'ROLE_VIEW_FACILITY_TYPE',
      'ROLE_MANAGE_FACILITY_TYPE',
      'ROLE_VIEW_FACILITY',
      'ROLE_MANAGE_FACILITY',
    ],
    children: [
      {
        route: 'pipeline-management/pipelines',
        name: 'Pipelines',
        icon: 'workflow',
        appendPrefix: false,
        permissions: ['ROLE_VIEW_PIPELINE'],
      },
      {
        route: 'pipeline-management/sections',
        name: 'Sections',
        icon: 'cards',
        appendPrefix: false,
        permissions: ['ROLE_VIEW_PIPELINE_SECTION'],
      },
      {
        route: 'pipeline-management/segments',
        name: 'Segments',
        icon: 'location',
        appendPrefix: false,
        permissions: ['ROLE_VIEW_PIPELINE_SEGMENT'],
      },
      {
        route: 'pipeline-management/pipeline-stations',
        name: 'Pipeline Stations',
        icon: 'factory',
        appendPrefix: false,
        permissions: ['ROLE_VIEW_PIPELINE_STATION', 'ROLE_MANAGE_PIPELINE_STATION'],
      },
      {
        route: 'pipeline-management/working-stations',
        name: 'Working Stations',
        icon: 'factory',
        appendPrefix: false,
        permissions: ['ROLE_VIEW_WORKING_STATION', 'ROLE_MANAGE_WORKING_STATION'],
      },
      {
        route: 'pipeline-management/standby-generators-config',
        name: 'Standby Generators',
        icon: 'flash',
        appendPrefix: false,
        permissions: ['ROLE_MANAGE_POWER_GENERATOR'],
      },
      {
        route: 'pipeline-management/fuel-tanks',
        name: 'Fuel Tanks',
        icon: 'natural_gas',
        appendPrefix: false,
        permissions: ['ROLE_VIEW_POWER_GENERATOR_TANK', 'ROLE_MANAGE_POWER_GENERATOR_TANK'],
      },
      {
        route: 'pipeline-management/main-facility-types',
        name: 'Main Facility Types',
        icon: 'settings',
        appendPrefix: false,
        permissions: ['ROLE_VIEW_FACILITY_TYPE', 'ROLE_MANAGE_FACILITY_TYPE'],
      },
      {
        route: 'pipeline-management/main-facilities',
        name: 'Main Facilities',
        icon: 'factory',
        appendPrefix: false,
        permissions: ['ROLE_VIEW_FACILITY', 'ROLE_MANAGE_FACILITY'],
      },
    ],
  },
];

@Component({
  selector: 'pipeline-management-wrapper',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class PipelineManagementWrapper {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.set(
      PIPELINE_MANAGEMENT_MENU.map((m) => ({
        ...m,
        children: m.children?.map((c) => ({ ...c })),
      })),
      '',
    );
    // Menu is hardcoded with full paths (prefix ''), so set() can't infer the
    // active module. Set it explicitly so the sidebar banner + left module icon
    // highlight like every other module.
    this.menuService.module_.set(
      (this.menuService.modules.find((m) => m.route === 'pipeline-management') as any),
    );
  }
}

import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const PLANTS_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    data: { isMenu: true, name: 'Dashboard', icon: 'dashboard' },
    loadComponent: () =>
      import('./plants-dashboard/plants-dashboard').then((m) => m.PlantsDashboard),
  },

  // ---plants---
  {
    path: 'plants',
    data: {
      isMenu: true,
      name: 'Plants',
      icon: 'factory',
      permissions: ['ROLE_VIEW_PLANT', 'ROLE_VIEW_ALL_PLANT'],
    },

    loadComponent: () => import('./plants/plants.component').then((m) => m.PlantsComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'plants', 'plantUid'),
    loadComponent: () => import('./plants/plant.component').then((m) => m.PlantComponent),
  },

  // ---daily-report--- aggregated view of the latest submitted report per group,
  // for supervisory roles (shift supervisor and up) - see daily-report.component.ts
  {
    path: 'daily-report',
    data: {
      isMenu: true, ///
      name: 'Daily Report (testing)',
      icon: 'file',
      permissions: [
        'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_SUPERINTENDENT',
        'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_PLANT_MANAGER',
        'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_SUPERINTENDENT',
        'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_PLANT_MANAGER',
        'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_SUPERINTENDENT',
        'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_PLANT_MANAGER',
        'ROLE_PROCESS_WATER_TANK_LEVEL_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_WATER_TANK_LEVEL_AS_SUPERINTENDENT',
        'ROLE_PROCESS_WATER_TANK_LEVEL_AS_PLANT_MANAGER',
        'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_SUPERINTENDENT',
        'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_PLANT_MANAGER',
        'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_SUPERINTENDENT',
        'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_PLANT_MANAGER',
        'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_SUPERINTENDENT',
        'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_PLANT_MANAGER',
        'ROLE_PROCESS_WASTE_WATER_ANALYSIS_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_WASTE_WATER_ANALYSIS_AS_SUPERINTENDENT',
        'ROLE_PROCESS_WASTE_WATER_ANALYSIS_AS_PLANT_MANAGER',
        'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_SUPERINTENDENT',
        'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_PLANT_MANAGER',
        'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_PLANT_MANAGER',
        'ROLE_PROCESS_MAINTENANCE_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_MAINTENANCE_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_MAINTENANCE_REPORT_AS_PLANT_MANAGER',
        'ROLE_PROCESS_HSE_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_HSE_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_HSE_REPORT_AS_PLANT_MANAGER',
        'ROLE_PROCESS_SECURITY_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_SECURITY_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_SECURITY_REPORT_AS_PLANT_MANAGER',
      ],
    },
    loadComponent: () =>
      import('./daily-report/daily-report.component').then((m) => m.DailyReportComponent),
  },

  // ---plant-reports--- aggregated report carrying every other plant report through
  // one shared approval flow (Shift Supervisor -> Superintendent -> Plant Manager).
  // No detail/view page yet - backend hasn't shipped the nested view-details queries.
  {
    path: 'plant-reports',
    data: {
      isMenu: true,
      name: 'Plant Daily Reports',
      icon: 'annual',
      permissions: [
        'ROLE_INITIALIZE_PLANT_REPORT',
        'ROLE_PROCESS_PLANT_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_PLANT_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_PLANT_REPORT_AS_PLANT_MANAGER',
      ],
    },
    loadComponent: () =>
      import('./plant-reports/plant-reports.component').then((m) => m.PlantReportsComponent),
  },

  {
    path: '',
    data: { isMenu: true, name: 'Plant Gas Processing Data', icon: 'graph' },
    children: [
      // ---plant-received-data------
      {
        path: 'plant-received-datas',
        data: {
          isMenu: true,
          name: 'Plant Received Data',
          icon: 'import',
          permissions: ['ROLE_VIEW_ALL_PLANT_RECEIVED_DATA'],
        },
        loadComponent: () =>
          import('./plant-received-datas/plant-received-datas.component').then(
            (m) => m.PlantReceivedDatasComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'plant-received-datas', 'plantReceivedDataUid'),
        data: {
          permissions: ['ROLE_VIEW_PLANT_RECEIVED_DATA', 'ROLE_VIEW_ALL_PLANT_RECEIVED_DATA'],
        },
        loadComponent: () =>
          import('./plant-received-datas/plant-received-data.component').then(
            (m) => m.PlantReceivedDataComponent,
          ),
      },

      //   ---plant-export-readings------
      {
        path: 'plant-export-readings',
        data: {
          isMenu: true,
          name: 'Plant Processed Data',
          icon: 'export',
          permissions: ['ROLE_VIEW_ALL_PLANT_EXPORT_READING'],
        },
        loadComponent: () =>
          import('./plant-export-readings/plant-export-readings.component').then(
            (m) => m.PlantExportReadingsComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'plant-export-readings', 'plantExportReadingUid'),
        data: { permissions: ['ROLE_VIEW_PLANT_EXPORT_READING'] },
        loadComponent: () =>
          import('./plant-export-readings/plant-export-reading.component').then(
            (m) => m.PlantExportReadingComponent,
          ),
      },

      //   ---condensate-sales------
      {
        path: 'condensate-sales',
        data: {
          isMenu: true,
          name: 'Condensate Sales',
          icon: 'price_tag',
          permissions: ['ROLE_VIEW_CONDENSATE_SALE', 'ROLE_MANAGE_CONDENSATE_SALE'],
        },
        loadComponent: () =>
          import('./condensate-sales/condensate-sales.component').then(
            (m) => m.CondensateSalesComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'condensate-sales', 'condensateSaleUid'),
        data: { permissions: ['ROLE_VIEW_CONDENSATE_SALE', 'ROLE_MANAGE_CONDENSATE_SALE'] },
        loadComponent: () =>
          import('./condensate-sales/condensate-sale.component').then(
            (m) => m.CondensateSaleComponent,
          ),
      },

      // ---fuel-flared-gases---
      {
        path: 'fuel-flared-gases',
        data: {
          isMenu: true,
          name: 'Fuel and Flared Gas',
          icon: 'local_fire_department',
          permissions: [
            'ROLE_VIEW_ALL_FUEL_AND_FLARED_GAS',
            'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_OFFICER',
            'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_SHIFT_SUPERVISOR',
            'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_SUPERINTENDENT',
            'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_PLANT_MANAGER',
          ],
        },
        loadComponent: () =>
          import('./fuel-flared-gas/fuel-flared-gases.component').then(
            (m) => m.FuelFlaredGasesComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'fuel-flared-gases', 'fuelFlaredGasUid'),
        data: { permissions: ['ROLE_VIEW_FUEL_AND_FLARED_GAS'] },
        loadComponent: () =>
          import('./fuel-flared-gas/fuel-flared-gas.component').then(
            (m) => m.FuelFlaredGasComponent,
          ),
      },

      // ---export-gas-analysis---
      {
        path: 'export-gas-analysis',
        data: {
          isMenu: true,
          name: 'Export Gas Analysis',
          icon: 'chart_line',
          permissions: [
            'ROLE_VIEW_ALL_EXPORT_GAS_ANALYSIS',
            'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_OFFICER',
            'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_SHIFT_SUPERVISOR',
            'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_SUPERINTENDENT',
            'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_PLANT_MANAGER',
          ],
        },
        loadComponent: () =>
          import('./export-gas-analysis/export-gas-analyses.component').then(
            (m) => m.ExportGasAnalysesComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'export-gas-analysis', 'exportGasAnalysisUid'),
        data: { permissions: ['ROLE_VIEW_EXPORT_GAS_ANALYSIS'] },
        loadComponent: () =>
          import('./export-gas-analysis/export-gas-analysis.component').then(
            (m) => m.ExportGasAnalysisComponent,
          ),
      },

      // ---condensate-storage-tanks---
      {
        path: 'condensate-storage-tanks',
        data: {
          isMenu: true,
          name: 'Condensate Storage Tank',
          icon: 'storage',
          permissions: [
            'ROLE_VIEW_ALL_CONDENSATE_STORAGE_TANK',
            'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_OFFICER',
            'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_SHIFT_SUPERVISOR',
            'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_SUPERINTENDENT',
            'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_PLANT_MANAGER',
          ],
        },
        loadComponent: () =>
          import('./condensate-storage-tanks/condensate-storage-tanks.component').then(
            (m) => m.CondensateStorageTanksComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'condensate-storage-tanks', 'condensateStorageTankUid'),
        data: { permissions: ['ROLE_VIEW_CONDENSATE_STORAGE_TANK'] },
        loadComponent: () =>
          import('./condensate-storage-tanks/condensate-storage-tank.component').then(
            (m) => m.CondensateStorageTankComponent,
          ),
      },

      // ---condensate-parameters--- no approval flow, just filled
      {
        path: 'condensate-parameters',
        data: {
          isMenu: true,
          name: 'Condensate Parameter',
          icon: 'science',
          permissions: ['ROLE_VIEW_ALL_CONDENSATE_PARAMETER', 'ROLE_VIEW_CONDENSATE_PARAMETER'],
        },
        loadComponent: () =>
          import('./condensate-parameters/condensate-parameters.component').then(
            (m) => m.CondensateParametersComponent,
          ),
      },
    ],
  },

  {
    path: '',
    data: { isMenu: true, name: 'Water Treatment', icon: 'water' },
    children: [
      // ---water-tank-levels---
      {
        path: 'water-tank-levels',
        data: {
          isMenu: true,
          name: 'Water Tank Level',
          icon: 'water_full',
          permissions: [
            'ROLE_VIEW_ALL_WATER_TANK_LEVEL',
            'ROLE_PROCESS_WATER_TANK_LEVEL_AS_OFFICER',
            'ROLE_PROCESS_WATER_TANK_LEVEL_AS_SHIFT_SUPERVISOR',
            'ROLE_PROCESS_WATER_TANK_LEVEL_AS_SUPERINTENDENT',
            'ROLE_PROCESS_WATER_TANK_LEVEL_AS_PLANT_MANAGER',
          ],
        },
        loadComponent: () =>
          import('./water-tank-levels/water-tank-levels.component').then(
            (m) => m.WaterTankLevelsComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'water-tank-levels', 'waterTankLevelUid'),
        data: { permissions: ['ROLE_VIEW_WATER_TANK_LEVEL'] },
        loadComponent: () =>
          import('./water-tank-levels/water-tank-level.component').then(
            (m) => m.WaterTankLevelComponent,
          ),
      },

      // ---potable-water-production---
      {
        path: 'potable-water-production',
        data: {
          isMenu: true,
          name: 'Potable Water Production',
          icon: 'water',
          permissions: [
            'ROLE_VIEW_ALL_POTABLE_WATER_PRODUCTION',
            'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_OFFICER',
            'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_SHIFT_SUPERVISOR',
            'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_SUPERINTENDENT',
            'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_PLANT_MANAGER',
          ],
        },
        loadComponent: () =>
          import('./potable-water-production/potable-water-productions.component').then(
            (m) => m.PotableWaterProductionsComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'potable-water-production', 'potableWaterProductionUid'),
        data: { permissions: ['ROLE_VIEW_POTABLE_WATER_PRODUCTION'] },
        loadComponent: () =>
          import('./potable-water-production/potable-water-production.component').then(
            (m) => m.PotableWaterProductionComponent,
          ),
      },

      // ---waste-water-produced---
      {
        path: 'waste-water-produced',
        data: {
          isMenu: true,
          name: 'Waste Water Produced',
          icon: 'water_drop',
          permissions: [
            'ROLE_VIEW_ALL_WASTE_WATER_PRODUCED',
            'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_OFFICER',
            'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_SHIFT_SUPERVISOR',
            'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_SUPERINTENDENT',
            'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_PLANT_MANAGER',
          ],
        },
        loadComponent: () =>
          import('./waste-water-produced/waste-water-produceds.component').then(
            (m) => m.WasteWaterProducedsComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'waste-water-produced', 'wasteWaterProducedUid'),
        data: { permissions: ['ROLE_VIEW_WASTE_WATER_PRODUCED'] },
        loadComponent: () =>
          import('./waste-water-produced/waste-water-produced.component').then(
            (m) => m.WasteWaterProducedComponent,
          ),
      },

      // water-data - dew-point, hydrocarbon, water-content
      {
        path: 'water-data-dew-point',
        data: {
          isMenu: true,
          name: 'Water Dew Point',
          icon: 'thermostat',
          permissions: [
            'ROLE_VIEW_ALL_HYDROCARBON_AND_WATER_CONTENT',
            'ROLE_VIEW_HYDROCARBON_AND_WATER_CONTENT',
          ],
        },
        loadComponent: () =>
          import('./water-data/water-data-list.component').then((m) => m.WaterDataListComponent),
      },

      {
        path: 'water-data-hydrocarbon',
        data: {
          isMenu: true,
          name: 'Water Hydrocarbon',
          icon: 'local_fire_department',
          permissions: [
            'ROLE_VIEW_ALL_HYDROCARBON_AND_WATER_CONTENT',
            'ROLE_VIEW_HYDROCARBON_AND_WATER_CONTENT',
          ],
        },
        loadComponent: () =>
          import('./water-data/water-data-list.component').then((m) => m.WaterDataListComponent),
      },

      {
        path: 'water-data-water-content',
        data: {
          isMenu: true,
          name: 'Water Content',
          icon: 'water_full',
          permissions: [
            'ROLE_VIEW_ALL_HYDROCARBON_AND_WATER_CONTENT',
            'ROLE_VIEW_HYDROCARBON_AND_WATER_CONTENT',
          ],
        },
        loadComponent: () =>
          import('./water-data/water-data-list.component').then((m) => m.WaterDataListComponent),
      },
    ],
  },

  {
    path: '',
    data: { isMenu: true, name: 'Lab Technician', icon: 'flask' },
    children: [
      // ---potable-water-analysis---
      {
        path: 'potable-water-analysis',
        data: {
          isMenu: true,
          name: 'Potable Water Analysis',
          icon: 'science',
          permissions: [
            'ROLE_VIEW_ALL_POTABLE_WATER_ANALYSIS',
            'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_OFFICER',
            'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_SHIFT_SUPERVISOR',
            'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_SUPERINTENDENT',
            'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_PLANT_MANAGER',
          ],
        },
        loadComponent: () =>
          import('./potable-water-analysis/potable-water-analyses.component').then(
            (m) => m.PotableWaterAnalysesComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'potable-water-analysis', 'potableWaterAnalysisUid'),
        data: { permissions: ['ROLE_VIEW_POTABLE_WATER_ANALYSIS'] },
        loadComponent: () =>
          import('./potable-water-analysis/potable-water-analysis.component').then(
            (m) => m.PotableWaterAnalysisComponent,
          ),
      },

      // ---waste-water-analysis---
      {
        path: 'waste-water-analysis',
        data: {
          isMenu: true,
          name: 'Waste Water Analysis',
          icon: 'biotech',
          permissions: [
            'ROLE_VIEW_ALL_WASTE_WATER_ANALYSIS',
            'ROLE_PROCESS_WASTE_WATER_ANALYSIS_AS_OFFICER',
            'ROLE_PROCESS_WASTE_WATER_ANALYSIS_AS_SHIFT_SUPERVISOR',
            'ROLE_PROCESS_WASTE_WATER_ANALYSIS_AS_SUPERINTENDENT',
            'ROLE_PROCESS_WASTE_WATER_ANALYSIS_AS_PLANT_MANAGER',
          ],
        },
        loadComponent: () =>
          import('./waste-water-analysis/waste-water-analyses.component').then(
            (m) => m.WasteWaterAnalysesComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'waste-water-analysis', 'wasteWaterAnalysisUid'),
        data: { permissions: ['ROLE_VIEW_WASTE_WATER_ANALYSIS'] },
        loadComponent: () =>
          import('./waste-water-analysis/waste-water-analysis.component').then(
            (m) => m.WasteWaterAnalysisComponent,
          ),
      },

      // ---mono-ethylene-glycol-analysis---
      {
        path: 'mono-ethylene-glycol-analysis',
        data: {
          isMenu: true,
          name: 'Mono Ethylene Glycol Analysis',
          icon: 'experiment',
          permissions: [
            'ROLE_VIEW_ALL_MONO_ETHYLENE_ANALYSIS',
            'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_OFFICER',
            'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_SHIFT_SUPERVISOR',
            'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_SUPERINTENDENT',
            'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_PLANT_MANAGER',
          ],
        },
        loadComponent: () =>
          import('./mono-ethylene-glycol-analysis/mono-ethylene-glycol-analyses.component').then(
            (m) => m.MonoEthyleneGlycolAnalysesComponent,
          ),
      },
      {
        matcher: (url) =>
          matchRoute(url, 'mono-ethylene-glycol-analysis', 'monoEthyleneGlycolAnalysisUid'),
        data: { permissions: ['ROLE_VIEW_MONO_ETHYLENE_ANALYSIS'] },
        loadComponent: () =>
          import('./mono-ethylene-glycol-analysis/mono-ethylene-glycol-analysis.component').then(
            (m) => m.MonoEthyleneGlycolAnalysisComponent,
          ),
      },
    ],
  },

  // FLOW ->  OFFICER - SHIFT SUPERVISOR - SUPERINTENDENT - PLANT MANAGER

  // ---power-reports---
  {
    path: 'power-reports',
    data: {
      isMenu: true,
      name: 'Power Generation',
      icon: 'flash',
      permissions: [
        'ROLE_VIEW_ALL_POWER_GENERATION_REPORT',
        'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_OFFICER',
        'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_PLANT_MANAGER',
      ],
    },
    loadComponent: () =>
      import('./power-reports/power-reports.component').then((m) => m.PowerReportsComponent),
  },
  {
    matcher: (url) => matchRoute(url, 'power-reports', 'powerReportUid'),
    data: { permissions: ['ROLE_VIEW_POWER_GENERATION_REPORT'] },
    loadComponent: () =>
      import('./power-reports/power-report.component').then((m) => m.PowerReportComponent),
  },

  // ---maintenance-reports---
  {
    path: 'maintenance-reports',
    data: {
      isMenu: true,
      name: 'Maintenance',
      icon: 'hand_fix',
      permissions: [
        'ROLE_VIEW_ALL_MAINTENANCE_REPORT',
        'ROLE_PROCESS_MAINTENANCE_REPORT_AS_OFFICER',
        'ROLE_PROCESS_MAINTENANCE_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_MAINTENANCE_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_MAINTENANCE_REPORT_AS_PLANT_MANAGER',
      ],
    },

    loadComponent: () =>
      import('./maintenance-reports/maintenance-reports.component').then(
        (m) => m.MaintenanceReportsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'maintenance-reports', 'maintenanceReportUid'),
    data: { permissions: ['ROLE_VIEW_MAINTENANCE_REPORT'] },
    loadComponent: () =>
      import('./maintenance-reports/maintenance-report.component').then(
        (m) => m.MaintenanceReportComponent,
      ),
  },

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
  {
    matcher: (url) => matchRoute(url, 'hse-reports', 'hseReportUid'),
    data: { permissions: ['ROLE_VIEW_HSE_REPORT'] },
    loadComponent: () =>
      import('../plants/hse-reports/hse-report.component').then((m) => m.HseReportComponent),
  },

  // ---security-reports---
  {
    path: 'security-reports',
    data: {
      isMenu: true,
      name: 'Security Reports',
      icon: 'shield_star',
      permissions: [
        'ROLE_VIEW_ALL_SECURITY_REPORT',
        'ROLE_PROCESS_SECURITY_REPORT_AS_OFFICER',
        'ROLE_PROCESS_SECURITY_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_SECURITY_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_SECURITY_REPORT_AS_PLANT_MANAGER',
      ],
    },
    loadComponent: () =>
      import('../plants/security-reports/security-reports.component').then(
        (m) => m.SecurityReportsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'security-reports', 'securityReportUid'),
    data: { permissions: ['ROLE_VIEW_SECURITY_REPORT'] },
    loadComponent: () =>
      import('../plants/security-reports/security-report.component').then(
        (m) => m.SecurityReportComponent,
      ),
  },

  {
    path: 'settings',
    data: { isMenu: true, name: 'Settings', icon: 'settings' },
    children: [
      // ---plant-form-groups---
      {
        path: 'plant-form-groups',
        data: {
          isMenu: true,
          name: 'Plant Form Groups',
          icon: 'file',
          permissions: ['ROLE_MANAGE_PLANT_FORM_GROUP'],
        },
        loadComponent: () =>
          import('./plant-form-groups/plant-form-groups.component').then(
            (m) => m.PlantFormGroupsComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'plant-form-groups', 'plantFormGroupUid'),
        loadComponent: () =>
          import('./plant-form-groups/plant-form-group.component').then(
            (m) => m.PlantFormGroupComponent,
          ),
      },

      // ---plant-form-items---
      {
        path: 'plant-form-items',
        data: {
          isMenu: true,
          name: 'All Plant Form Items',
          icon: 'list',
          permissions: ['ROLE_MANAGE_PLANT_FORM_GROUP'],
        },
        loadComponent: () =>
          import('./plant-form-items/plant-form-items.component').then(
            (m) => m.PlantFormItemsComponent,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'plant-form-items', 'plantFormItemUid'),
        loadComponent: () =>
          import('./plant-form-items/plant-form-item.component').then(
            (m) => m.PlantFormItemComponent,
          ),
      },
    ],
  },
];

export default PLANTS_ROUTES;

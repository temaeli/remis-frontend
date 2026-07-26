import { DailyReportItemSectionConfig } from './daily-report.interface';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import {
  GET_FUEL_FLARED_GASES_PAGEABLE,
  GET_FUEL_FLARED_GAS_ITEMS,
} from '../fuel-flared-gas/fuel-flared-gas.graphql';
import {
  GET_EXPORT_GAS_ANALYSIS_PAGEABLE,
  GET_EXPORT_GAS_ANALYSIS_ITEMS,
} from '../export-gas-analysis/export-gas-analysis.graphql';
import {
  GET_CONDENSATE_STORAGE_TANKS_PAGEABLE,
  GET_CONDENSATE_STORAGE_TANK_ITEMS,
} from '../condensate-storage-tanks/condensate-storage-tank.graphql';
import {
  GET_POTABLE_WATER_PRODUCTIONS_PAGEABLE,
  GET_POTABLE_WATER_PRODUCTION_ITEMS,
} from '../potable-water-production/potable-water-production.graphql';
import {
  GET_POTABLE_WATER_ANALYSIS_PAGEABLE,
  GET_POTABLE_WATER_ANALYSIS_ITEMS,
} from '../potable-water-analysis/potable-water-analysis.graphql';
import {
  GET_WASTE_WATER_ANALYSIS_PAGEABLE,
  GET_WASTE_WATER_ANALYSIS_ITEMS,
} from '../waste-water-analysis/waste-water-analysis.graphql';
import {
  GET_WASTE_WATER_PRODUCED_PAGEABLE,
  GET_WASTE_WATER_PRODUCED_ITEMS,
} from '../waste-water-produced/waste-water-produced.graphql';
import {
  GET_WATER_TANK_LEVELS_PAGEABLE,
  GET_WATER_TANK_LEVEL_ITEMS,
} from '../water-tank-levels/water-tank-level.graphql';
import {
  GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
  GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_ITEMS,
} from '../mono-ethylene-glycol-analysis/mono-ethylene-glycol-analysis.graphql';
import {
  GET_POWER_REPORTS_PAGEABLE,
  GET_POWER_GEN_REPORT_ITEMS,
} from '../power-reports/power-report.graphql';
import { GET_HSE_REPORTS_PAGEABLE, GET_HSE_FORM_ITEMS } from '../hse-reports/hse-report.graphql';
import {
  GET_SECURITY_REPORTS_PAGEABLE,
  GET_SECURITY_REPORT_ITEMS,
} from '../security-reports/security-report.graphql';
import {
  GET_MAINTENANCE_REPORTS_PAGEABLE,
  GET_MAINTENANCE_FORM_ITEMS,
} from '../maintenance-reports/maintenance-report.graphql';

/**
 * The plant-form-groups that are both populated with items AND wired to a real
 * report page (i.e. reachable from the sidebar) - the same 13 entities the
 * "My Reports"/process-permission fix targeted. Four other groups exist
 * (Air Compressor, Gas Export Compressor, Manpower Management, Pipeline Export)
 * but have no report component consuming them yet, so they're left out here too.
 */
export const DAILY_REPORT_ITEM_SECTIONS: DailyReportItemSectionConfig[] = [
  {
    title: 'Export Gas Analysis',
    inputType: PlantInputType.EXPORT_GAS_ANALYSIS,
    pageableQuery: GET_EXPORT_GAS_ANALYSIS_PAGEABLE,
    itemsQuery: GET_EXPORT_GAS_ANALYSIS_ITEMS,
    itemsVarKey: 'formUid',
    columns: [{ key: 'measure', label: 'Value' }],
  },
  {
    title: 'Fuel & Flared Gas',
    inputType: PlantInputType.FUEL_AND_FLARED_GAS,
    pageableQuery: GET_FUEL_FLARED_GASES_PAGEABLE,
    itemsQuery: GET_FUEL_FLARED_GAS_ITEMS,
    itemsVarKey: 'formUid',
    columns: [{ key: 'measure', label: 'Value' }],
  },
  {
    title: 'Potable Water Production',
    inputType: PlantInputType.POTABLE_WATER_PRODUCTION,
    pageableQuery: GET_POTABLE_WATER_PRODUCTIONS_PAGEABLE,
    itemsQuery: GET_POTABLE_WATER_PRODUCTION_ITEMS,
    itemsVarKey: 'reportUid',
    columns: [
      { key: 'previousDay', label: 'Previous Day' },
      { key: 'today', label: 'Today' },
    ],
  },
  {
    title: 'Condensate Storage Tanks',
    inputType: PlantInputType.CONDENSATE_STORAGE_TANK,
    pageableQuery: GET_CONDENSATE_STORAGE_TANKS_PAGEABLE,
    itemsQuery: GET_CONDENSATE_STORAGE_TANK_ITEMS,
    itemsVarKey: 'formUid',
    columns: [
      { key: 'tankA', label: 'Tank A' },
      { key: 'tankB', label: 'Tank B' },
    ],
  },
  {
    title: 'Waste Water Produced',
    inputType: PlantInputType.WASTE_WATER_PRODUCED,
    pageableQuery: GET_WASTE_WATER_PRODUCED_PAGEABLE,
    itemsQuery: GET_WASTE_WATER_PRODUCED_ITEMS,
    itemsVarKey: 'reportUid',
    columns: [
      { key: 'previousDay', label: 'Previous Day' },
      { key: 'today', label: 'Today' },
    ],
  },
  {
    title: 'Mono Ethylene Glycol Analysis',
    inputType: PlantInputType.MEGA,
    pageableQuery: GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
    itemsQuery: GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_ITEMS,
    itemsVarKey: 'reportUid',
    columns: [
      { key: 'concentration', label: 'Concentration (%)' },
      { key: 'ph', label: 'pH' },
    ],
  },
  {
    title: 'Waste Water Analysis',
    inputType: PlantInputType.WASTE_WATER_ANALYSIS,
    pageableQuery: GET_WASTE_WATER_ANALYSIS_PAGEABLE,
    itemsQuery: GET_WASTE_WATER_ANALYSIS_ITEMS,
    itemsVarKey: 'reportUid',
    columns: [{ key: 'testedResult', label: 'Tested Result' }],
  },
  {
    title: 'Potable Water Analysis',
    inputType: PlantInputType.POTABLE_WATER_ANALYSIS,
    pageableQuery: GET_POTABLE_WATER_ANALYSIS_PAGEABLE,
    itemsQuery: GET_POTABLE_WATER_ANALYSIS_ITEMS,
    itemsVarKey: 'formUid',
    columns: [
      { key: 'specification', label: 'Specification' },
      { key: 'testedResult', label: 'Tested Result' },
    ],
  },
  {
    title: 'Water Tanks Level',
    inputType: PlantInputType.WATER_TANK_LEVEL,
    pageableQuery: GET_WATER_TANK_LEVELS_PAGEABLE,
    itemsQuery: GET_WATER_TANK_LEVEL_ITEMS,
    itemsVarKey: 'formUid',
    columns: [{ key: 'measure', label: 'Value' }],
  },
  {
    title: 'Power Generation',
    inputType: PlantInputType.PGO,
    pageableQuery: GET_POWER_REPORTS_PAGEABLE,
    itemsQuery: GET_POWER_GEN_REPORT_ITEMS,
    itemsVarKey: 'formUid',
    columns: [
      { key: 'previousMwh', label: 'Prev. (MWh)' },
      { key: 'todayMwh', label: 'Today (MWh)' },
      { key: 'previousHours', label: 'Previous Run Hours' },
    ],
  },
  {
    title: 'HSE Records',
    inputType: PlantInputType.HSE,
    pageableQuery: GET_HSE_REPORTS_PAGEABLE,
    itemsQuery: GET_HSE_FORM_ITEMS,
    itemsVarKey: 'formUid',
    columns: [
      { key: 'count', label: 'Today' },
      { key: 'yearToDate', label: 'Year To Date' },
    ],
  },
  {
    title: 'Security Reports',
    inputType: PlantInputType.SECURITY,
    pageableQuery: GET_SECURITY_REPORTS_PAGEABLE,
    itemsQuery: GET_SECURITY_REPORT_ITEMS,
    itemsVarKey: 'reportUid',
    columns: [{ key: 'count', label: 'Count' }],
  },
  {
    title: 'Maintenance',
    inputType: PlantInputType.MAINTENANCE,
    pageableQuery: GET_MAINTENANCE_REPORTS_PAGEABLE,
    itemsQuery: GET_MAINTENANCE_FORM_ITEMS,
    itemsVarKey: 'reportUid',
    columns: [
      { key: 'plannedMaintenance', label: 'Planned' },
      { key: 'plannedMaintenanceDone', label: 'Done' },
      { key: 'plannedMaintenanceNotDone', label: 'Not Done' },
      { key: 'unPlannedMaintenanceDone', label: 'Unplanned Done' },
    ],
  },
];

/** Sections with no confirmed backend data source yet - rendered as label-only placeholders. */
export const DAILY_REPORT_PLACEHOLDER_SECTIONS: { title: string; note: string; rows: string[] }[] = [
  {
    title: 'Condensate Parameter',
    note: 'No data source configured for this section yet.',
    rows: ['Reid Vapour Pressure'],
  },
  {
    title: 'Hydrocarbon, Water Dew Point & Water Content',
    note: 'No data source configured for this section yet.',
    rows: ['HC Dew point', 'Water dew point', 'Water content'],
  },
  {
    title: 'Manpower Management',
    note: 'Manpower attendance is tracked per working station, not per plant, in this system - not wired up here yet.',
    rows: [
      'GASCO Employees',
      'Interns',
      'Field Students',
      'POLICE',
      'SUMA JKT',
      'Catering Service',
      'HouseKeeping Service',
      'Healthcare',
      'Casuals',
      'Contractors',
      'Total',
    ],
  },
];

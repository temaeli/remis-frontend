import { User } from 'app/routes/auth/auth.interface';

// ==================== PHASE 1: CNG STATION MANAGEMENT ====================

export interface CngStation {
  uid: string;
  code: string;
  name: string;
  stationType: CngStationType;
  region: string;
  location: string;
  contact: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User;
}

export enum CngStationType {
  MOTHER = 'MOTHER',
  DAUGHTER = 'DAUGHTER',
  FILLING = 'FILLING',
}

export interface CngStationDtoInput {
  uid?: string;
  code?: string;
  name: string;
  stationType?: CngStationType;
  region?: string;
  location?: string;
  contact?: string;
  description?: string;
}

export interface UserCngStation {
  id: number;
  current: boolean;
  cngStation: CngStation;
  user?: User;
}

// ==================== PHASE 2: DAILY REPORT (RPT-DL-04) ====================

export interface CngDailyReportDispenser {
  nozzleLabel: string;
  dispensedKg: number;
  orderIndex?: number;
}

export enum EquipmentType {
  GAS_COMPRESSOR = 'GAS_COMPRESSOR',
  AIR_COMPRESSOR = 'AIR_COMPRESSOR',
  GAS_ENGINE = 'GAS_ENGINE',
  GAS_DRIER = 'GAS_DRIER',
}

export interface CngDailyReportEquipmentRun {
  equipmentType: EquipmentType;
  label: string;
  prevHours: number;
  todayHours: number;
  last24Hours: number;
  kwh?: number; // for GAS_ENGINE
  dewPoint?: number; // for GAS_DRIER
  statusNote?: string;
  orderIndex?: number;
}

export interface CngDailyReportHseRecord {
  metric: string;
  todayCount: number;
  yearToDateCount: number;
  orderIndex?: number;
}

export interface CngDailyReportPersonnel {
  category: string;
  headcount: number;
  orderIndex?: number;
}

export interface CngDailyReportDtoInput {
  uid?: string;
  stationUid?: string; // optional staff override; normally omit (derived from user)
  reportDate: string; // yyyy-MM-dd, unique per station+date

  // Station availability
  unplannedDowntimeHours?: number;
  plannedOperatingHours?: number;
  availabilityPercent?: number;

  // Customers served
  customersTubeTrailers?: number;
  customersBuses?: number;
  customersCars?: number;
  customersBajaj?: number;

  // Gas consumption — CUMULATIVE METER READINGS (operator inputs)
  // Leave *Prev blank → the server AUTO-CARRIES yesterday's *Today reading.
  fmsMeterPrevScm?: number;
  fmsMeterTodayScm?: number;
  fuelGasPrevScm?: number;
  fuelGasTodayScm?: number;
  cascadeStoredKg?: number;

  // Gas consumption — DERIVED totals (read-only in response; sending a value acts as override)
  fmsMeterReadingScm?: number;
  fuelGasUsedScm?: number;
  totalGasDispensedScm?: number;
  totalGasDispensedKg?: number;
  compressedGasStoredScm?: number;
  gasVentedScm?: number;

  operationMaintenanceActivities?: string;
  preparedByName?: string;
  reviewedByName?: string;

  // Repeating sections (arrays — order preserved by orderIndex)
  dispensers?: CngDailyReportDispenser[];
  equipmentRuns?: CngDailyReportEquipmentRun[];
  hseRecords?: CngDailyReportHseRecord[];
  personnel?: CngDailyReportPersonnel[];

  // Legacy/simple fields still accepted (back-compat)
  openingPressureBarg?: number;
  closingPressureBarg?: number;
  gasInletSm3?: number;
  gasOutletSm3?: number;
  compressedVolumeSm3?: number;
  salesQuantitySm3?: number;
  salesAmountTzs?: number;
  downtimeHours?: number;
  hseIncidents?: number;
  narrative?: string;
}

export interface CngDailyReport {
  uid: string;
  stationUid: string;
  stationName: string; // denormalised snapshot
  reportDate: string;
  status: DistributionReportStatus;

  // Station availability
  unplannedDowntimeHours?: number;
  plannedOperatingHours?: number;
  availabilityPercent?: number;

  // Customers served
  customersTubeTrailers?: number;
  customersBuses?: number;
  customersCars?: number;
  customersBajaj?: number;

  // Gas consumption
  fmsMeterPrevScm?: number;
  fmsMeterTodayScm?: number;
  fmsMeterReadingScm?: number;
  fuelGasPrevScm?: number;
  fuelGasTodayScm?: number;
  fuelGasUsedScm?: number;
  totalGasDispensedScm?: number;
  totalGasDispensedKg?: number;
  cascadeStoredKg?: number;
  compressedGasStoredScm?: number;
  gasVentedScm?: number;

  operationMaintenanceActivities?: string;
  preparedByName?: string;
  reviewedByName?: string;

  // Repeating sections
  dispensers?: CngDailyReportDispenser[];
  equipmentRuns?: CngDailyReportEquipmentRun[];
  hseRecords?: CngDailyReportHseRecord[];
  personnel?: CngDailyReportPersonnel[];

  // Legacy fields
  openingPressureBarg?: number;
  closingPressureBarg?: number;
  gasInletSm3?: number;
  gasOutletSm3?: number;
  compressedVolumeSm3?: number;
  salesQuantitySm3?: number;
  salesAmountTzs?: number;
  downtimeHours?: number;
  hseIncidents?: number;
  narrative?: string;

  // Metadata
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User;
  approvedAt?: string;
  approvedByUser?: User;
  submittedAt?: string;
  submittedByUser?: User;
  migrated?: boolean;
  isDeleted?: boolean;
}

export enum DistributionReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ==================== PHASE 3: MONTHLY REPORT (RPT-MT) ====================

export interface CngMonthlyReportHseStat {
  item: string;
  numberOfCases: number;
  description?: string;
  orderIndex?: number;
}

export interface CngMonthlyReportMaintenanceSummary {
  workOrderCategory: string;
  issued: number;
  closed: number;
  inProgress: number;
  orderIndex?: number;
}

export interface CngMonthlyReportDtoInput {
  uid?: string;
  stationUid?: string; // station derived from user unless overridden
  year: number;
  month: number; // 1–12
  executiveSummary?: string;
  hseNarrative?: string;
  facilitiesNarrative?: string;
  administrationNarrative?: string;
  trainingNarrative?: string;
  preparedByName?: string;
  reviewedByName?: string;
  tanescoPowerUnits?: number; // monthly meter figures for the production table
  potableWaterM3?: number;

  // Child tables
  hseStats?: CngMonthlyReportHseStat[];
  maintenanceSummaries?: CngMonthlyReportMaintenanceSummary[];
}

export interface CngMonthlyReport {
  uid: string;
  station: CngStation;
  stationName: string;
  year: number;
  month: number;
  status: DistributionReportStatus;

  executiveSummary?: string;
  hseNarrative?: string;
  facilitiesNarrative?: string;
  administrationNarrative?: string;
  trainingNarrative?: string;
  preparedByName?: string;
  reviewedByName?: string;
  tanescoPowerUnits?: number;
  potableWaterM3?: number;

  // Child tables
  hseStats?: CngMonthlyReportHseStat[];
  maintenanceSummaries?: CngMonthlyReportMaintenanceSummary[];

  // Metadata
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User;
  approvedAt?: string;
  approvedByUser?: User;
  submittedAt?: string;
  submittedByUser?: User;
  isDeleted?: boolean;
}

// ==================== PRODUCTION SUMMARY (AUTO ROLL-UP) ====================

export interface CngProductionSummary {
  daysReported: number;
  totalGasDispensedKg: number;
  avgGasDispensedKgPerDay: number;
  totalFuelGasScm: number;
  totalGasVentedScm: number;
  customersTubeTrailers: number;
  customersBuses: number;
  customersCars: number;
  customersBajaj: number;
}

// ==================== WORKFLOW & COMMON ====================

export interface WorkflowActionDtoInput {
  uid: string;
  comments?: string;
}

export interface PageableParam {
  page: number;
  size: number;
  sort?: string;
}

export interface Page<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: any;
  size: number;
  sort: any;
  totalElements: number;
  totalPages: number;
}

export interface Response<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface ListResponse<T> {
  status: boolean;
  message: string;
  data: T[];
}

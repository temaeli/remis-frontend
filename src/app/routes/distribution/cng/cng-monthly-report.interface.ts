import { User } from 'app/routes/auth/auth.interface';
import { CngStation } from './cng-station.interface';

export enum DistributionReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

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
  hseStats?: CngMonthlyReportHseStat[];
  maintenanceSummaries?: CngMonthlyReportMaintenanceSummary[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  updatedBy?: User;
  approvedAt?: string;
  approvedByUser?: User;
  submittedAt?: string;
  submittedByUser?: User;
  isDeleted?: boolean;
}

export interface CngMonthlyReportDtoInput {
  uid?: string;
  stationUid?: string;
  year: number;
  month: number;
  executiveSummary?: string;
  hseNarrative?: string;
  facilitiesNarrative?: string;
  administrationNarrative?: string;
  trainingNarrative?: string;
  preparedByName?: string;
  reviewedByName?: string;
  tanescoPowerUnits?: number;
  potableWaterM3?: number;
  hseStats?: CngMonthlyReportHseStat[];
  maintenanceSummaries?: CngMonthlyReportMaintenanceSummary[];
}

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

export interface WorkflowActionDtoInput {
  uid: string;
  comments?: string;
}

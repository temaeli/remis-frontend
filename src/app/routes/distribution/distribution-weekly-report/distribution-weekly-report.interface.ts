export interface DistributionWeeklyOperationReport {
  active?: boolean;
  approvedAt?: string;
  approvedByUser?: any;
  approverComments?: string;
  correctiveMaintenanceCompleted?: number;
  createdAt?: string;
  createdBy?: any;
  deletedAt?: string;
  deletedBy?: number;
  firstAidCases?: number;
  hseNarrative?: string;
  id?: number;
  isDeleted?: boolean;
  lostTimeInjuries?: number;
  maintenanceNarrative?: string;
  manHoursWorked?: number;
  migrated?: boolean;
  nearMissCount?: number;
  operationsNarrative?: string;
  preventiveMaintenanceCompleted?: number;
  region?: DistributionRegion;
  reviewedAt?: string;
  reviewedByUser?: any;
  reviewerComments?: string;
  status: DistributionReportStatus;
  submittedAt?: string;
  submittedByUser?: any;
  totalConsumptionMmscf?: number;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
  weekEndDate: string;
  weekStartDate: string;
}

export interface DistributionWeeklyOperationReportDtoInput {
  correctiveMaintenanceCompleted?: number;
  firstAidCases?: number;
  hseNarrative?: string;
  lostTimeInjuries?: number;
  maintenanceNarrative?: string;
  manHoursWorked?: number;
  nearMissCount?: number;
  operationsNarrative?: string;
  preventiveMaintenanceCompleted?: number;
  region: DistributionRegion;
  totalConsumptionMmscf?: number;
  uid?: string;
  weekEndDate: string;
  weekStartDate: string;
}

export enum DistributionReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
export enum DistributionRegion {
  COASTAL = 'COASTAL',
  DAR_ES_SALAAM = 'DAR_ES_SALAAM',
  LINDI = 'LINDI',
  MTWARA = 'MTWARA',
}

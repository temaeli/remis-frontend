import { DistributionReportStatus } from '@routes/distribution/cng/cng-monthly-report.interface';

export { DistributionReportStatus };

export interface AnticipatedProductionPlant {
  uid: string;
  name: string;
}

export interface AnticipatedProductionUser {
  uid: string;
  fullName: string;
}

export interface AnticipatedProduction {
  uid: string;
  plant: AnticipatedProductionPlant;
  productionDate: string;
  anticipatedMmscfd: number;
  anticipatedSm3PerDay?: number;
  remarks?: string;
  status: DistributionReportStatus;
  submittedByUser?: AnticipatedProductionUser;
  submittedAt?: string;
  reviewedByUser?: AnticipatedProductionUser;
  reviewedAt?: string;
  reviewComments?: string;
  createdAt: string;
  updatedAt: string;
  id: number;
  active: boolean;
  isDeleted: boolean;
}

export interface AnticipatedProductionDtoInput {
  uid?: string;
  plantUid: string;
  productionDate: string;
  anticipatedMmscfd: number;
  anticipatedSm3PerDay?: number;
  remarks?: string;
}

export interface WorkflowActionDtoInput {
  uid: string;
  comments?: string;
}

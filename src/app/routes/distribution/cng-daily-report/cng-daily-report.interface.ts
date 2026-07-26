import { User } from 'app/routes/auth/auth.interface';

export interface CngDailyReport {
  active: boolean;
  approvedAt: string;
  approvedByUser: User;
  closingPressureBarg: number;
  compressedVolumeSm3: number;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  downtimeHours: number;
  gasInletSm3: number;
  gasOutletSm3: number;
  hseIncidents: number;
  id: number;
  isDeleted: boolean;
  migrated: boolean;
  narrative: string;
  openingPressureBarg: number;
  reportDate: string;
  salesAmountTzs: number;
  salesQuantitySm3: number;
  stationName: string;
  status: DistributionReportStatus;
  submittedAt: string;
  submittedByUser: User;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}

export interface CngDailyReportDtoInput {
  closingPressureBarg: number;
  compressedVolumeSm3: number;
  downtimeHours: number;
  gasInletSm3: number;
  gasOutletSm3: number;
  hseIncidents: number;
  narrative: string;
  openingPressureBarg: number;
  reportDate: string;
  salesAmountTzs: number;
  salesQuantitySm3: number;
  stationName: string;
  uid: string;
}

export enum DistributionReportStatus {
  APPROVED = 'APPROVED',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED',
  REVIEWED = 'REVIEWED',
  SUBMITTED = 'SUBMITTED',
}

export interface WorkflowActionDtoInput {
  comments?: string;
  uid: string;
}

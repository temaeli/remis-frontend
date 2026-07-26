export enum DrillStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  ENDORSED = 'ENDORSED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface HseDrill {
  uid?: string;
  category?: string;
  location?: string;
  financialYear?: string;
  quarter?: number;
  description?: string;
  observation?: string;
  recommendation?: string;
  dateConducted?: string;
  status?: DrillStatus;
  submittedAt?: string;
  reviewedAt?: string;
  endorsedAt?: string;
  supervisorComments?: string;
  managerComments?: string;
  active?: boolean;
  createdAt?: string;
}

export interface HseDrillDtoInput {
  uid?: string;
  category: string;
  location: string;
  financialYear: string;
  quarter: number;
  description?: string;
  observation?: string;
  recommendation?: string;
}

export interface HseDrillWorkflowDtoInput {
  uid: string;
  comments?: string;
}

export interface HseDrillDataDtoInput {
  uid: string;
  dateConducted: string;
  observation?: string;
  recommendation?: string;
  description?: string;
}

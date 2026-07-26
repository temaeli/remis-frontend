import { User } from '@routes/auth/auth.interface';
import { Department } from '@routes/settings/departments/department.interface';
import { ComplianceRegistrationStage, Currency } from '../compliance-common/compliance-common';

export interface ContractRegistration {
  active?: boolean;
  amount?: number;
  contractDate?: string;
  contractManager?: string;
  contractNumber?: string;
  contractType?: ContractType;
  createdAt?: string;
  createdBy?: User;
  currency?: Currency;
  deletedAt?: string;
  deletedBy?: number;
  department?: Department;
  duration?: number;
  endDate?: string;
  executionStatus?: ContractExecutionStatus;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  name?: string;
  otherCurrency?: string;
  otherType?: string;
  serviceProvider?: string;
  stage: ComplianceRegistrationStage;

  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export enum ContractExecutionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

export enum ContractType {
  ADDENDUM = 'ADDENDUM',
  MoU = 'MoU',
  OTHER = 'OTHER',
  PROCUREMENT = 'PROCUREMENT',
}

import { User } from '@routes/auth/auth.interface';
import { Department } from '@routes/settings/departments/department.interface';
import { AttachmentDtoInput } from '@shared/components/generic-form/attachment/attachment.interface';
import { ComplianceRegistrationStage, Currency } from '../compliance-common/compliance-common';

export interface InsuranceRegistration {
  active?: boolean;
  coverage?: string;
  createdAt?: string;
  createdBy?: User;
  currency?: Currency;
  deletedAt?: string;
  deletedBy?: number;
  department?: Department;
  duration?: number;
  endDate?: string;
  id?: number;
  insuranceType?: InsuranceType;
  isDeleted?: boolean;
  migrated?: boolean;
  nameOfAsset?: string;
  otherCurrency?: string;
  startDate?: string;
  statusOfIncident?: string;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
  value?: number;
  stage?: ComplianceRegistrationStage;
}

export interface InsuranceRegistrationDtoInput {
  attachments?: AttachmentDtoInput[];
  coverage?: string;
  currency?: Currency;
  duration?: number;
  endDate?: string;
  insuranceType?: InsuranceType;
  nameOfAsset?: string;
  otherCurrency?: string;
  startDate?: string;
  statusOfIncident?: string;
  uid?: string;
  value?: number;
}

export enum InsuranceType {
  COMPREHENSIVE = 'COMPREHENSIVE',
  THIRD_PART = 'THIRD_PART',
}

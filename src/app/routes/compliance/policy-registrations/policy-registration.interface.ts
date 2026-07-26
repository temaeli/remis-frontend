import { User } from '@routes/auth/auth.interface';
import { Department } from '@routes/settings/departments/department.interface';
import { AttachmentDtoInput } from '@shared/components/generic-form/attachment/attachment.interface';
import { ComplianceRegistrationStage } from '../compliance-common/compliance-common';

export interface PolicyRegistration {
  active?: boolean;
  applicability?: string;
  createdAt?: string;
  createdBy?: User;
  dateOfReview?: string;
  deletedAt?: string;
  deletedBy?: number;
  department?: Department;
  endorsementDate?: string;
  expirationDate?: string;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  name?: string;
  reviewStatus?: PolicyReviewStatus;
  uid?: string;
  stage?: ComplianceRegistrationStage;
  updatedAt?: string;
  updatedBy?: number;
}

export interface PolicyRegistrationDtoInput {
  applicability?: string;
  attachments?: AttachmentDtoInput[];
  dateOfReview?: string;
  departmentUid?: number;
  endorsementDate?: string;
  expirationDate?: string;
  name?: string;
  reviewStatus?: PolicyReviewStatus;
  uid?: string;
}

export enum PolicyReviewStatus {
  GOOD = 'GOOD',
  POOR = 'POOR',
}

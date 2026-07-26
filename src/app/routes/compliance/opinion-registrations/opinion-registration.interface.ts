import { User } from '@routes/auth/auth.interface';
import { Department } from '@routes/settings/departments/department.interface';
import { AttachmentDtoInput } from '@shared/components/generic-form/attachment/attachment.interface';
import { ComplianceRegistrationStage } from '../compliance-common/compliance-common';

export interface OpinionRegistration {
  active?: boolean;
  createdAt?: string;
  createdBy?: User;
  deletedAt?: string;
  deletedBy?: number;
  findingStatus?: string;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  name?: string;
  nature?: string;
  resolutionStatus?: string;
  responsibleUnit?: Department;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
  valueObtained?: string;
  stage?: ComplianceRegistrationStage;
}

export interface OpinionRegistrationDtoInput {
  attachments?: AttachmentDtoInput[];
  findingStatus?: string;
  name?: string;
  nature?: string;
  resolutionStatus?: string;
  responsibleDepartmentUid?: string;
  uid?: string;
  valueObtained?: string;
}

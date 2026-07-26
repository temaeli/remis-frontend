import { User } from '@routes/auth/auth.interface';
import { Department } from '@routes/settings/departments/department.interface';
import { SubWard } from '@routes/settings/regions/subward/subward.form';
import { AttachmentDtoInput } from '@shared/components/generic-form/attachment/attachment.interface';
import { ComplianceRegistrationStage, Currency } from '../compliance-common/compliance-common';

export interface CaseRegistration {
  active?: boolean;
  amount?: number;
  createdAt?: string;
  createdBy?: User;
  currency?: Currency;
  dateOfSchedules?: string;
  decistion?: string;
  deletedAt?: string;
  deletedBy?: number;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  name?: string;
  natureOfCase?: CaseNature;
  otherCurrency?: string;
  otherNature?: string;
  place?: SubWard;
  responsibleInstitution?: string;
  responsibleOfficer?: User;
  responsibleUnit?: Department;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
  year?: number;
  stage?: ComplianceRegistrationStage;
}

export interface CaseRegistrationDtoInput {
  amount?: number;
  attachments?: AttachmentDtoInput[];
  currency?: Currency;
  dateOfSchedules?: string;
  decision?: string;
  name?: string;
  natureOfCase?: CaseNature;
  otherCurrency?: string;
  otherNature?: string;
  placeUid?: string;
  responsibleDepartmentUid?: string;
  responsibleInstitution?: string;
  responsibleOfficerUid?: string;
  uid?: string;
  year?: number;
}

export enum CaseNature {
  ARBITTRATION = 'ARBITTRATION',
  CIVIL = 'CIVIL',
  CRIMINAL = 'CRIMINAL',
  GRIEVANCES = 'GRIEVANCES',
  LABOUR_DISPUTE = 'LABOUR_DISPUTE',
  MEDIATION = 'MEDIATION',
  OTHER = 'OTHER',
  TORT = 'TORT',
}

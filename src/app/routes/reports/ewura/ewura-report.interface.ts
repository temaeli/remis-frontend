import { ProcessStatus } from '@shared/crud';
import { ReportTemplateType } from 'app/routes/settings/report-template/report-template.interface';

export interface EwuraReport {
  id?: number;
  uid?: string;
  sourceId?: string;
  section?: SectionEnum;
  startDate?: string;
  endDate?: string;
  description?: string;
  content?: string;
  status?: ProcessStatus;
  currentStage?: ReportStage;
  template?: ReportSummary;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportSummary {
  uid?: string;
  name?: string;
  templateType?: ReportTemplateType;
}

export interface ReportDtoInput {
  uid?: string;
  templateUid: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface ReportFilterDtoInput {
  section?: SectionEnum;
  status?: ProcessStatus;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export interface ReportStageActor {
  uid?: string;
  sequence?: number;
  action?: string;
  role?: { uid?: string; name?: string; permissionList?: { name?: string }[] };
}

export interface ReportStage {
  id?: number;
  uid?: string;
  assignedTo?: ReportStageActor;
  status?: ApprovalStatus;
  actedAt?: string;
  comments?: string;
  actor?: { uid?: string; firstName?: string; lastName?: string };
  active?: boolean;
  createdAt?: string;
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum SectionEnum {
  PIPELINE = 'PIPELINE',
  PLANT = 'PLANT',
  REPORT = 'REPORT',
  SECURITY = 'SECURITY',
  HSE = 'HSE',
}

export interface ReportOutputDto {
  fileName?: string;
  content?: string;
  fileType?: ReportOutputFormat;
}

export enum ReportOutputFormat {
  EXCEL = 'EXCEL',
  PDF = 'PDF',
}

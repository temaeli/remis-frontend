import { ProcessStatus } from '@shared/crud';
import { ReportTemplateType } from 'app/routes/settings/report-template/report-template.interface';

export interface PipelineReport {
  id?: number;
  uid?: string;
  sourceId?: string;
  section?: SectionEnum;
  date?: string;
  startDate?: string;
  endDate?: string;
  summaryType?: PipelineReportSummaryTypeEnum;
  description?: string;
  operationStatus?: string;
  constructionProgress?: string;
  majorMaintenanceStatus?: string;
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
  date?: string;
  startDate?: string;
  endDate?: string;
  reportSummaryType?: PipelineReportSummaryTypeEnum;
  description?: string;
  operationStatus?: string;
  constructionProgress?: string;
  majorMaintenanceStatus?: string;
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
}

export enum PipelineReportSummaryTypeEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTELY = 'QUARTELY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  NINE_MONTH = 'NINE_MONTH',
  ANNUAL = 'ANNUAL',
  SELECTED_PERIOD = 'SELECTED_PERIOD',
  SINCE_START = 'SINCE_START',
}

export const PIPELINE_REPORT_SUMMARY_TYPE_OPTIONS: { value: PipelineReportSummaryTypeEnum; label: string }[] = [
  { value: PipelineReportSummaryTypeEnum.DAILY, label: 'Daily' },
  { value: PipelineReportSummaryTypeEnum.WEEKLY, label: 'Weekly' },
  { value: PipelineReportSummaryTypeEnum.MONTHLY, label: 'Monthly' },
  { value: PipelineReportSummaryTypeEnum.QUARTELY, label: 'Quarterly' },
  { value: PipelineReportSummaryTypeEnum.SEMI_ANNUAL, label: 'Semi Annual' },
  { value: PipelineReportSummaryTypeEnum.NINE_MONTH, label: 'Nine Month' },
  { value: PipelineReportSummaryTypeEnum.ANNUAL, label: 'Annual' },
  { value: PipelineReportSummaryTypeEnum.SELECTED_PERIOD, label: 'Selected Period' },
];

export interface ReportOutputDto {
  fileName?: string;
  content?: string;
  fileType?: ReportOutputFormat;
}

export enum ReportOutputFormat {
  EXCEL = 'EXCEL',
  PDF = 'PDF',
}

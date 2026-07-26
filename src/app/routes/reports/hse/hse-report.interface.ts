import { ProcessStatus } from '@shared/crud';
import { ReportTemplateType } from 'app/routes/settings/report-template/report-template.interface';

export {
  ApprovalStatus,
  SectionEnum,
  ReportOutputFormat,
} from '../ewura/ewura-report.interface';
export type {
  ReportSummary,
  ReportDtoInput,
  ReportFilterDtoInput,
  ReportStageActor,
  ReportStage,
  ReportOutputDto,
} from '../ewura/ewura-report.interface';

import type { ReportStage } from '../ewura/ewura-report.interface';
import { SectionEnum } from '../ewura/ewura-report.interface';

export interface HseReport {
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
  template?: {
    uid?: string;
    name?: string;
    templateType?: ReportTemplateType;
  };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { BaseEntity } from '@shared/components/details/util/util.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { Plant } from '../plants/plant.interface';

export interface ExportGasAnalysis extends BaseEntity {
  approvalStatus: ApprovalStatus;
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages?: PlantDailyReportStage[];
}

export interface ExportGasAnalysisItem extends BaseEntity {
  exportGasAnalysis: ExportGasAnalysis;
  item: PlantFormItem;
  measure: number;
}

export interface ExportGasAnalysisInputDtoInput {
  itemUid: string;
  measure: number;
  uid?: string;
}

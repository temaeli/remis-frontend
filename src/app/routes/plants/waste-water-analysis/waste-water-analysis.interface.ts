import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { BaseEntity } from '@shared/components/details/util/util.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { Plant } from '../plants/plant.interface';

export interface WasteWaterAnalysis extends BaseEntity {
  approvalStatus: ApprovalStatus;
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages?: PlantDailyReportStage[];
}

export interface WasteWaterAnalysisItem extends BaseEntity {
  item: PlantFormItem;
  testedResult: number;
  wasteWaterAnalysis: WasteWaterAnalysis;
}

export interface WasteWaterAnalysisDataInputDtoInput {
  itemUid: string;
  testedResult: number;
}

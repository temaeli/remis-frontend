import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { BaseEntity } from '@shared/components/details/util/util.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { Plant } from '../plants/plant.interface';

export interface PotableWaterAnalysis extends BaseEntity {
  approvalStatus: ApprovalStatus;
  items?: PotableWaterAnalysisItem[];
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages?: PlantDailyReportStage[];
}

export interface PotableWaterAnalysisItem extends BaseEntity {
  item: PlantFormItem;
  potableWaterAnalysis: PotableWaterAnalysis;
  specification?: string;
  testedResult: number;
}

export interface PotableWaterAnalysisDataInputDtoInput {
  itemUid: string;
  testedResult: number;
  uid?: string;
}

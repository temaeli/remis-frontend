import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { BaseEntity } from '@shared/components/details/util/util.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { Plant } from '../plants/plant.interface';

export interface WaterTankLevel extends BaseEntity {
  approvalStatus: ApprovalStatus;
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages?: PlantDailyReportStage[];
}

export interface WaterTankLevelItem extends BaseEntity {
  item: PlantFormItem;
  measure: number;
  waterTankLevel: WaterTankLevel;
}

export interface WaterTankLevelDataInputDtoInput {
  itemUid: string;
  measure: number;
  uid?: string;
}

import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { BaseEntity } from '@shared/components/details/util/util.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { Plant } from '../plants/plant.interface';

export interface PotableWaterProduction extends BaseEntity {
  approvalStatus: ApprovalStatus;
  items?: PotableWaterProductionItem[];
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages?: PlantDailyReportStage[];
}

export interface PotableWaterProductionItem extends BaseEntity {
  item: PlantFormItem;
  potableWaterProduction: PotableWaterProduction;
  previousDay: number;
  today: number;
}

export interface WaterDataInputFormDtoInput {
  itemUid: string;
  today?: number;
  uid?: string;
}

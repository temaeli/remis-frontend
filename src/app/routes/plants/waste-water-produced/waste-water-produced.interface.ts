import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { BaseEntity } from '@shared/components/details/util/util.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { Plant } from '../plants/plant.interface';

export interface WasteWaterProduced extends BaseEntity {
  approvalStatus: ApprovalStatus;
  items?: WasteWaterProducedItem[];
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages?: PlantDailyReportStage[];
}

export interface WasteWaterProducedItem extends BaseEntity {
  item: PlantFormItem;
  previousDay: number;
  today: number;
  wasteWaterProduced: WasteWaterProduced;
}

export interface WaterDataInputFormDtoInput {
  itemUid: string;
  today?: number;
  uid?: string;
}

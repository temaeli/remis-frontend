import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { BaseEntity } from '@shared/components/details/util/util.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { Plant } from '../plants/plant.interface';

export interface CondensateStorageTank extends BaseEntity {
  approvalStatus: ApprovalStatus;
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages?: PlantDailyReportStage[];
}

export interface CondensateStorageTankItem extends BaseEntity {
  condensateStorageTank: CondensateStorageTank;
  item: PlantFormItem;
  tankA: number;
  tankB: number;
  uoM?: string;
}

export interface CondensateTankDataInputDtoInput {
  itemUid: string;
  tankA: number;
  tankB: number;
  uid?: string;
}

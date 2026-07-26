import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { BaseEntity } from '@shared/components/details/util/util.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { Plant } from '../plants/plant.interface';

export interface FuelFlaredGas extends BaseEntity {
  approvalStatus: ApprovalStatus;
  items?: FuelFlaredGasItem[];
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages?: PlantDailyReportStage[];
}

export interface FuelFlaredGasItem extends BaseEntity {
  fuelFlaredGas: FuelFlaredGas;
  item: PlantFormItem;
  measure: number;
}

export interface FuelFlaredGasDataInputDtoInput {
  itemUid: string;
  measure: number;
}

import { BaseEntity } from '@shared/components/details/util/util.interface';
import { Plant } from '../plants/plant.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';

export interface PowerReport extends BaseEntity {
  approvalStatus: ApprovalStatus;
  createdAtDate?: string;
  name: string;
  plant: Plant;
}

export interface PowerFormItem extends BaseEntity {
  form: PowerReport;
  item: PlantFormItem;
  last24Hours: number;
  powerDemand: number;
  previousHours: number;
  previousMwh: number;
  todayHours: number;
  todayMwh: number;
}

export interface PowerDataInputFormDtoInput {
  powerDemand: number;
  todayHours: number;
  todayMwh: number;
  itemUid: string;
  uid: string;
}

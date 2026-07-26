import { BaseEntity } from '@shared/components/details/util/util.interface';
import { Plant } from '../plants/plant.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';

export interface WaterTechnicianReport extends BaseEntity {
  approvalStatus: ApprovalStatus;
  name: string;
  plant: Plant;
  items: WaterTechnicianFormItem[];
}

export interface WaterTechnicianFormItem extends BaseEntity {
  form: WaterTechnicianReport;
  item: PlantFormItem;
  today: number;
  previousDay: number;
}

export interface WaterDataInputFormDtoInput {
  today: number;
  itemUid: string;
  uid: string;
}

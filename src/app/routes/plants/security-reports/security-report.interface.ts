import { BaseEntity } from '@shared/components/details/util/util.interface';
import { Plant } from '../plants/plant.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';

export interface SecurityReport extends BaseEntity {
  approvalStatus: ApprovalStatus;
  name: string;
  plant: Plant;
}

export interface SecurityFormItem extends BaseEntity {
  form: SecurityReport;
  item: PlantFormItem;
  count: number;
}

export interface SecurityDataInputFormDtoInput {
  count: number;
  itemUid: string;
  uid: string;
}

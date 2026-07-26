import { BaseEntity } from '@shared/components/details/util/util.interface';
import { Plant } from '../plants/plant.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';

export interface FieldEngineerReport extends BaseEntity {
  approvalStatus: ApprovalStatus;
  items?: FieldEnginnerFormItem[];
  name: string;
  plant: Plant;
}

export interface FieldEnginnerFormItem extends BaseEntity {
  form: FieldEngineerReport;
  item: PlantFormItem;
  previousRunHours: number;
  runHours: number;
}

export interface FieldDataInputFormDtoInput {
  itemUid: number;
  runHours: number;
  uid?: string;
}

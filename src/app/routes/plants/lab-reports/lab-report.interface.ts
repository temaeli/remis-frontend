import { BaseEntity } from '@shared/components/details/util/util.interface';
import { Plant } from '../plants/plant.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';

export interface LabReport extends BaseEntity {
  approvalStatus: ApprovalStatus;
  name: string;
  plant: Plant;
}

export interface LabFormItem extends BaseEntity {
  form: LabReport;
  item: PlantFormItem;
  measuredValue: number;
  uoM?: UnitOfMeasure;
}

export interface LabDataInputFormDtoInput {
  measuredValue: number;
  uoM?: UnitOfMeasure;
  itemUid: string;
  uid?: string;
}

export enum UnitOfMeasure {
  KILOGRRAM_PER_CUBIC_METER = 'KILOGRRAM_PER_CUBIC_METER',
  MEGA_JOULES_PER_CUBIC_METER = 'MEGA_JOULES_PER_CUBIC_METER',
  Mole = 'Mole',
}

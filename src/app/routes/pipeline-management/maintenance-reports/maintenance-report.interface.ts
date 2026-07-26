import { PlantFormItem } from '@routes/plants/plant-form-items/plant-form-item.interface';

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum StageEnum {
  OFFICER = 'OFFICER',
  SHIFT_SUPERVISOR = 'SHIFT_SUPERVISOR',
}

export interface MaintenanceFormItem {
  uid?: string;
  item?: PlantFormItem;
  plannedMaintenance?: number;
  plannedMaintenanceDone?: number;
  plannedMaintenanceNotDone?: number;
  unPlannedMaintenanceDone?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineMaintenanceReport {
  id?: number;
  uid?: string;
  name?: string;
  remarks?: string;
  comment?: string;
  approvalStatus?: ApprovalStatus;
  stage?: StageEnum;
  createdAtDate?: string;
  pipeline?: { uid: string; name: string };
  createdBy?: any;
  items?: MaintenanceFormItem[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// verbatim BE typo — mirrors MaintanceInputFormDto class name in Java
export interface MaintanceInputFormDto {
  itemUid: string;
  plannedMaintenance: number;
  plannedMaintenanceDone: number;
  plannedMaintenanceNotDone: number;
  unPlannedMaintenanceDone: number;
}

export interface PipelineMaintenanceReportDto {
  uid?: string;
  pipelineUid: string;
  date?: string;
  remarks?: string;
  inputs: MaintanceInputFormDto[];
}

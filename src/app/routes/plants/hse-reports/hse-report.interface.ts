import { BaseEntity } from '@shared/components/details/util/util.interface';
import { Plant } from '../plants/plant.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { User } from '@routes/auth/auth.interface';
import { LabReport } from '../lab-reports/lab-report.interface';
import { FieldEngineerReport } from '../field-engineer-reports/field-engineer-report.interface';
import { MaintenanceReport } from '../maintenance-reports/maintenance-report.interface';
import { PlantExportReading } from '../plant-export-readings/plant-export-reading.interface';
import { PowerReport } from '../power-reports/power-report.interface';
import { SecurityReport } from '../security-reports/security-report.interface';

export interface HseReport extends BaseEntity {
  approvalStatus: ApprovalStatus;
  stage: StageEnum;
  stages: HseStage[];
  name: string;
  plant: Plant;
}

export interface HseFormItem extends BaseEntity {
  form: HseReport;
  item: PlantFormItem;
  prevCount: number;
  count: number;
}

export interface HseDataInputFormDtoInput {
  count: number;
  itemUid: string;
  uid: string;
}

export interface ProcessingDtoInput {
  decision: Decision;
  comment: string;
  uid: string;
}

export enum Decision {
  APPROVE = 'APPROVE',
  ROLLBACK = 'ROLLBACK',
}

export interface HseStage extends BaseEntity {
  active: boolean;
  comment: string;
  createdBy: User;
  current: boolean;
  description: string;
  previousStage: HseStage;
  report: HseReport;
  sentBy: User;
  stage: StageEnum;
  uid: string;
}

export enum StageEnum {
  APPROVED = 'APPROVED',
  OFFICER = 'OFFICER',
  PLANT_MANAGER = 'PLANT_MANAGER',
  SHIFT_SUPERVISOR = 'SHIFT_SUPERVISOR',
  SUPERINTENDENT = 'SUPERINTENDENT',
}

export interface PlantDailyReportStage {
  active: boolean;
  comment: string;
  condensateStorageTank: any; // CondensateStorageTank;
  createdAt: string;
  createdBy: User;
  current: boolean;
  deletedAt: string;
  deletedBy: number;
  description: string;
  exportGasAnalysis: any; // ExportGasAnalysis;
  exportReading: PlantExportReading;
  fieldReport: FieldEngineerReport;
  fuelFlaredGas: any; // FuelFlaredGas;
  hseReport: HseReport;
  id: number;
  isDeleted: boolean;
  labReport: LabReport;
  maintenanceReport: MaintenanceReport;
  migrated: boolean;
  monoEthyleneGlycolAnalysis: any; // MonoEthyleneGlycolAnalysis;
  potableWaterAnalysis: any; // PotableWaterAnalysis;
  potableWaterProduction: any; // PotableWaterProduction;
  powerReport: PowerReport;
  previousStage: PlantDailyReportStage;
  securityReport: SecurityReport;
  sentBy: User;
  stage: StageEnum;
  uid: string;
  updatedAt: string;
  updatedBy: number;
  wasteWaterAnalysis: any; // WasteWaterAnalysis;
  wasteWaterProduced: any; // WasteWaterProduced;
  waterTankLevel: any; // WaterTankLevel;
}

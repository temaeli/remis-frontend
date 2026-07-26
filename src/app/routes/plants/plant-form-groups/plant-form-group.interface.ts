import { User } from 'app/routes/auth/auth.interface';

export interface PlantFormGroup {
  active?: boolean;
  createdAt?: string;
  createdBy?: User;
  deletedAt?: string;
  deletedBy?: number;
  id?: number;
  isDeleted?: boolean;
  inputType?: PlantInputType;
  migrated?: boolean;
  name?: string;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export interface PlantFormGroupDtoInput {
  name?: string;
  uid?: string;
  inputType: PlantInputType;
}

export enum PlantInputType {
  AIR_COMPRESSOR = 'AIR_COMPRESSOR',
  CONDENSATE_STORAGE_TANK = 'CONDENSATE_STORAGE_TANK',
  EXPORT_GAS_ANALYSIS = 'EXPORT_GAS_ANALYSIS',
  FUEL_AND_FLARED_GAS = 'FUEL_AND_FLARED_GAS',
  GAS_EXPORT_COMPRESSOR = 'GAS_EXPORT_COMPRESSOR',
  HSE = 'HSE',
  MAINTENANCE = 'MAINTENANCE',
  MANPOWER_MANAGEMENT = 'MANPOWER_MANAGEMENT',
  MEGA = 'MEGA',
  PGO = 'PGO',
  PIPELINE_EXPORT = 'PIPELINE_EXPORT',
  POTABLE_WATER_ANALYSIS = 'POTABLE_WATER_ANALYSIS',
  POTABLE_WATER_PRODUCTION = 'POTABLE_WATER_PRODUCTION',
  SECURITY = 'SECURITY',
  WASTE_WATER_ANALYSIS = 'WASTE_WATER_ANALYSIS',
  WASTE_WATER_PRODUCED = 'WASTE_WATER_PRODUCED',
  WATER_TANK_LEVEL = 'WATER_TANK_LEVEL',
}

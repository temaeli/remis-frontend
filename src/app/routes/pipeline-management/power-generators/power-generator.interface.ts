import { WorkingStation } from '../working-stations/working-station.interface';

export interface PowerGenerator {
  id?: number;
  uid?: string;
  code?: string;
  name?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  capacityKva?: number;
  capacityKw?: number;
  voltage?: number;
  frequencyHz?: number;
  phaseType?: PhaseType;
  powerFactor?: number;
  fuelType?: FuelType;
  fuelTankCapacityLiters?: number;
  fuelConsumptionPerHour?: number;
  remarks?: string;
  engineNumber?: string;
  engineModel?: string;
  engineManufacturer?: string;
  installationDate?: string;
  commissioningDate?: string;
  operatingHours?: number;
  status?: GeneratorOperatingStatus;
  conditionStatus?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  maintenanceIntervalHours?: number;
  minimumVolume?: number;
  workStation?: WorkingStation;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PowerGeneratorDtoInput {
  uid?: string;
  workStationUid: string;
  code: string;
  name: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  capacityKva: number;
  capacityKw: number;
  voltage: number;
  frequencyHz?: number;
  phaseType: PhaseType;
  powerFactor?: number;
  fuelType: FuelType;
  fuelTankCapacityLiters: number;
  fuelConsumptionPerHour: number;
  engineNumber?: string;
  engineModel?: string;
  engineManufacturer?: string;
  installationDate?: string;
  commissioningDate?: string;
  operatingHours?: number;
  status?: GeneratorOperatingStatus;
  conditionStatus?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  maintenanceIntervalHours?: number;
  minimumVolume?: number;
}

export enum GeneratorOperatingStatus {
  IN_OPERATION = 'IN_OPERATION',
  FAULT = 'FAULT',
  MAINTENANCE = 'MAINTENANCE',
}

export enum PhaseType {
  SINGLE_PHASE = 'SINGLE_PHASE',
  THREE_PHASE = 'THREE_PHASE',
}

export enum FuelType {
  DIESEL = 'DIESEL',
  PETROL = 'PETROL',
  GAS = 'GAS',
  NATURAL_GAS = 'NATURAL_GAS',
  BIOGAS = 'BIOGAS',
  HEAVY_FUEL_OIL = 'HEAVY_FUEL_OIL',
  SOLAR_HYBRID = 'SOLAR_HYBRID',
  WIND_HYBRID = 'WIND_HYBRID',
  HYDRO = 'HYDRO',
  BATTERY_HYBRID = 'BATTERY_HYBRID',
  OTHER = 'OTHER',
}

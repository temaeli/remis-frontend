import { User } from 'app/routes/auth/auth.interface';
import { PlantFormGroup } from '../plant-form-groups/plant-form-group.interface';

export interface PlantFormItem {
  ctive: boolean;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  group: PlantFormGroup;
  hasSpecification: boolean;
  id: number;
  isDeleted: boolean;
  maximumValue: number;
  migrated: boolean;
  minimumValue: number;
  name: string;
  specificationType: SpecificationType;
  uid: string;
  unitOfMeasure: UnitOfMeasure;
  updatedAt: string;
  updatedBy: number;
}

export interface PlantFormItemDtoInput {
  groupUid: string;
  hasSpecification: boolean;
  maximumValue: number;
  minimumValue: number;
  name: string;
  specificationType: SpecificationType;
  uid: string;
  unitOfMeasure: UnitOfMeasure;
}

export enum UnitOfMeasure {
  COUNT = 'COUNT',
  CUBIC_FEET = 'CUBIC_FEET',
  DEGREE_CENTIGRADE = 'DEGREE_CENTIGRADE',
  KILOGRAM = 'KILOGRAM',
  KILOGRAM_PER_CUBIC_METER = 'KILOGRAM_PER_CUBIC_METER',
  KILOWATT_HOUR = 'KILOWATT_HOUR',
  LITERS = 'LITERS',
  MEGAWATT_HOUR = 'MEGAWATT_HOUR',
  MEGA_JOULES_PER_CUBIC_METER = 'MEGA_JOULES_PER_CUBIC_METER',
  METER_CUBIC = 'METER_CUBIC',
  MICROSIEMENS_PER_CENTIMETER = 'MICROSIEMENS_PER_CENTIMETER',
  MILLIGRAM_PER_LITRE = 'MILLIGRAM_PER_LITRE',
  MOLE = 'MOLE',
  NEPHELOMETRIC_TURBIDITY_UNITS = 'NEPHELOMETRIC_TURBIDITY_UNITS',
  NORMAL_CUBIC_METERS_PER_DAY = 'NORMAL_CUBIC_METERS_PER_DAY',
  PERCENTAGE = 'PERCENTAGE',
  PSU = 'PSU',
}

export const UnitOfMeasureMap = {
  COUNT: 'count',
  CUBIC_FEET: 'm',
  DEGREE_CENTIGRADE: '°C',
  KILOGRAM: 'Kg',
  KILOGRAM_PER_CUBIC_METER: 'Kg/m³',
  KILOWATT_HOUR: 'KWh',
  LITERS: 'L',
  MEGAWATT_HOUR: 'MWh',
  MEGA_JOULES_PER_CUBIC_METER: 'MJ/m³',
  METER_CUBIC: 'm³',
  MICROSIEMENS_PER_CENTIMETER: 'μS/cm',
  MILLIGRAM_PER_LITRE: 'mg/L',
  MOLE: 'Mole%',
  NEPHELOMETRIC_TURBIDITY_UNITS: 'NTU',
  NORMAL_CUBIC_METERS_PER_DAY: 'Nm³/d',
  PERCENTAGE: '%',
  PSU: 'PSU',
};

export enum SpecificationType {
  EQUAL = 'EQUAL',
  GREATER_OR_EQUAL = 'GREATER_OR_EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  LESS_OR_EQUAL = 'LESS_OR_EQUAL',
  LESS_THAN = 'LESS_THAN',
  RANGE = 'RANGE',
}

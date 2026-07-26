import { PowerGenerator } from '../power-generators/power-generator.interface';
import { PowerGeneratorTank } from '../fuel-tanks/tank.interface';

export type EquipmentType = 'POWER_GENERATOR' | 'MOTOR_VEHICLE' | 'MOBILE_EQUIPMENT' | 'OTHER';

export interface PowerGeneratorRefuel {
  id?: number;
  uid?: string;
  date?: string;
  quantityInLitres?: number;
  newVolume?: number;
  newTankVolume?: number;
  equipmentType?: EquipmentType;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  remarks?: string;
  comment?: string;
  powerGenerator?: PowerGenerator;
  generatorTank?: PowerGeneratorTank;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentRefuelDtoInput {
  uid?: string;
  powerGeneratorUid?: string;
  powerGeneratorTankUid: string;
  equipmentType: EquipmentType;
  date?: string;
  quantityInLitres: number;
  remarks?: string;
}

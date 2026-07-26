import { PowerGenerator } from '../power-generators/power-generator.interface';

export interface PowerGeneratorOperation {
  id?: number;
  uid?: string;
  date?: string;
  fuelLevel?: number;
  fuelConsumed?: number;
  runHours?: number;
  accumulatedRunHours?: number;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  remarks?: string;
  comment?: string;
  powerGenerator?: PowerGenerator;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PowerGeneratorOperationDtoInput {
  uid?: string;
  powerGeneratorUid: string;
  date?: string;
  fuelLevel: number;
  accumulatedRunHours: number;
  remarks?: string;
}

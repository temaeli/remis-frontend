import { WorkingStation } from '../working-stations/working-station.interface';

export interface PowerGeneratorTank {
  id?: number;
  uid?: string;
  name?: string;
  capacityInLitres?: number;
  minimumVolume?: number;
  workingStation?: WorkingStation;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PowerGeneratorTankDtoInput {
  uid?: string;
  workingStationUid: string;
  name: string;
  capacityInLitres: number;
  minimumVolume?: number;
}

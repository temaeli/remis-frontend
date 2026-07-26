import { User } from '@routes/auth/auth.interface';
import { Client } from '@routes/client-registration/customers/clients.interface';
import { Plant } from '@routes/plants/plants/plant.interface';

export interface PlantReceivedData {
  active?: boolean;
  availableCapacity?: number;
  client?: Client;
  createdAt?: string;
  createdBy?: User;
  createdById?: number;
  deletedAt?: string;
  deletedBy?: number;
  deletedId?: number;
  flaredGas?: number;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  ownUseGas?: number;
  plant?: Plant;
  receivedRawGasPressure?: number;
  receivedRawGasTemperature?: number;
  receivedRawGasVolume?: number;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export interface PlantReceivedDataDtoInput {
  clientUid?: string;
  receivedRawGasPressure?: number;
  receivedRawGasTemperature?: number;
  receivedRawGasVolume?: number;
  uid?: string;
}

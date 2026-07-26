import { User } from '@routes/auth/auth.interface';
import { Plant } from '@routes/plants/plants/plant.interface';

export interface PlantWaterReading {
  active?: boolean;
  createdAt?: string;
  createdBy?: User;
  createdById?: number;
  deletedAt?: string;
  deletedBy?: number;
  deletedId?: number;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  plant?: Plant;
  producedCondensate?: number;
  producedWater?: number;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
  waterDewPoint?: number;
}

export interface PlantWaterReadingDtoInput {
  plantUid?: string;
  producedCondensate?: number;
  producedWater?: number;
  uid?: string;
  waterDewPoint?: number;
}


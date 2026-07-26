import { SubWard } from '@routes/settings/regions/subward/subward.form';
import { User } from 'app/routes/auth/auth.interface';

export interface Plant {
  active?: boolean;
  blockNumber?: string;
  code: string;
  createdAt?: string;
  createdBy?: User;
  dailyProductionCapacityMmscfd?: number;
  deletedAt?: string;
  deletedBy?: number;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  name: string;
  physicalAddress?: string;
  postalAddress?: string;
  subWard?: SubWard;
  supervisorUser?: User;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export interface PlantDtoInput {
  blockNumber: string;
  code: string;
  dailyProductionCapacityMmscfd: number;
  maximumCapacityMmscfd: number;
  name: string;
  physicalAddress: string;
  postalAddress: string;
  subWardUid: string;
  supervisorUserUid: string;
  uid: string;
}

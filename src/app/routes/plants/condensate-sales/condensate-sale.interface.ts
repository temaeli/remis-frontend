import { User } from '@routes/auth/auth.interface';
import { Plant } from '@routes/plants/plants/plant.interface';

export interface CondensateSale {
  active?: boolean;
  approvedAt?: string;
  approvedBy?: User;
  rejectedAt?: string;
  rejectedBy?: User;
  comment?: string;
  createdAt?: string;
  createdBy?: User;
  createdById?: number;
  customerLicenseNumber?: string;
  customerName?: string;
  deletedAt?: string;
  deletedBy?: number;
  deletedId?: number;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  offloadingDate?: string;
  plant?: Plant;
  remarks?: string;
  salesDate?: string;
  submittedAt?: string;
  truckNumber?: string;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
  volumeInLitres?: number;
}

export interface CondensateSaleDtoInput {
  customerLicenseNumber: string;
  customerName: string;
  offloadingDate: string;
  plantUid: string;
  remarks?: string;
  salesDate: string;
  truckNumber: string;
  uid?: string;
  volumeInLitres: number;
}

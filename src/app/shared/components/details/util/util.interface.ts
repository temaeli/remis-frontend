import { User } from 'app/routes/auth/auth.interface';

export type Obj = Record<string, any>;

export interface BaseEntity {
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
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

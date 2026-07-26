import { User } from 'app/routes/auth/auth.interface';

export interface Designation {
  active?: boolean;
  code: string;
  createdAt?: Date;
  createdBy?: User;
  createdById?: number;
  deletedAt?: Date;
  deletedBy?: number;
  deletedId?: number;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  title: string;
  uid: string;
  updatedAt?: Date;
  updatedBy?: number;
}

export interface DesignationDtoInput {
  code: string;
  title: string;
  uid?: string;
}

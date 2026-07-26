import { User } from '@routes/auth/auth.interface';

export interface Department {
  active?: boolean;
  code: string;
  createdAt?: string;
  createdBy?: User;
  deletedAt?: string;
  deletedBy?: number;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  name: string;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export interface DepartmentDtoInput {
  code: string;
  name: string;
  uid?: string;
}


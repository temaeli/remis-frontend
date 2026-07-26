export interface GasInstallation {
  active: boolean;
  code: string;
  createdAt?: string;
  createdBy?: any;
  deletedAt?: string;
  deletedBy?: number;
  description?: string;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  name: string;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export interface GasInstallationDtoInput {
  code: string;
  description?: string;
  name: string;
  uid?: string;
}

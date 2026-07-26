export interface CustomerCategory {
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

export interface CustomerCategoryDtoInput {
  code: string;
  description?: string;
  name: string;
  uid?: string;
}

export enum IdentificationType {
  BUSINESS_REGISTRATION = 'BUSINESS_REGISTRATION',
  NATIONAL_ID = 'NATIONAL_ID',
  OTHER = 'OTHER',
}

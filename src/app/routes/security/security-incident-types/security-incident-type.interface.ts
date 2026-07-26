export interface SecurityIncidentType {
  id?: number;
  uid?: string;
  code?: string;
  name?: string;
  description?: string;
  orderIndex?: number;
  active?: boolean;
  isDeleted?: boolean;
  migrated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityIncidentTypeDtoInput {
  uid?: string;
  code?: string;
  name: string;
  description?: string;
  orderIndex?: number;
}

export interface IncidentType {
  id?: number;
  uid?: string;
  code?: string;
  name?: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncidentTypeDtoInput {
  uid?: string;
  code?: string;
  name: string;
  description: string;
}

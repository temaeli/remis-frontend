export interface MainFacilityType {
  id?: number;
  uid?: string;
  name?: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MainFacilityTypeDtoInput {
  uid?: string;
  name: string;
  description?: string;
}

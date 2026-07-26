import { MainFacilityType } from '../main-facility-types/main-facility-type.interface';

export interface MainFacility {
  id?: number;
  uid?: string;
  code?: string;
  name?: string;
  type?: MainFacilityType;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MainFacilityDtoInput {
  uid?: string;
  code: string;
  name: string;
  facilityTypeUid: string;
  description?: string;
}

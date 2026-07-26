import { MainFacility } from '../main-facilities/main-facility.interface';

export interface MainFacilitySchedule {
  id?: number;
  uid?: string;
  date?: string;
  online?: number;
  offline?: number;
  downtime?: number;
  remarks?: string;
  facility?: MainFacility;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MainFacilityScheduleDtoInput {
  uid?: string;
  facilityUid: string;
  date: string;
  online: number;
  offline: number;
  downtime: number;
  remarks?: string;
}

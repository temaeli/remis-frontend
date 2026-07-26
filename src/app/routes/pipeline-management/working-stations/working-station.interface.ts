export enum SectionEnum {
  PLANT = 'PLANT',
  PIPELINE = 'PIPELINE',
  SECURITY = 'SECURITY',
  REPORT = 'REPORT',
  HSE = 'HSE',
  DISTRIBUTION = 'DISTRIBUTION',
}

export interface WorkingStation {
  id?: number;
  uid?: string;
  code?: string;
  name?: string;
  description?: string;
  section?: SectionEnum;
  sourceId?: string;
  model?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkingStationDtoInput {
  uid?: string;
  code?: string;
  name: string;
  section: SectionEnum;
  facilityUid?: string;
  description?: string;
}

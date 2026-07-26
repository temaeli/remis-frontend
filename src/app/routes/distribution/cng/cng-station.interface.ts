import { User } from 'app/routes/auth/auth.interface';

export enum CngStationType {
  MOTHER = 'MOTHER',
  DAUGHTER = 'DAUGHTER',
  FILLING = 'FILLING',
}

/** Kind of configurable CNG lookup value managed via the CngLookup CRUD. */
export enum CngLookupType {
  EQUIPMENT_TYPE = 'EQUIPMENT_TYPE',
  CAPACITY_UNIT = 'CAPACITY_UNIT',
}

/** Configurable lookup value (equipment type or capacity unit), replaces the old enums. */
export interface CngLookup {
  uid: string;
  lookupType: CngLookupType;
  name: string;
  symbol?: string;
  description?: string;
}

export interface CngLookupDtoInput {
  uid?: string;
  lookupType: CngLookupType;
  name: string;
  symbol?: string;
  description?: string;
}

export interface CngStationEquipment {
  uid?: string;
  /** CngLookup uid of type EQUIPMENT_TYPE — sent on save. */
  equipmentTypeUid?: string;
  /** Populated by the server on read. */
  equipmentType?: CngLookup;
  name: string;
  capacity?: number;
  /** CngLookup uid of type CAPACITY_UNIT — sent on save. */
  capacityUnitUid?: string;
  /** Populated by the server on read. */
  capacityUnit?: CngLookup;
  orderIndex?: number;
}

export interface CngStation {
  uid: string;
  code: string;
  name: string;
  stationType: CngStationType;
  region?: string;
  location?: string;
  contact?: string;
  description?: string;
  active: boolean;
  equipments?: CngStationEquipment[];
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  updatedBy?: User;
}

export interface CngStationDtoInput {
  uid?: string;
  code?: string;
  name: string;
  stationType?: CngStationType;
  region?: string;
  location?: string;
  contact?: string;
  description?: string;
  equipments?: CngStationEquipment[];
}

/** A user's (current or historical) assignment to a CNG station. */
export interface UserCngStation {
  id: number;
  current: boolean;
  createdAt?: string;
  cngStation?: CngStation;
  user?: User;
}

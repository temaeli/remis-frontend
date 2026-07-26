import { SecurityAccessPersonType, SecurityAccessResult } from '../shared/security.enums';

export interface SecurityAccessEvent {
  id?: number;
  uid?: string;
  station?: { uid?: string; name?: string };
  personName?: string;
  personType?: SecurityAccessPersonType;
  staffUser?: { uid?: string; fullName?: string };
  companyOrDepartment?: string;
  purpose?: string;
  credentialType?: string;
  result?: SecurityAccessResult;
  eventTime?: string;
  authorizedBy?: string;
  remarks?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityAccessEventDtoInput {
  uid?: string;
  stationUid?: string;
  personName?: string;
  personType?: SecurityAccessPersonType;
  staffUserUid?: string;
  companyOrDepartment?: string;
  purpose?: string;
  credentialType?: string;
  result?: SecurityAccessResult;
  eventTime?: string;
  authorizedBy?: string;
  remarks?: string;
}

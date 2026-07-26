export interface SecurityGuard {
  id?: number;
  uid?: string;
  firstName?: string;
  middleName?: string;
  surname?: string;
  fullName?: string;
  contact?: string;
  rank?: string;
  serviceNumber?: string;
  station?: { uid?: string; name?: string };
  contractor?: { uid?: string; name?: string };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityGuardDtoInput {
  uid?: string;
  firstName: string;
  middleName?: string;
  surname?: string;
  contact?: string;
  rank?: string;
  serviceNumber?: string;
  stationUid?: string;
  contractorUid?: string;
}

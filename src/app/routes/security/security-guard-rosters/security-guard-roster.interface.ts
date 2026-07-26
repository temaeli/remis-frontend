import { SecurityGuardShift, SecurityWorkflowStatus } from '../shared/security.enums';

export interface SecurityGuardRosterEntry {
  uid?: string;
  guard?: { uid?: string; fullName?: string };
  guardUid?: string;
  guardName?: string;
  dutyDate?: string;
  shift?: SecurityGuardShift;
}

export interface SecurityGuardRoster {
  id?: number;
  uid?: string;
  referenceNumber?: string;
  station?: { uid?: string; name?: string };
  contractor?: { uid?: string; name?: string };
  weekStart?: string;
  weekEnd?: string;
  status?: SecurityWorkflowStatus;
  preparedByUser?: { uid?: string; fullName?: string };
  approvedByUser?: { uid?: string; fullName?: string };
  entries?: SecurityGuardRosterEntry[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityGuardRosterEntryDtoInput {
  guardUid?: string;
  guardName?: string;
  dutyDate?: string;
  shift?: SecurityGuardShift;
}

export interface SecurityGuardRosterDtoInput {
  uid?: string;
  stationUid?: string;
  contractorUid?: string;
  weekStart?: string;
  weekEnd?: string;
  entries?: SecurityGuardRosterEntryDtoInput[];
}

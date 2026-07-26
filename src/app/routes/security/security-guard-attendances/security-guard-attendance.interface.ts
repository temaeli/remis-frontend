import { SecurityAttendanceStatus } from '../shared/security.enums';

export interface SecurityGuardAttendance {
  id?: number;
  uid?: string;
  guard?: { uid?: string; fullName?: string };
  guardName?: string;
  station?: { uid?: string; name?: string };
  attendanceDate?: string;
  status?: SecurityAttendanceStatus;
  remarks?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityGuardAttendanceDtoInput {
  uid?: string;
  guardUid?: string;
  guardName?: string;
  stationUid?: string;
  attendanceDate?: string;
  status?: SecurityAttendanceStatus;
  remarks?: string;
}

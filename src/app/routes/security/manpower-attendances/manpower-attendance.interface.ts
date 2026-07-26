export interface ManpowerAttended {
  id?: number;
  uid?: string;
  attended?: number;
  totalManHours?: number;
  category?: { uid?: string; name?: string };
  manpowerCategoryUid?: string;
}

export interface ManpowerAttendedDtoInput {
  uid?: string;
  attendanceUid?: string;
  attended: number;
  totalManHours: number;
  manpowerCategoryUid: string;
}

export interface ManpowerAttendance {
  id?: number;
  uid?: string;
  date?: string;
  station?: { uid?: string; name?: string };
  manpowerAttended?: ManpowerAttended[];
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  remarks?: string;
  comment?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManpowerAttendanceDtoInput {
  uid?: string;
  date: string;
  workStationUid: string;
  remarks?: string;
  comment?: string;
  manpowerAttended: ManpowerAttendedDtoInput[];
}

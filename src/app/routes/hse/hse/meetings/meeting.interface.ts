export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MeetingCategory {
  AGM = 'AGM',
  ORDINARY = 'ORDINARY',
  EXTRAORDINARY = 'EXTRAORDINARY',
  SHE_REP = 'SHE_REP',
  MONTHLY = 'MONTHLY',
}

export const MEETING_CATEGORY_LABELS: Record<MeetingCategory, string> = {
  [MeetingCategory.AGM]: 'AGM',
  [MeetingCategory.ORDINARY]: 'Ordinary',
  [MeetingCategory.EXTRAORDINARY]: 'Extraordinary',
  [MeetingCategory.SHE_REP]: 'SHE Rep',
  [MeetingCategory.MONTHLY]: 'Monthly',
};

export interface HseMeeting {
  uid?: string;
  title: string;
  description?: string;
  category?: MeetingCategory;
  startTime: string;
  endTime: string;
  location?: string;
  status?: MeetingStatus;
  onlineMeeting?: boolean;
  meetingLink?: string;
  organizer?: string;
  chairPerson?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  secretary?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  chairPersonUid?: string;
  secretaryUid?: string;
  reminderMinutes?: number;
  comment?: string;
  remarks?: string;
  completedAt?: string;
  completedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  confirmedAt?: string;
  confirmedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  approvedAt?: string;
  rejectedAt?: string;
  actedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  active?: boolean;
  createdAt?: string;
}

export interface HseMeetingDtoInput {
  uid?: string;
  title: string;
  description?: string;
  category: MeetingCategory;
  startTime: string;
  endTime: string;
  location?: string;
  organizer?: string;
  chairPersonUid?: string;
  secretaryUid?: string;
  reminderMinutes?: number;
  onlineMeeting?: boolean;
  meetingLink?: string;
}

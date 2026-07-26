export enum TrainingCategory {
  STAFF = 'STAFF',
  CONTRACTOR = 'CONTRACTOR',
}

export enum TrainingType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum TrainingDeliveryMode {
  THEORY = 'THEORY',
  PRACTICAL = 'PRACTICAL',
  THEORY_AND_PRACTICAL = 'THEORY_AND_PRACTICAL',
}

export enum TrainingStatus {
  PLANNED = 'PLANNED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface HseTraining {
  uid?: string;
  category?: TrainingCategory;
  type?: TrainingType;
  course?: string;
  plannedDate: string;
  trainingInstitution?: string;
  trainingContent: string;
  remarks?: string;
  status?: TrainingStatus;
  deliveryMode?: TrainingDeliveryMode;
  completedAt?: string;
  completedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  active?: boolean;
  createdAt?: string;
}

export interface HseTrainingAttendee {
  uid?: string;
  name: string;
  contact: string;
  designation: string;
  section: string;
  organization: string;
  attended?: boolean;
  comment?: string;
  staffUid?: string;
  staff?: {
    uid?: string;
    username?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
  };
}

// Mirrors BE `HseTrainingAttendeeDto` (createOrUpdateHseTrainingAttendee input).
// The 5 required fields are @NotBlank on BE — must always be sent, even when
// staffUid is set. Send staffUid only when linking to an internal User.
export interface HseTrainingAttendeeDtoInput {
  uid?: string;
  name: string;
  contact: string;
  designation: string;
  section: string;
  organization: string;
  staffUid?: string;
}

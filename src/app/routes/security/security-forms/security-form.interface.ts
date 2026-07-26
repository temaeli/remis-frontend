export enum SecurityFormCategory {
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  CHECKLIST = 'CHECKLIST',
  GUARD_MANAGEMENT = 'GUARD_MANAGEMENT',
  INCIDENT = 'INCIDENT',
  INTELLIGENCE = 'INTELLIGENCE',
  INVESTIGATION = 'INVESTIGATION',
  OPERATIONAL_REPORT = 'OPERATIONAL_REPORT',
  OTHER = 'OTHER',
  PATROL_INSPECTION = 'PATROL_INSPECTION',
  SURVEILLANCE = 'SURVEILLANCE',
  VETTING = 'VETTING',
}

export enum SecurityFormPeriodicity {
  ADHOC = 'ADHOC',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  WEEKLY = 'WEEKLY',
}

export interface SecurityForm {
  id?: number;
  uid?: string;
  code?: string;
  name?: string;
  description?: string;
  category?: SecurityFormCategory;
  periodicity?: SecurityFormPeriodicity;
  docRef?: string;
  versionLabel?: string;
  workflowEnabled?: boolean;
  requiresApproval?: boolean;
  fields?: SecurityFormField[];
  active?: boolean;
  isDeleted?: boolean;
  migrated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityFormField {
  uid?: string;
  [key: string]: any;
}

export interface SecurityFormFieldDtoInput {
  uid?: string;
  [key: string]: any;
}

export interface SecurityFormDtoInput {
  uid?: string;
  code: string;
  name: string;
  description?: string;
  category?: SecurityFormCategory;
  periodicity?: SecurityFormPeriodicity;
  docRef?: string;
  versionLabel?: string;
  workflowEnabled?: boolean;
  requiresApproval?: boolean;
  fields?: SecurityFormFieldDtoInput[];
}

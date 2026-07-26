import { SecurityWorkflowStatus } from '../shared/security.enums';

export interface SecurityFormSubmissionValue {
  uid?: string;
  fieldKey?: string;
  fieldUid?: string;
  valueText?: string;
  valueNumber?: number;
  valueDate?: string;
  valueBoolean?: boolean;
  valueJson?: string;
}

export interface SecurityFormSubmission {
  id?: number;
  uid?: string;
  referenceNumber?: string;
  form?: { uid?: string; name?: string; code?: string };
  station?: { uid?: string; name?: string };
  periodStart?: string;
  periodEnd?: string;
  status?: SecurityWorkflowStatus;
  values?: SecurityFormSubmissionValue[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityFormSubmissionValueDtoInput {
  fieldKey?: string;
  fieldUid?: string;
  valueText?: string;
  valueNumber?: number;
  valueDate?: string;
  valueBoolean?: boolean;
  valueJson?: string;
}

export interface SecurityFormSubmissionDtoInput {
  uid?: string;
  formUid?: string;
  stationUid?: string;
  periodStart?: string;
  periodEnd?: string;
  values?: SecurityFormSubmissionValueDtoInput[];
}

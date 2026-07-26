import { SecurityInvestigationType, SecurityWorkflowStatus } from '../shared/security.enums';

export interface SecurityInvestigation {
  id?: number;
  uid?: string;
  referenceNumber?: string;
  incident?: { uid?: string; referenceNumber?: string };
  allegation?: string;
  investigationType?: SecurityInvestigationType;
  location?: string;
  investigationDate?: string;
  subjectPerson?: string;
  complainantName?: string;
  background?: string;
  remit?: string;
  investigationProcess?: string;
  findings?: string;
  conclusion?: string;
  recommendation?: string;
  investigatorUser?: { uid?: string; fullName?: string };
  status?: SecurityWorkflowStatus;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityInvestigationDtoInput {
  uid?: string;
  incidentUid?: string;
  allegation?: string;
  investigationType?: SecurityInvestigationType;
  location?: string;
  investigationDate?: string;
  subjectPerson?: string;
  complainantName?: string;
  background?: string;
  remit?: string;
  investigationProcess?: string;
  findings?: string;
  conclusion?: string;
  recommendation?: string;
  investigatorUserUid?: string;
}

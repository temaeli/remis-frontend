import { SecuritySeverity, SecurityWorkflowStatus } from '../shared/security.enums';

export interface SecurityIncident {
  id?: number;
  uid?: string;
  referenceNumber?: string;
  incidentType?: { uid?: string; name?: string };
  station?: { uid?: string; name?: string };
  incidentDate?: string;
  incidentTime?: string;
  respondedAt?: string;
  location?: string;
  severity?: SecuritySeverity;
  summary?: string;
  cause?: string;
  impact?: string;
  immediateAction?: string;
  recommendation?: string;
  policeNotified?: boolean;
  policeReference?: string;
  reportedByName?: string;
  reportedByContact?: string;
  respondedByName?: string;
  respondedByContact?: string;
  requiresInvestigation?: boolean;
  status?: SecurityWorkflowStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewComments?: string;
  appointedInvestigatorUser?: { uid?: string; fullName?: string };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityIncidentDtoInput {
  uid?: string;
  incidentTypeUid?: string;
  stationUid?: string;
  incidentDate?: string;
  incidentTime?: string;
  respondedAt?: string;
  location?: string;
  severity?: SecuritySeverity;
  summary?: string;
  cause?: string;
  impact?: string;
  immediateAction?: string;
  recommendation?: string;
  policeNotified?: boolean;
  policeReference?: string;
  reportedByName?: string;
  reportedByContact?: string;
  respondedByName?: string;
  respondedByContact?: string;
  requiresInvestigation?: boolean;
}

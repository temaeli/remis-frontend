import {
  SecurityIntelAssessment,
  SecurityIntelHandlingCode,
  SecurityIntelSanitization,
  SecurityIntelSourceEvaluation,
  SecurityWorkflowStatus,
} from '../shared/security.enums';

export interface SecurityIntelligenceReport {
  id?: number;
  uid?: string;
  referenceNumber?: string;
  station?: { uid?: string; name?: string };
  organizationUnit?: string;
  contactNumber?: string;
  operationName?: string;
  eventAt?: string;
  sourceEvaluation?: SecurityIntelSourceEvaluation;
  assessment?: SecurityIntelAssessment;
  handlingCode?: SecurityIntelHandlingCode;
  sanitization?: SecurityIntelSanitization;
  information?: string;
  provenanceSensitivity?: string;
  thirdPartyWillingToEngage?: boolean;
  status?: SecurityWorkflowStatus;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityIntelligenceReportDtoInput {
  uid?: string;
  stationUid?: string;
  organizationUnit?: string;
  contactNumber?: string;
  operationName?: string;
  eventAt?: string;
  sourceEvaluation?: SecurityIntelSourceEvaluation;
  assessment?: SecurityIntelAssessment;
  handlingCode?: SecurityIntelHandlingCode;
  sanitization?: SecurityIntelSanitization;
  information?: string;
  provenanceSensitivity?: string;
  thirdPartyWillingToEngage?: boolean;
}

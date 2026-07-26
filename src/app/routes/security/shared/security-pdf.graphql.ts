import { gql } from 'apollo-angular';
import { plainResponseGqlFields } from '@shared/fetch/graphql.constants';

// PDF report queries — each returns `Response<String>` with base64 in `data`.

export const SECURITY_INCIDENT_PDF = gql`
  query securityIncidentPdf($incidentUid: String) {
    securityIncidentPdf(incidentUid: $incidentUid) {
      ${plainResponseGqlFields}
    }
  }
`;

export const SECURITY_INVESTIGATION_PDF = gql`
  query securityInvestigationPdf($investigationUid: String) {
    securityInvestigationPdf(investigationUid: $investigationUid) {
      ${plainResponseGqlFields}
    }
  }
`;

export const SECURITY_FORM_SUBMISSION_PDF = gql`
  query securityFormSubmissionPdf($submissionUid: String) {
    securityFormSubmissionPdf(submissionUid: $submissionUid) {
      ${plainResponseGqlFields}
    }
  }
`;

export const SECURITY_OPS_REPORT_PDF = gql`
  query securityOpsReportPdf($period: SecurityFormPeriodicity, $fromDate: String, $toDate: String) {
    securityOpsReportPdf(period: $period, fromDate: $fromDate, toDate: $toDate) {
      ${plainResponseGqlFields}
    }
  }
`;

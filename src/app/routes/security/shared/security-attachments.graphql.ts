import { gql } from 'apollo-angular';

/** Read-only attachment shape returned by the security `*Attachments` queries. */
export const securityAttachmentFields = `
active
attachment
attachmentTitle
extraIdentifier
filePath
mediaSize
mediaType
migrated
model
sourceId
sourceName
`;

export const SECURITY_INCIDENT_ATTACHMENTS = gql`
  query securityIncidentAttachments($incidentUid: String) {
    securityIncidentAttachments(incidentUid: $incidentUid) {
      ${securityAttachmentFields}
    }
  }
`;

export const SECURITY_INVESTIGATION_ATTACHMENTS = gql`
  query securityInvestigationAttachments($investigationUid: String) {
    securityInvestigationAttachments(investigationUid: $investigationUid) {
      ${securityAttachmentFields}
    }
  }
`;

export const SECURITY_FORM_SUBMISSION_ATTACHMENTS = gql`
  query securityFormSubmissionAttachments($submissionUid: String) {
    securityFormSubmissionAttachments(submissionUid: $submissionUid) {
      ${securityAttachmentFields}
    }
  }
`;

export const SECURITY_GATE_PASS_ATTACHMENTS = gql`
  query securityGatePassAttachments($gatePassUid: String) {
    securityGatePassAttachments(gatePassUid: $gatePassUid) {
      ${securityAttachmentFields}
    }
  }
`;

export const SECURITY_ACCESS_EVENT_ATTACHMENTS = gql`
  query securityAccessEventAttachments($accessEventUid: String) {
    securityAccessEventAttachments(accessEventUid: $accessEventUid) {
      ${securityAttachmentFields}
    }
  }
`;

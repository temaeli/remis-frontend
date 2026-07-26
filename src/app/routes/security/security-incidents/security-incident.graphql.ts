import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityIncidentFields = `
  referenceNumber
  incidentType { uid name }
  station { uid name }
  incidentDate
  incidentTime
  respondedAt
  location
  severity
  summary
  cause
  impact
  immediateAction
  recommendation
  policeNotified
  policeReference
  reportedByName
  reportedByContact
  respondedByName
  respondedByContact
  requiresInvestigation
  status
  submittedAt
  reviewedAt
  reviewComments
  endorsedAt
  endorsedByUser { uid fullName }
  approvedAt
  approvedByUser { uid fullName }
  appointedInvestigatorUser { uid fullName }
  ${baseGqlFields}
`;

const workflowReturn = responseGqlFields('uid status');

export const ALL_SECURITY_INCIDENTS_PAGEABLE = gql`
  query allSecurityIncidentsPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityIncidentsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityIncidentFields)}
    }
  }
`;

export const FIND_SECURITY_INCIDENT = gql`
  query findSecurityIncident($uid: String!){
    findSecurityIncident(uid: $uid){
      ${responseGqlFields(securityIncidentFields)}
    }
  }
`;

export const SAVE_SECURITY_INCIDENT = gql`
  mutation saveSecurityIncident($dto: SecurityIncidentDtoInput){
    saveSecurityIncident(dto: $dto){
      ${responseGqlFields(securityIncidentFields)}
    }
  }
`;

export const SUBMIT_SECURITY_INCIDENT = gql`
  mutation submitSecurityIncident($uid: String){
    submitSecurityIncident(uid: $uid){ ${workflowReturn} }
  }
`;

export const REVIEW_SECURITY_INCIDENT = gql`
  mutation reviewSecurityIncident($dto: SecurityWorkflowActionDtoInput){
    reviewSecurityIncident(dto: $dto){ ${workflowReturn} }
  }
`;

export const ENDORSE_SECURITY_INCIDENT = gql`
  mutation endorseSecurityIncident($dto: SecurityWorkflowActionDtoInput){
    endorseSecurityIncident(dto: $dto){ ${workflowReturn} }
  }
`;

export const APPROVE_SECURITY_INCIDENT = gql`
  mutation approveSecurityIncident($dto: SecurityWorkflowActionDtoInput){
    approveSecurityIncident(dto: $dto){ ${workflowReturn} }
  }
`;

export const ESCALATE_SECURITY_INCIDENT = gql`
  mutation escalateSecurityIncident($dto: SecurityWorkflowActionDtoInput){
    escalateSecurityIncident(dto: $dto){ ${workflowReturn} }
  }
`;

export const CLOSE_SECURITY_INCIDENT = gql`
  mutation closeSecurityIncident($dto: SecurityWorkflowActionDtoInput){
    closeSecurityIncident(dto: $dto){ ${workflowReturn} }
  }
`;

export const APPOINT_SECURITY_INVESTIGATOR = gql`
  mutation appointSecurityInvestigator($dto: SecurityWorkflowActionDtoInput){
    appointSecurityInvestigator(dto: $dto){ ${workflowReturn} }
  }
`;

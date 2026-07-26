import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityInvestigationFields = `
  referenceNumber
  incident { uid referenceNumber }
  allegation
  investigationType
  location
  investigationDate
  subjectPerson
  complainantName
  background
  remit
  investigationProcess
  findings
  conclusion
  recommendation
  investigatorUser { uid fullName }
  status
  ${baseGqlFields}
`;

const workflowReturn = responseGqlFields('uid status');

export const ALL_SECURITY_INVESTIGATIONS_PAGEABLE = gql`
  query allSecurityInvestigationsPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityInvestigationsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityInvestigationFields)}
    }
  }
`;

export const SECURITY_INVESTIGATIONS_BY_INCIDENT = gql`
  query securityInvestigationsByIncident($incidentUid: String){
    securityInvestigationsByIncident(incidentUid: $incidentUid){
      ${securityInvestigationFields}
    }
  }
`;

export const FIND_SECURITY_INVESTIGATION = gql`
  query findSecurityInvestigation($uid: String!){
    findSecurityInvestigation(uid: $uid){
      ${responseGqlFields(securityInvestigationFields)}
    }
  }
`;

export const SAVE_SECURITY_INVESTIGATION = gql`
  mutation saveSecurityInvestigation($dto: SecurityInvestigationDtoInput){
    saveSecurityInvestigation(dto: $dto){
      ${responseGqlFields(securityInvestigationFields)}
    }
  }
`;

export const SUBMIT_SECURITY_INVESTIGATION = gql`
  mutation submitSecurityInvestigation($uid: String){
    submitSecurityInvestigation(uid: $uid){ ${workflowReturn} }
  }
`;

export const REVIEW_SECURITY_INVESTIGATION = gql`
  mutation reviewSecurityInvestigation($dto: SecurityWorkflowActionDtoInput){
    reviewSecurityInvestigation(dto: $dto){ ${workflowReturn} }
  }
`;

export const ESCALATE_SECURITY_INVESTIGATION = gql`
  mutation escalateSecurityInvestigation($dto: SecurityWorkflowActionDtoInput){
    escalateSecurityInvestigation(dto: $dto){ ${workflowReturn} }
  }
`;

export const CLOSE_SECURITY_INVESTIGATION = gql`
  mutation closeSecurityInvestigation($dto: SecurityWorkflowActionDtoInput){
    closeSecurityInvestigation(dto: $dto){ ${workflowReturn} }
  }
`;

export const PUSH_INVESTIGATION_RECOMMENDATION_TO_ACTION_TRACKER = gql`
  mutation pushInvestigationRecommendationToActionTracker(
    $investigationUid: String
    $controlMeasures: String
    $priority: SecurityActionPriority
    $responsibleName: String
  ){
    pushInvestigationRecommendationToActionTracker(
      investigationUid: $investigationUid
      controlMeasures: $controlMeasures
      priority: $priority
      responsibleName: $responsibleName
    ){ ${workflowReturn} }
  }
`;

import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityIntelligenceReportFields = `
  referenceNumber
  station { uid name }
  organizationUnit
  contactNumber
  operationName
  eventAt
  sourceEvaluation
  assessment
  handlingCode
  sanitization
  information
  provenanceSensitivity
  thirdPartyWillingToEngage
  status
  ${baseGqlFields}
`;

const workflowReturn = responseGqlFields('uid status');

export const ALL_SECURITY_INTELLIGENCE_REPORTS_PAGEABLE = gql`
  query allSecurityIntelligenceReportsPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityIntelligenceReportsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityIntelligenceReportFields)}
    }
  }
`;

export const FIND_SECURITY_INTELLIGENCE_REPORT = gql`
  query findSecurityIntelligenceReport($uid: String!){
    findSecurityIntelligenceReport(uid: $uid){
      ${responseGqlFields(securityIntelligenceReportFields)}
    }
  }
`;

export const SAVE_SECURITY_INTELLIGENCE_REPORT = gql`
  mutation saveSecurityIntelligenceReport($dto: SecurityIntelligenceReportDtoInput){
    saveSecurityIntelligenceReport(dto: $dto){
      ${responseGqlFields(securityIntelligenceReportFields)}
    }
  }
`;

export const SUBMIT_SECURITY_INTELLIGENCE_REPORT = gql`
  mutation submitSecurityIntelligenceReport($uid: String){
    submitSecurityIntelligenceReport(uid: $uid){ ${workflowReturn} }
  }
`;

export const REVIEW_SECURITY_INTELLIGENCE_REPORT = gql`
  mutation reviewSecurityIntelligenceReport($dto: SecurityWorkflowActionDtoInput){
    reviewSecurityIntelligenceReport(dto: $dto){ ${workflowReturn} }
  }
`;

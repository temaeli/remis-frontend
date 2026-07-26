import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

const userFields = `
  uid
  username
  firstName
  lastName
`;

export const escalatedIssueFields = `
  remarks
  comment
  escalatedTo {
    ${userFields}
  }
  completedAt
  completedBy {
    ${userFields}
  }
  ${baseGqlFields}
`;

export const GET_INSPECTION_ESCALATED_ISSUES_BY_INSPECTION = gql`
  query getInspectionEscalatedIssuesPageable($inspectionUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getInspectionEscalatedIssuesPageable(inspectionUid: $inspectionUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(escalatedIssueFields)}
    }
  }
`;

export const GET_INSPECTION_ESCALATED_ISSUE_BY_UID = gql`
  query getInspectionEscalatedIssueByUid($uid: String!){
    getInspectionEscalatedIssueByUid(uid: $uid){
      ${responseGqlFields(escalatedIssueFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_INSPECTION_ESCALATED_ISSUE = gql`
  mutation createOrUpdateInspectionEscalatedIssue($input: EscalatedIssueDtoInput!, $inspectionPlanUid: String!){
    createOrUpdateInspectionEscalatedIssue(input: $input, inspectionPlanUid: $inspectionPlanUid){
      ${responseGqlFields(escalatedIssueFields)}
    }
  }
`;

export const DELETE_INSPECTION_ESCALATED_ISSUE = gql`
  mutation deleteInspectionEscalatedIssue($uid: String!, $inspectionUid: String!){
    deleteInspectionEscalatedIssue(uid: $uid, inspectionUid: $inspectionUid){
      ${responseGqlFields(escalatedIssueFields)}
    }
  }
`;

export const MARK_INSPECTION_ESCALATED_ISSUE_COMPLETED = gql`
  mutation markInspectionEscalatedIssueCompleted($uid: String!, $comment: String!){
    markInspectionEscalatedIssueCompleted(uid: $uid, comment: $comment){
      ${responseGqlFields(escalatedIssueFields)}
    }
  }
`;

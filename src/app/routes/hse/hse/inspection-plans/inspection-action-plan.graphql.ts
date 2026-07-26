import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

// Inspection action plans reuse the shared `ActionPlan` model.
export const inspectionActionPlanFields = `
  action
  remarks
  comment
  assignedTo
  assignedToAs
  durationInDays
  completedAt
  completedBy {
    uid
    username
    firstName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_INSPECTION_ACTION_PLANS_BY_INSPECTION = gql`
  query getInspectionActionPlansPageable($inspectionUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getInspectionActionPlansPageable(inspectionUid: $inspectionUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(inspectionActionPlanFields)}
    }
  }
`;

export const GET_INSPECTION_ACTION_PLAN_BY_UID = gql`
  query getInspectionActionPlanByUid($uid: String!){
    getInspectionActionPlanByUid(uid: $uid){
      ${responseGqlFields(inspectionActionPlanFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_INSPECTION_ACTION_PLAN = gql`
  mutation createOrUpdateInspectionActionPlan($input: ActionPlanDtoInput!, $inspectionPlanUid: String!){
    createOrUpdateInspectionActionPlan(input: $input, inspectionPlanUid: $inspectionPlanUid){
      ${responseGqlFields(inspectionActionPlanFields)}
    }
  }
`;

export const DELETE_INSPECTION_ACTION_PLAN = gql`
  mutation deleteInspectionActionPlan($uid: String!, $inspectionUid: String!){
    deleteInspectionActionPlan(uid: $uid, inspectionUid: $inspectionUid){
      ${responseGqlFields(inspectionActionPlanFields)}
    }
  }
`;

export const MARK_INSPECTION_CORRECTIVE_ACTION_COMPLETED = gql`
  mutation markInspectionCorrectiveActionCompleted($uid: String!, $comment: String!){
    markInspectionCorrectiveActionCompleted(uid: $uid, comment: $comment){
      ${responseGqlFields(inspectionActionPlanFields)}
    }
  }
`;

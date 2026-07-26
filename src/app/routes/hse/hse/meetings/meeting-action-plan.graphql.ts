import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const hseMeetingActionPlanFields = `
  action
  remarks
  comment
  assignedTo
  assignedToAs
  durationInDays
  dueDate
  completedAt
  completedBy {
    uid
    username
    firstName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_HSE_MEETING_ACTION_PLANS_BY_MEETING = gql`
  query getHseMeetingActionPlansByMeeting($meetingUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getHseMeetingActionPlansByMeeting(meetingUid: $meetingUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseMeetingActionPlanFields)}
    }
  }
`;

export const GET_HSE_MEETING_ACTION_PLAN_BY_UID = gql`
  query getHseMeetingActionPlanByUid($uid: String!){
    getHseMeetingActionPlanByUid(uid: $uid){
      ${responseGqlFields(hseMeetingActionPlanFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_HSE_MEETING_ACTION_PLAN = gql`
  mutation createOrUpdateHseMeetingActionPlan($input: ActionPlanDtoInput!, $meetingUid: String!){
    createOrUpdateHseMeetingActionPlan(input: $input, meetingUid: $meetingUid){
      ${responseGqlFields(hseMeetingActionPlanFields)}
    }
  }
`;

export const MARK_HSE_MEETING_ACTION_PLAN_COMPLETED = gql`
  mutation markHseMeetingActionPlanCompleted($uid: String!, $comment: String!){
    markHseMeetingActionPlanCompleted(uid: $uid, comment: $comment){
      ${responseGqlFields(hseMeetingActionPlanFields)}
    }
  }
`;

export const DELETE_HSE_MEETING_ACTION_PLAN = gql`
  mutation deleteHseMeetingActionPlan($uid: String!, $meetingUid: String!){
    deleteHseMeetingActionPlan(uid: $uid, meetingUid: $meetingUid){
      ${responseGqlFields(hseMeetingActionPlanFields)}
    }
  }
`;

import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const correctiveActionFields = `
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

export const GET_INCIDENT_CORRECTIVE_ACTIONS_BY_INCIDENT = gql`
  query getIncidentCorrectiveActionsByIncident($incidentUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getIncidentCorrectiveActionsByIncident(incidentUid: $incidentUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(correctiveActionFields)}
    }
  }
`;

export const GET_INCIDENT_CORRECTIVE_ACTION_BY_UID = gql`
  query getIncidentCorrectiveActionByUid($uid: String!){
    getIncidentCorrectiveActionByUid(uid: $uid){
      ${responseGqlFields(correctiveActionFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_INCIDENT_CORRECTIVE_ACTION = gql`
  mutation createOrUpdateIncidentCorrectiveAction($input: ActionPlanDtoInput!, $incidentUid: String!){
    createOrUpdateIncidentCorrectiveAction(input: $input, incidentUid: $incidentUid){
      ${responseGqlFields(correctiveActionFields)}
    }
  }
`;

export const DELETE_INCIDENT_CORRECTIVE_ACTION = gql`
  mutation deleteIncidentCorrectiveAction($uid: String!, $incidentUid: String!){
    deleteIncidentCorrectiveAction(uid: $uid, incidentUid: $incidentUid){
      ${responseGqlFields(correctiveActionFields)}
    }
  }
`;

export const MARK_INCIDENT_CORRECTIVE_ACTION_COMPLETED = gql`
  mutation markIncidentCorrectiveActionCompleted($uid: String!, $comment: String!){
    markIncidentCorrectiveActionCompleted(uid: $uid, comment: $comment){
      ${responseGqlFields(correctiveActionFields)}
    }
  }
`;

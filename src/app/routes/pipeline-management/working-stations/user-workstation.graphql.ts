import { gql } from 'apollo-angular';
import {
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

// UserWorkstation entity does NOT extend BaseEntity — no uid/active/updatedAt.
// Fields exposed: id, workingStation, user, createdAt, current.
export const userWorkstationFields = `
  id
  createdAt
  current
  user {
    uid
    fullName
    firstName
    middleName
    lastName
    email
    designation { title }
  }
  workingStation {
    uid
    name
    code
  }
`;

// Response<User> — thin User selection is enough (we just watch the wrapper).
const userResponseFields = `
  uid
  fullName
  firstName
  lastName
  email
`;

export const ASSIGN_STATION_TO_USER = gql`
  mutation assignStationToUser($userUid: String!, $stationUid: String!) {
    assignStationToUser(userUid: $userUid, stationUid: $stationUid) {
      ${responseGqlFields(userResponseFields)}
    }
  }
`;

export const RELIEVE_STATION_FROM_USER = gql`
  mutation relieveStationFromUser($userUid: String!) {
    relieveStationFromUser(userUid: $userUid) {
      ${responseGqlFields(userResponseFields)}
    }
  }
`;

// WARNING (BE bug): the `active: Boolean` pageable arg is broken —
// UserWorkstation has no `active` column. Passing non-null triggers
// PropertyReferenceException. NEVER pass `active` on these three queries.
export const GET_ALL_USER_WORKSTATIONS = gql`
  query getAllUserWorkstationsPageable($pageableParam: PageableParamInput) {
    getAllUserWorkstationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(userWorkstationFields)}
    }
  }
`;

export const GET_USER_WORKSTATIONS_BY_USER = gql`
  query getUserWorkstationsByUser($userUid: String!, $pageableParam: PageableParamInput) {
    getUserWorkstationsByUser(userUid: $userUid, pageableParam: $pageableParam) {
      ${pageGqlFields(userWorkstationFields)}
    }
  }
`;

export const GET_USER_WORKSTATIONS_BY_STATION = gql`
  query getUserWorkstationsByStation($stationUid: String!, $pageableParam: PageableParamInput) {
    getUserWorkstationsByStation(stationUid: $stationUid, pageableParam: $pageableParam) {
      ${pageGqlFields(userWorkstationFields)}
    }
  }
`;

export const GET_USER_WORKSTATION_BY_UID = gql`
  query getUserWorkstationByUid($uid: String!) {
    getUserWorkstationByUid(uid: $uid) {
      ${responseGqlFields(userWorkstationFields)}
    }
  }
`;

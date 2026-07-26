import { gql } from 'apollo-angular';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const mainFacilityScheduleFields = `
  date
  online
  offline
  downtime
  remarks
  facility {
    uid
    code
    name
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_MAIN_FACILITY_SCHEDULE_BY_UID = gql`
  query getMainFacilityScheduleByUid($uid: String!){
    getMainFacilityScheduleByUid(uid: $uid){
      ${responseGqlFields(mainFacilityScheduleFields)}
    }
  }
`;

export const GET_MAIN_FACILITY_SCHEDULE_BY_FACILITY = gql`
  query getMainFacilityScheduleByFacility($facilityUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getMainFacilityScheduleByFacility(facilityUid: $facilityUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(mainFacilityScheduleFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_MAIN_FACILITY_SCHEDULE = gql`
  mutation createOrUpdateMainFacilitySchedule($input: MainFacilityScheduleDtoInput!){
    createOrUpdateMainFacilitySchedule(input: $input){
      ${responseGqlFields(mainFacilityScheduleFields)}
    }
  }
`;

export const DELETE_MAIN_FACILITY_SCHEDULE = gql`
  mutation deleteMainFacilitySchedule($uid: String!){
    deleteMainFacilitySchedule(uid: $uid){
      ${responseGqlFields(mainFacilityScheduleFields)}
    }
  }
`;

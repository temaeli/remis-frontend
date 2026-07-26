import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const workStationManHourFields = `
  manHours
  category { uid name }
  station { uid name section }
  ${baseGqlFields}
`;

export const GET_ALL_WORKSTATION_MANHOURS = gql`
  query getAllWorkStationManHoursPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllWorkStationManHoursPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(workStationManHourFields)}
    }
  }
`;

export const GET_WORKSTATION_MANHOURS_BY_CATEGORY = gql`
  query getAllWorkStationManHoursByCategoryPageable($categoryUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getAllWorkStationManHoursByCategoryPageable(categoryUid: $categoryUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(workStationManHourFields)}
    }
  }
`;

export const GET_WORKSTATION_MANHOURS_BY_STATION = gql`
  query getAllWorkStationManHoursByStationPageable($stationUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getAllWorkStationManHoursByStationPageable(stationUid: $stationUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(workStationManHourFields)}
    }
  }
`;

export const GET_WORKSTATION_MANHOUR_BY_UID = gql`
  query getWorkStationManHourByUid($uid: String!){
    getWorkStationManHourByUid(uid: $uid){
      ${responseGqlFields(workStationManHourFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_WORKSTATION_MANHOUR = gql`
  mutation createOrUdateWorkStationManHour($input: WorkStationManHourDtoInput!){
    createOrUdateWorkStationManHour(input: $input){
      ${responseGqlFields(workStationManHourFields)}
    }
  }
`;

export const DELETE_WORKSTATION_MANHOUR = gql`
  mutation deleteWorkStationManHour($uid: String!){
    deleteWorkStationManHour(uid: $uid){
      ${responseGqlFields(workStationManHourFields)}
    }
  }
`;

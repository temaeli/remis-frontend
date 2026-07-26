import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const workingStationFields = `
  code
  name
  description
  section
  sourceId
  model
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_WORKING_STATIONS = gql`
  query getAllWorkingStationsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllWorkingStationsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(workingStationFields)}
    }
  }
`;

export const GET_WORKING_STATION_BY_UID = gql`
  query getWorkingStationByUid($uid: String!){
    getWorkingStationByUid(uid: $uid){
      ${responseGqlFields(workingStationFields)}
    }
  }
`;

export const CREATE_WORKING_STATION = gql`
  mutation createWorkingStation($input: WorkingStationDtoInput!){
    createWorkingStation(input: $input){
      ${responseGqlFields(workingStationFields)}
    }
  }
`;

export const UPDATE_WORKING_STATION = gql`
  mutation updateWorkingStation($input: WorkingStationDtoInput!){
    updateWorkingStation(input: $input){
      ${responseGqlFields(workingStationFields)}
    }
  }
`;

export const DELETE_WORKING_STATION = gql`
  mutation deleteWorkingStation($uid: String!){
    deleteWorkingStation(uid: $uid){
      ${responseGqlFields(workingStationFields)}
    }
  }
`;

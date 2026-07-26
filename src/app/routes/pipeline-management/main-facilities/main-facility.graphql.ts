import { gql } from 'apollo-angular';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const mainFacilityFields = `
  code
  name
  type {
    uid
    name
    description
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_MAIN_FACILITIES_PAGEABLE = gql`
  query getAllMainFacilitiesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllMainFacilitiesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(mainFacilityFields)}
    }
  }
`;

export const GET_ALL_MAIN_FACILITIES = gql`
  query getAllMainFacilities {
    getAllMainFacilities {
      uid
      code
      name
    }
  }
`;

export const GET_FACILITIES_BY_TYPE = gql`
  query getFacilitiesByType($facilityTypeUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getFacilitiesByType(facilityTypeUid: $facilityTypeUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(mainFacilityFields)}
    }
  }
`;

export const GET_MAIN_FACILITY_BY_UID = gql`
  query getMainFacilityByUid($uid: String!){
    getMainFacilityByUid(uid: $uid){
      ${responseGqlFields(mainFacilityFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_MAIN_FACILITY = gql`
  mutation createOrUpdateMainFacility($input: MainFacilityDtoInput!){
    createOrUpdateMainFacility(input: $input){
      ${responseGqlFields(mainFacilityFields)}
    }
  }
`;

export const DELETE_MAIN_FACILITY = gql`
  mutation deleteMainFacility($uid: String!){
    deleteMainFacility(uid: $uid){
      ${responseGqlFields(mainFacilityFields)}
    }
  }
`;

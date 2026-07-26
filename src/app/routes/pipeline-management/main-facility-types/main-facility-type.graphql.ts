import { gql } from 'apollo-angular';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const mainFacilityTypeFields = `
  name
  description
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_MAIN_FACILITY_TYPES_PAGEABLE = gql`
  query getAllMainFacilityTypesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllMainFacilityTypesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(mainFacilityTypeFields)}
    }
  }
`;

export const GET_ALL_MAIN_FACILITY_TYPES = gql`
  query getAllMainFacilityTypes {
    getAllMainFacilityTypes {
      uid
      name
      description
    }
  }
`;

export const GET_MAIN_FACILITY_TYPE_BY_UID = gql`
  query getMainFacilityTypeByUid($uid: String!){
    getMainFacilityTypeByUid(uid: $uid){
      ${responseGqlFields(mainFacilityTypeFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_MAIN_FACILITY_TYPE = gql`
  mutation createOrUpdateMainFacilityType($input: MainFacilityTypeDtoInput!){
    createOrUpdateMainFacilityType(input: $input){
      ${responseGqlFields(mainFacilityTypeFields)}
    }
  }
`;

export const DELETE_MAIN_FACILITY_TYPE = gql`
  mutation deleteMainFacilityType($uid: String!){
    deleteMainFacilityType(uid: $uid){
      ${responseGqlFields(mainFacilityTypeFields)}
    }
  }
`;

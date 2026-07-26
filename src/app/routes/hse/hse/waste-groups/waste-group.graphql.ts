import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const wasteGroupFields = `
  code
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

export const GET_ALL_WASTE_GROUPS = gql`
  query getAllWasteGroupsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllWasteGroupsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(wasteGroupFields)}
    }
  }
`;

export const GET_WASTE_GROUP_BY_UID = gql`
  query getWasteGroupByUid($uid: String!){
    getWasteGroupByUid(uid: $uid){
      ${responseGqlFields(wasteGroupFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_WASTE_GROUP = gql`
  mutation createOrUpdateWasteGroup($input: WasteGroupDtoInput!){
    createOrUpdateWasteGroup(input: $input){
      ${responseGqlFields(wasteGroupFields)}
    }
  }
`;

export const DELETE_WASTE_GROUP = gql`
  mutation deleteWasteGroup($uid: String!){
    deleteWasteGroup(uid: $uid){
      ${responseGqlFields(wasteGroupFields)}
    }
  }
`;

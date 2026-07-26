import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const wasteCategoryFields = `
  code
  name
  description
  recyclable
  wasteGroup {
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

export const GET_ALL_WASTE_CATEGORIES = gql`
  query getAllWasteCategoriesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllWasteCategoriesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(wasteCategoryFields)}
    }
  }
`;

export const GET_WASTE_CATEGORIES_BY_GROUP = gql`
  query getWasteCategoryByWasteGroup($wasteGroupUid: String!, $active: Boolean, $pageableParam: PageableParamInput!){
    getWasteCategoryByWasteGroup(wasteGroupUid: $wasteGroupUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(wasteCategoryFields)}
    }
  }
`;

export const GET_WASTE_CATEGORY_BY_UID = gql`
  query getWasteCategoryByUid($uid: String!){
    getWasteCategoryByUid(uid: $uid){
      ${responseGqlFields(wasteCategoryFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_WASTE_CATEGORY = gql`
  mutation createOrUpdateWasteCategory($input: WasteCategoryDtoInput!){
    createOrUpdateWasteCategory(input: $input){
      ${responseGqlFields(wasteCategoryFields)}
    }
  }
`;

export const DELETE_WASTE_CATEGORY = gql`
  mutation deleteWasteCategory($uid: String!){
    deleteWasteCategory(uid: $uid){
      ${responseGqlFields(wasteCategoryFields)}
    }
  }
`;

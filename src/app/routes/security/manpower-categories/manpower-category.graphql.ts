import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const manpowerCategoryFields = `
  name
  description
  ${baseGqlFields}
`;

export const GET_ALL_MANPOWER_CATEGORIES = gql`
  query getAllManpowerCategorysPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllManpowerCategorysPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(manpowerCategoryFields)}
    }
  }
`;

export const GET_MANPOWER_CATEGORY_BY_UID = gql`
  query getManpowerCategoryByUid($uid: String!){
    getManpowerCategoryByUid(uid: $uid){
      ${responseGqlFields(manpowerCategoryFields)}
    }
  }
`;

export const CREATE_MANPOWER_CATEGORY = gql`
  mutation createManpowerCategory($input: ManpowerCategoryDtoInput!){
    createManpowerCategory(input: $input){
      ${responseGqlFields(manpowerCategoryFields)}
    }
  }
`;

export const UPDATE_MANPOWER_CATEGORY = gql`
  mutation updateManpowerCategory($input: ManpowerCategoryDtoInput!){
    updateManpowerCategory(input: $input){
      ${responseGqlFields(manpowerCategoryFields)}
    }
  }
`;

export const DELETE_MANPOWER_CATEGORY = gql`
  mutation deleteManpowerCategory($uid: String!){
    deleteManpowerCategory(uid: $uid){
      ${responseGqlFields(manpowerCategoryFields)}
    }
  }
`;

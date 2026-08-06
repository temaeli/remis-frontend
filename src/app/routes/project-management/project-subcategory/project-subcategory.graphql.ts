import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { projectRegistryGqlFields, projectRefGqlFields } from '../project-registry.graphql';

export const projectSubcategoryGqlFields = `
  ${projectRegistryGqlFields}
  projectCategory {
    ${projectRefGqlFields}
  }
`;

//  Queries
export const ALL_PROJECT_SUBCATEGORIES = gql`
  query allProjectSubcategories {
    allProjectSubcategories {
      ${projectSubcategoryGqlFields}
    }
  }
`;

export const ALL_PROJECT_SUBCATEGORIES_PAGEABLE = gql`
  query allProjectSubcategoriesPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allProjectSubcategoriesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(projectSubcategoryGqlFields)}
    }
  }
`;

export const FIND_PROJECT_SUBCATEGORY = gql`
  query findProjectSubcategory($uid: String) {
    findProjectSubcategory(uid: $uid) {
      ${responseGqlFields(projectSubcategoryGqlFields)}
    }
  }
`;

export const PROJECT_SUBCATEGORIES_BY_CATEGORY = gql`
  query projectSubcategoriesByCategory($categoryUid: String) {
    projectSubcategoriesByCategory(categoryUid: $categoryUid) {
      ${projectSubcategoryGqlFields}
    }
  }
`;

//  Mutations
export const SAVE_PROJECT_SUBCATEGORY = gql`
  mutation saveProjectSubcategory($input: ProjectSubcategoryDtoInput) {
    saveProjectSubcategory(input: $input) {
      ${responseGqlFields(projectSubcategoryGqlFields)}
    }
  }
`;

export const DELETE_PROJECT_SUBCATEGORY = gql`
  mutation deleteProjectSubcategory($uid: String) {
    deleteProjectSubcategory(uid: $uid) {
      ${responseGqlFields(projectSubcategoryGqlFields)}
    }
  }
`;

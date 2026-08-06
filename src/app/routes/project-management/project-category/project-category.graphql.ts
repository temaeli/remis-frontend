import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { projectRegistryGqlFields } from '../project-registry.graphql';

export const projectCategoryGqlFields = `
  ${projectRegistryGqlFields}
`;

//  Queries
export const ALL_PROJECT_CATEGORIES = gql`
  query allProjectCategories {
    allProjectCategories {
      ${projectCategoryGqlFields}
    }
  }
`;

export const ALL_PROJECT_CATEGORIES_PAGEABLE = gql`
  query allProjectCategoriesPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allProjectCategoriesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(projectCategoryGqlFields)}
    }
  }
`;

export const FIND_PROJECT_CATEGORY = gql`
  query findProjectCategory($uid: String) {
    findProjectCategory(uid: $uid) {
      ${responseGqlFields(projectCategoryGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_PROJECT_CATEGORY = gql`
  mutation saveProjectCategory($input: ProjectCategoryDtoInput) {
    saveProjectCategory(input: $input) {
      ${responseGqlFields(projectCategoryGqlFields)}
    }
  }
`;

export const DELETE_PROJECT_CATEGORY = gql`
  mutation deleteProjectCategory($uid: String) {
    deleteProjectCategory(uid: $uid) {
      ${responseGqlFields(projectCategoryGqlFields)}
    }
  }
`;

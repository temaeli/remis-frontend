import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { projectRegistryGqlFields, projectRefGqlFields } from '../project-registry.graphql';

export const registryProjectGqlFields = `
  ${projectRegistryGqlFields}
  latitude
  longitude
  startedAt
  endedAt
  days
  projectSubcategory {
    ${projectRefGqlFields}
  }
`;

//  Queries
export const ALL_REGISTRY_PROJECTS = gql`
  query allRegistryProjects {
    allRegistryProjects {
      ${registryProjectGqlFields}
    }
  }
`;

export const ALL_REGISTRY_PROJECTS_PAGEABLE = gql`
  query allRegistryProjectsPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allRegistryProjectsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(registryProjectGqlFields)}
    }
  }
`;

export const FIND_REGISTRY_PROJECT = gql`
  query findRegistryProject($uid: String) {
    findRegistryProject(uid: $uid) {
      ${responseGqlFields(registryProjectGqlFields)}
    }
  }
`;

export const REGISTRY_PROJECTS_BY_SUBCATEGORY = gql`
  query registryProjectsBySubcategory($subcategoryUid: String) {
    registryProjectsBySubcategory(subcategoryUid: $subcategoryUid) {
      ${registryProjectGqlFields}
    }
  }
`;

//  Mutations
export const SAVE_REGISTRY_PROJECT = gql`
  mutation saveRegistryProject($input: RegistryProjectDtoInput) {
    saveRegistryProject(input: $input) {
      ${responseGqlFields(registryProjectGqlFields)}
    }
  }
`;

export const DELETE_REGISTRY_PROJECT = gql`
  mutation deleteRegistryProject($uid: String) {
    deleteRegistryProject(uid: $uid) {
      ${responseGqlFields(registryProjectGqlFields)}
    }
  }
`;

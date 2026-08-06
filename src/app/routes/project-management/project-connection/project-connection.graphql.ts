import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { projectRegistryGqlFields, projectRefGqlFields } from '../project-registry.graphql';

export const projectConnectionGqlFields = `
  ${projectRegistryGqlFields}
  connectedAt
  parent {
    ${projectRefGqlFields}
  }
  child {
    ${projectRefGqlFields}
  }
`;

//  Queries
export const ALL_PROJECT_CONNECTIONS = gql`
  query allProjectConnections {
    allProjectConnections {
      ${projectConnectionGqlFields}
    }
  }
`;

export const ALL_PROJECT_CONNECTIONS_PAGEABLE = gql`
  query allProjectConnectionsPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allProjectConnectionsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(projectConnectionGqlFields)}
    }
  }
`;

export const FIND_PROJECT_CONNECTION = gql`
  query findProjectConnection($uid: String) {
    findProjectConnection(uid: $uid) {
      ${responseGqlFields(projectConnectionGqlFields)}
    }
  }
`;

export const PROJECT_CONNECTIONS_BY_PARENT = gql`
  query projectConnectionsByParent($parentUid: String) {
    projectConnectionsByParent(parentUid: $parentUid) {
      ${projectConnectionGqlFields}
    }
  }
`;

//  Mutations
export const SAVE_PROJECT_CONNECTION = gql`
  mutation saveProjectConnection($input: ProjectConnectionDtoInput) {
    saveProjectConnection(input: $input) {
      ${responseGqlFields(projectConnectionGqlFields)}
    }
  }
`;

export const DELETE_PROJECT_CONNECTION = gql`
  mutation deleteProjectConnection($uid: String) {
    deleteProjectConnection(uid: $uid) {
      ${responseGqlFields(projectConnectionGqlFields)}
    }
  }
`;

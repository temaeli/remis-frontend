import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * Deliberately does not use `baseGqlFields`. This table lives in the DBA-owned
 * `remis_core_schema`, whose audit block has no `updatedAt` or `deletedAt` —
 * asking for them fails the whole query.
 *
 * `uid` is aliased onto `id` because there is no uid column: the uuid primary key
 * is the public identifier.
 */
export const identityTypeGqlFields = `
  id
  uid: id
  assignedNumber
  name
  description
  active
  isDeleted
  createdAt
`;

//  Queries
export const ALL_IDENTITY_TYPES = gql`
  query allIdentityTypes {
    allIdentityTypes {
      ${identityTypeGqlFields}
    }
  }
`;

export const ALL_IDENTITY_TYPES_PAGEABLE = gql`
  query allIdentityTypesPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allIdentityTypesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(identityTypeGqlFields)}
    }
  }
`;

export const FIND_IDENTITY_TYPE = gql`
  query findIdentityType($uid: String) {
    findIdentityType(uid: $uid) {
      ${responseGqlFields(identityTypeGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_IDENTITY_TYPE = gql`
  mutation saveIdentityType($input: IdentityTypeDtoInput) {
    saveIdentityType(input: $input) {
      ${responseGqlFields(identityTypeGqlFields)}
    }
  }
`;

export const DELETE_IDENTITY_TYPE = gql`
  mutation deleteIdentityType($uid: String) {
    deleteIdentityType(uid: $uid) {
      ${responseGqlFields(identityTypeGqlFields)}
    }
  }
`;

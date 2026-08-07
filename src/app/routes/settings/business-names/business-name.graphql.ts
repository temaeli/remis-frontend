import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * Deliberately does not use `baseGqlFields`. This table lives in the DBA-owned
 * `remis_core_schema`, whose audit block has no `updatedAt` or `deletedAt` —
 * asking for them fails the whole query.
 *
 * `uid` is aliased onto `id` because there is no uid column: the uuid primary key
 * is the public identifier, and the alias keeps `entity.uid` working for the
 * shared grid and view helpers.
 */
export const businessNameGqlFields = `
  id
  uid: id
  assignedNumber
  name
  description
  identityType {
    id
    uid: id
    name
  }
  isPublic
  active
  isDeleted
  createdAt
`;

//  Queries
export const ALL_BUSINESS_NAMES = gql`
  query allBusinessNames {
    allBusinessNames {
      ${businessNameGqlFields}
    }
  }
`;

export const ALL_BUSINESS_NAMES_PAGEABLE = gql`
  query allBusinessNamesPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allBusinessNamesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(businessNameGqlFields)}
    }
  }
`;

export const BUSINESS_NAMES_BY_PUBLIC = gql`
  query businessNamesByPublic($isPublic: Boolean) {
    businessNamesByPublic(isPublic: $isPublic) {
      ${businessNameGqlFields}
    }
  }
`;

export const FIND_BUSINESS_NAME = gql`
  query findBusinessName($uid: String) {
    findBusinessName(uid: $uid) {
      ${responseGqlFields(businessNameGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_BUSINESS_NAME = gql`
  mutation saveBusinessName($input: BusinessNameDtoInput) {
    saveBusinessName(input: $input) {
      ${responseGqlFields(businessNameGqlFields)}
    }
  }
`;

export const DELETE_BUSINESS_NAME = gql`
  mutation deleteBusinessName($uid: String) {
    deleteBusinessName(uid: $uid) {
      ${responseGqlFields(businessNameGqlFields)}
    }
  }
`;

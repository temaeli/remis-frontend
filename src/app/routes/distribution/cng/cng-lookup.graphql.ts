import { gql } from '@apollo/client/core';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

export const cngLookupGqlFields = `
  uid
  lookupType
  name
  symbol
  description
`;

export const CNG_LOOKUPS_BY_TYPE = gql`
  query cngLookupsByType($lookupType: CngLookupType) {
    cngLookupsByType(lookupType: $lookupType) {
      ${cngLookupGqlFields}
    }
  }
`;

export const FIND_CNG_LOOKUP = gql`
  query findCngLookup($uid: String!) {
    findCngLookup(uid: $uid) {
      ${responseGqlFields(cngLookupGqlFields)}
    }
  }
`;

export const SAVE_CNG_LOOKUP = gql`
  mutation saveCngLookup($dto: CngLookupDtoInput) {
    saveCngLookup(dto: $dto) {
      ${responseGqlFields(cngLookupGqlFields)}
    }
  }
`;

export const DELETE_CNG_LOOKUP = gql`
  mutation deleteCngLookup($uid: String!) {
    deleteCngLookup(uid: $uid) {
      ${responseGqlFields(cngLookupGqlFields)}
    }
  }
`;

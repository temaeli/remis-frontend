import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { assetRefGqlFields, assetRegistryGqlFields } from '../asset-registry.graphql';

export const landRegistrationGqlFields = `
  ${assetRegistryGqlFields}
  asset {
    ${assetRefGqlFields}
    status
  }
`;

//  Queries
export const ALL_LAND_REGISTRATIONS = gql`
  query allLandRegistrations {
    allLandRegistrations {
      ${landRegistrationGqlFields}
    }
  }
`;

export const LAND_REGISTRATIONS_BY_ASSET = gql`
  query landRegistrationsByAsset($assetUid: String) {
    landRegistrationsByAsset(assetUid: $assetUid) {
      ${landRegistrationGqlFields}
    }
  }
`;

export const ALL_LAND_REGISTRATIONS_PAGEABLE = gql`
  query allLandRegistrationsPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allLandRegistrationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(landRegistrationGqlFields)}
    }
  }
`;

export const FIND_LAND_REGISTRATION = gql`
  query findLandRegistration($uid: String) {
    findLandRegistration(uid: $uid) {
      ${responseGqlFields(landRegistrationGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_LAND_REGISTRATION = gql`
  mutation saveLandRegistration($input: LandRegistrationDtoInput) {
    saveLandRegistration(input: $input) {
      ${responseGqlFields(landRegistrationGqlFields)}
    }
  }
`;

export const DELETE_LAND_REGISTRATION = gql`
  mutation deleteLandRegistration($uid: String) {
    deleteLandRegistration(uid: $uid) {
      ${responseGqlFields(landRegistrationGqlFields)}
    }
  }
`;

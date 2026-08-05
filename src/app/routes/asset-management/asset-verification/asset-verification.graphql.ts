import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { assetRefGqlFields, assetRegistryGqlFields } from '../asset-registry.graphql';

export const assetVerificationGqlFields = `
  ${assetRegistryGqlFields}
  asset {
    ${assetRefGqlFields}
    status
  }
`;

//  Queries
export const ALL_ASSET_VERIFICATIONS = gql`
  query allAssetVerifications {
    allAssetVerifications {
      ${assetVerificationGqlFields}
    }
  }
`;

export const ASSET_VERIFICATIONS_BY_ASSET = gql`
  query assetVerificationsByAsset($assetUid: String) {
    assetVerificationsByAsset(assetUid: $assetUid) {
      ${assetVerificationGqlFields}
    }
  }
`;

export const ALL_ASSET_VERIFICATIONS_PAGEABLE = gql`
  query allAssetVerificationsPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allAssetVerificationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(assetVerificationGqlFields)}
    }
  }
`;

export const FIND_ASSET_VERIFICATION = gql`
  query findAssetVerification($uid: String) {
    findAssetVerification(uid: $uid) {
      ${responseGqlFields(assetVerificationGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_ASSET_VERIFICATION = gql`
  mutation saveAssetVerification($input: AssetVerificationDtoInput) {
    saveAssetVerification(input: $input) {
      ${responseGqlFields(assetVerificationGqlFields)}
    }
  }
`;

export const DELETE_ASSET_VERIFICATION = gql`
  mutation deleteAssetVerification($uid: String) {
    deleteAssetVerification(uid: $uid) {
      ${responseGqlFields(assetVerificationGqlFields)}
    }
  }
`;

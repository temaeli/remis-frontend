import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { assetRegistryGqlFields } from '../asset-registry.graphql';

// No asset field: remis_core_schema.verification_of_assets has no assets_id
// column, so a verification does not record which asset it was made against.
export const assetVerificationGqlFields = `
  ${assetRegistryGqlFields}
`;

//  Queries
export const ALL_ASSET_VERIFICATIONS = gql`
  query allAssetVerifications {
    allAssetVerifications {
      ${assetVerificationGqlFields}
    }
  }
`;

// ASSET_VERIFICATIONS_BY_ASSET removed with the backend query of the same name —
// verifications cannot be filtered by asset without an assets_id column.

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

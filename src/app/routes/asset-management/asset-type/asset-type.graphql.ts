import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { assetRegistryGqlFields } from '../asset-registry.graphql';

export const assetTypeGqlFields = `
  ${assetRegistryGqlFields}
  forLand
`;

//  Queries
export const ALL_ASSET_TYPES = gql`
  query allAssetTypes {
    allAssetTypes {
      ${assetTypeGqlFields}
    }
  }
`;

export const ASSET_TYPES_BY_FOR_LAND = gql`
  query assetTypesByForLand($forLand: Boolean) {
    assetTypesByForLand(forLand: $forLand) {
      ${assetTypeGqlFields}
    }
  }
`;

export const ALL_ASSET_TYPES_PAGEABLE = gql`
  query allAssetTypesPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allAssetTypesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(assetTypeGqlFields)}
    }
  }
`;

export const FIND_ASSET_TYPE = gql`
  query findAssetType($uid: String) {
    findAssetType(uid: $uid) {
      ${responseGqlFields(assetTypeGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_ASSET_TYPE = gql`
  mutation saveAssetType($input: AssetTypeDtoInput) {
    saveAssetType(input: $input) {
      ${responseGqlFields(assetTypeGqlFields)}
    }
  }
`;

export const DELETE_ASSET_TYPE = gql`
  mutation deleteAssetType($uid: String) {
    deleteAssetType(uid: $uid) {
      ${responseGqlFields(assetTypeGqlFields)}
    }
  }
`;

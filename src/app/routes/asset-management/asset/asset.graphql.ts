import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { assetRefGqlFields, assetRegistryGqlFields } from '../asset-registry.graphql';

export const assetGqlFields = `
  ${assetRegistryGqlFields}
  status
  reserved
  assetSubcategory {
    ${assetRefGqlFields}
    assetCategory {
      ${assetRefGqlFields}
      assetType {
        ${assetRefGqlFields}
        forLand
      }
    }
  }
`;

//  Queries
export const ALL_ASSETS = gql`
  query allAssets {
    allAssets {
      ${assetGqlFields}
    }
  }
`;

export const ASSETS_BY_STATUS = gql`
  query assetsByStatus($status: AssetStatus) {
    assetsByStatus(status: $status) {
      ${assetGqlFields}
    }
  }
`;

export const ASSETS_BY_SUBCATEGORY = gql`
  query assetsBySubcategory($assetSubcategoryUid: String) {
    assetsBySubcategory(assetSubcategoryUid: $assetSubcategoryUid) {
      ${assetGqlFields}
    }
  }
`;

export const ALL_ASSETS_PAGEABLE = gql`
  query allAssetsPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allAssetsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(assetGqlFields)}
    }
  }
`;

export const FIND_ASSET = gql`
  query findAsset($uid: String) {
    findAsset(uid: $uid) {
      ${responseGqlFields(assetGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_ASSET = gql`
  mutation saveAsset($input: AssetDtoInput) {
    saveAsset(input: $input) {
      ${responseGqlFields(assetGqlFields)}
    }
  }
`;

export const UPDATE_ASSET_STATUS = gql`
  mutation updateAssetStatus($uid: String, $status: AssetStatus) {
    updateAssetStatus(uid: $uid, status: $status) {
      ${responseGqlFields(assetGqlFields)}
    }
  }
`;

export const DELETE_ASSET = gql`
  mutation deleteAsset($uid: String) {
    deleteAsset(uid: $uid) {
      ${responseGqlFields(assetGqlFields)}
    }
  }
`;

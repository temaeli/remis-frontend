import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { assetRefGqlFields, assetRegistryGqlFields } from '../asset-registry.graphql';

export const assetCategoryGqlFields = `
  ${assetRegistryGqlFields}
  assetType {
    ${assetRefGqlFields}
    forLand
  }
`;

//  Queries
export const ALL_ASSET_CATEGORIES = gql`
  query allAssetCategories {
    allAssetCategories {
      ${assetCategoryGqlFields}
    }
  }
`;

export const ASSET_CATEGORIES_BY_TYPE = gql`
  query assetCategoriesByType($assetTypeUid: String) {
    assetCategoriesByType(assetTypeUid: $assetTypeUid) {
      ${assetCategoryGqlFields}
    }
  }
`;

export const ALL_ASSET_CATEGORIES_PAGEABLE = gql`
  query allAssetCategoriesPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allAssetCategoriesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(assetCategoryGqlFields)}
    }
  }
`;

export const FIND_ASSET_CATEGORY = gql`
  query findAssetCategory($uid: String) {
    findAssetCategory(uid: $uid) {
      ${responseGqlFields(assetCategoryGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_ASSET_CATEGORY = gql`
  mutation saveAssetCategory($input: AssetCategoryDtoInput) {
    saveAssetCategory(input: $input) {
      ${responseGqlFields(assetCategoryGqlFields)}
    }
  }
`;

export const DELETE_ASSET_CATEGORY = gql`
  mutation deleteAssetCategory($uid: String) {
    deleteAssetCategory(uid: $uid) {
      ${responseGqlFields(assetCategoryGqlFields)}
    }
  }
`;

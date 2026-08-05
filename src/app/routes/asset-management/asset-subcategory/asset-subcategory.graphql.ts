import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { assetRefGqlFields, assetRegistryGqlFields } from '../asset-registry.graphql';

export const assetSubcategoryGqlFields = `
  ${assetRegistryGqlFields}
  assetCategory {
    ${assetRefGqlFields}
    assetType {
      ${assetRefGqlFields}
    }
  }
`;

//  Queries
export const ALL_ASSET_SUBCATEGORIES = gql`
  query allAssetSubcategories {
    allAssetSubcategories {
      ${assetSubcategoryGqlFields}
    }
  }
`;

export const ASSET_SUBCATEGORIES_BY_CATEGORY = gql`
  query assetSubcategoriesByCategory($assetCategoryUid: String) {
    assetSubcategoriesByCategory(assetCategoryUid: $assetCategoryUid) {
      ${assetSubcategoryGqlFields}
    }
  }
`;

export const ALL_ASSET_SUBCATEGORIES_PAGEABLE = gql`
  query allAssetSubcategoriesPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allAssetSubcategoriesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(assetSubcategoryGqlFields)}
    }
  }
`;

export const FIND_ASSET_SUBCATEGORY = gql`
  query findAssetSubcategory($uid: String) {
    findAssetSubcategory(uid: $uid) {
      ${responseGqlFields(assetSubcategoryGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_ASSET_SUBCATEGORY = gql`
  mutation saveAssetSubcategory($input: AssetSubcategoryDtoInput) {
    saveAssetSubcategory(input: $input) {
      ${responseGqlFields(assetSubcategoryGqlFields)}
    }
  }
`;

export const DELETE_ASSET_SUBCATEGORY = gql`
  mutation deleteAssetSubcategory($uid: String) {
    deleteAssetSubcategory(uid: $uid) {
      ${responseGqlFields(assetSubcategoryGqlFields)}
    }
  }
`;

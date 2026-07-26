import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const customerCategoryGqlFields = `
code
description
migrated
name
${baseGqlFields}
`;

// Customer Category Mutations

export const ALL_CUSTOMER_CATEGORIES = gql`
  query allCustomerCategories{
   allCustomerCategories {
      ${customerCategoryGqlFields}
    }
  }
 `;

export const ALL_CUSTOMER_CATEGORIES_PAGEABLE = gql`
  query allCustomerCategoryPageable($pageableParam: PageableParamInput, $active: Boolean){
   allCustomerCategoryPageable(pageableParam: $pageableParam, active: $active) {
     ${pageGqlFields(customerCategoryGqlFields)}
    }
  }
 `;

export const FIND_CUSTOMER_CATEGORY = gql`
  query findCustomerCategory($uid: String!){
   findCustomerCategory(uid: $uid) {
      ${responseGqlFields(customerCategoryGqlFields)}
    }
  }
 `;

export const DELETE_CUSTOMER_CATEGORY = gql`
  mutation deleteCustomerCategory($uid: String){
   deleteCustomerCategory(uid: $uid) {
      ${responseGqlFields(customerCategoryGqlFields)}
    }
  }
 `;

export const SAVE_CUSTOMER_CATEGORY = gql`
  mutation saveCustomerCategory($dto: CustomerCategoryDtoInput){
   saveCustomerCategory(dto: $dto) {
      ${responseGqlFields(customerCategoryGqlFields)}
    }
  }
 `;

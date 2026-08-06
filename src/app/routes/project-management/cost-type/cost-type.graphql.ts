import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { projectRegistryGqlFields } from '../project-registry.graphql';

export const costTypeGqlFields = `
  ${projectRegistryGqlFields}
  costTypes
  latitude
  longitude
`;

//  Queries
export const ALL_COST_TYPES = gql`
  query allCostTypes {
    allCostTypes {
      ${costTypeGqlFields}
    }
  }
`;

export const ALL_COST_TYPES_PAGEABLE = gql`
  query allCostTypesPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allCostTypesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(costTypeGqlFields)}
    }
  }
`;

export const FIND_COST_TYPE = gql`
  query findCostType($uid: String) {
    findCostType(uid: $uid) {
      ${responseGqlFields(costTypeGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_COST_TYPE = gql`
  mutation saveCostType($input: CostTypeDtoInput) {
    saveCostType(input: $input) {
      ${responseGqlFields(costTypeGqlFields)}
    }
  }
`;

export const DELETE_COST_TYPE = gql`
  mutation deleteCostType($uid: String) {
    deleteCostType(uid: $uid) {
      ${responseGqlFields(costTypeGqlFields)}
    }
  }
`;

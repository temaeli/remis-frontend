import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { projectRegistryGqlFields, projectRefGqlFields } from '../project-registry.graphql';

export const costGqlFields = `
  ${projectRegistryGqlFields}
  amount
  costType {
    ${projectRefGqlFields}
  }
`;

//  Queries
export const ALL_COSTS = gql`
  query allCosts {
    allCosts {
      ${costGqlFields}
    }
  }
`;

export const ALL_COSTS_PAGEABLE = gql`
  query allCostsPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allCostsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(costGqlFields)}
    }
  }
`;

export const FIND_COST = gql`
  query findCost($uid: String) {
    findCost(uid: $uid) {
      ${responseGqlFields(costGqlFields)}
    }
  }
`;

export const COSTS_BY_COST_TYPE = gql`
  query costsByCostType($costTypeUid: String) {
    costsByCostType(costTypeUid: $costTypeUid) {
      ${costGqlFields}
    }
  }
`;

//  Mutations
export const SAVE_COST = gql`
  mutation saveCost($input: CostDtoInput) {
    saveCost(input: $input) {
      ${responseGqlFields(costGqlFields)}
    }
  }
`;

export const DELETE_COST = gql`
  mutation deleteCost($uid: String) {
    deleteCost(uid: $uid) {
      ${responseGqlFields(costGqlFields)}
    }
  }
`;

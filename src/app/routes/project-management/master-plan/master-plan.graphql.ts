import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { projectRegistryGqlFields } from '../project-registry.graphql';

export const registryMasterPlanGqlFields = `
  ${projectRegistryGqlFields}
  area
  latitude
  longitude
`;

//  Queries
export const ALL_REGISTRY_MASTER_PLANS = gql`
  query allRegistryMasterPlans {
    allRegistryMasterPlans {
      ${registryMasterPlanGqlFields}
    }
  }
`;

export const ALL_REGISTRY_MASTER_PLANS_PAGEABLE = gql`
  query allRegistryMasterPlansPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allRegistryMasterPlansPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(registryMasterPlanGqlFields)}
    }
  }
`;

export const FIND_REGISTRY_MASTER_PLAN = gql`
  query findRegistryMasterPlan($uid: String) {
    findRegistryMasterPlan(uid: $uid) {
      ${responseGqlFields(registryMasterPlanGqlFields)}
    }
  }
`;

//  Mutations
export const SAVE_REGISTRY_MASTER_PLAN = gql`
  mutation saveRegistryMasterPlan($input: RegistryMasterPlanDtoInput) {
    saveRegistryMasterPlan(input: $input) {
      ${responseGqlFields(registryMasterPlanGqlFields)}
    }
  }
`;

export const DELETE_REGISTRY_MASTER_PLAN = gql`
  mutation deleteRegistryMasterPlan($uid: String) {
    deleteRegistryMasterPlan(uid: $uid) {
      ${responseGqlFields(registryMasterPlanGqlFields)}
    }
  }
`;

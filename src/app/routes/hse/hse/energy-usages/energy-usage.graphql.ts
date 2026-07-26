import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const energyUsageFields = `
  date
  amountUsed
  unitOfMeasure
  remarks
  comment
  submittedAt
  approvedAt
  rejectedAt
  energyUse {
    uid
    code
    name
  }
  workingStation {
    uid
    name
  }
  createdBy {
    username
  }
  ${baseGqlFields}
`;

export const GET_ALL_ENERGY_USAGES = gql`
  query getAllEnergyUsagesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllEnergyUsagesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(energyUsageFields)}
    }
  }
`;

export const GET_ENERGY_USAGES_BY_ENERGY_USE = gql`
  query getEnergyUsageByEnergyUse($energyUseUid: String!, $active: Boolean, $pageableParam: PageableParamInput!){
    getEnergyUsageByEnergyUse(energyUseUid: $energyUseUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(energyUsageFields)}
    }
  }
`;

export const GET_ENERGY_USAGE_BY_UID = gql`
  query getEnergyUsageByUid($uid: String!){
    getEnergyUsageByUid(uid: $uid){
      ${responseGqlFields(energyUsageFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_ENERGY_USAGE = gql`
  mutation createOrUpdateEnergyUsage($input: EnergyUsageDtoInput!){
    createOrUpdateEnergyUsage(input: $input){
      ${responseGqlFields(energyUsageFields)}
    }
  }
`;

export const DELETE_ENERGY_USAGE = gql`
  mutation deleteEnergyUsage($uid: String!){
    deleteEnergyUsage(uid: $uid){
      ${responseGqlFields(energyUsageFields)}
    }
  }
`;

export const SUBMIT_ENERGY_USAGE = gql`
  mutation submitEnergyUsage($uid: String!){
    submitEnergyUsage(uid: $uid){
      ${responseGqlFields(energyUsageFields)}
    }
  }
`;

export const APPROVE_ENERGY_USAGE = gql`
  mutation approveEnergyUsage($uid: String!, $comment: String!){
    approveEnergyUsage(uid: $uid, comment: $comment){
      ${responseGqlFields(energyUsageFields)}
    }
  }
`;

export const REJECT_ENERGY_USAGE = gql`
  mutation rejectEnergyUsage($uid: String!, $comment: String!){
    rejectEnergyUsage(uid: $uid, comment: $comment){
      ${responseGqlFields(energyUsageFields)}
    }
  }
`;

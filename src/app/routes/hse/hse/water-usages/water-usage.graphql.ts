import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const waterUsageFields = `
  date
  meterReading
  amountUsed
  remarks
  comment
  submittedAt
  approvedAt
  rejectedAt
  waterUse {
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

export const GET_ALL_WATER_USAGES = gql`
  query getAllWaterUsagesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllWaterUsagesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(waterUsageFields)}
    }
  }
`;

export const GET_WATER_USAGES_BY_WATER_USE = gql`
  query getWaterUsageByWaterUse($waterUseUid: String!, $active: Boolean, $pageableParam: PageableParamInput!){
    getWaterUsageByWaterUse(waterUseUid: $waterUseUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(waterUsageFields)}
    }
  }
`;

export const GET_WATER_USAGE_BY_UID = gql`
  query getWaterUsageByUid($uid: String!){
    getWaterUsageByUid(uid: $uid){
      ${responseGqlFields(waterUsageFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_WATER_USAGE = gql`
  mutation createOrUpdateWaterUsage($input: WaterUsageDtoInput!){
    createOrUpdateWaterUsage(input: $input){
      ${responseGqlFields(waterUsageFields)}
    }
  }
`;

export const DELETE_WATER_USAGE = gql`
  mutation deleteWaterUsage($uid: String!){
    deleteWaterUsage(uid: $uid){
      ${responseGqlFields(waterUsageFields)}
    }
  }
`;

export const SUBMIT_WATER_USAGE = gql`
  mutation submitWaterUsage($uid: String!){
    submitWaterUsage(uid: $uid){
      ${responseGqlFields(waterUsageFields)}
    }
  }
`;

export const APPROVE_WATER_USAGE = gql`
  mutation approveWaterUsage($uid: String!, $comment: String!){
    approveWaterUsage(uid: $uid, comment: $comment){
      ${responseGqlFields(waterUsageFields)}
    }
  }
`;

export const REJECT_WATER_USAGE = gql`
  mutation rejectWaterUsage($uid: String!, $comment: String!){
    rejectWaterUsage(uid: $uid, comment: $comment){
      ${responseGqlFields(waterUsageFields)}
    }
  }
`;

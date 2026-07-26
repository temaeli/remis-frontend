import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
} from '@shared/fetch/graphql.constants';

export const waterUseFields = `
  code
  name
  description
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_WATER_USES = gql`
  query getAllWaterUsesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllWaterUsesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(waterUseFields)}
    }
  }
`;

export const GET_WATER_USE_BY_UID = gql`
  query getWaterUseByUid($uid: String!){
    getWaterUseByUid(uid: $uid){
      ${responseGqlFields(waterUseFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_WATER_USE = gql`
  mutation createOrUpdateWaterUse($input: WaterUseDtoInput!){
    createOrUpdateWaterUse(input: $input){
      ${responseGqlFields(waterUseFields)}
    }
  }
`;

export const DELETE_WATER_USE = gql`
  mutation deleteWaterUse($uid: String!){
    deleteWaterUse(uid: $uid){
      ${responseGqlFields(waterUseFields)}
    }
  }
`;

export const GET_TOTAL_WATER_USAGE_BY_WATER_USE = gql`
  query getTotalWaterUsageByWaterUse($waterUseUid: String!){
    getTotalWaterUsageByWaterUse(waterUseUid: $waterUseUid){
      ${plainResponseGqlFields}
    }
  }
`;

import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
} from '@shared/fetch/graphql.constants';

export const energyUseFields = `
  code
  name
  unitOfMeasure
  description
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_ENERGY_USES = gql`
  query getAllEnergyUsesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllEnergyUsesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(energyUseFields)}
    }
  }
`;

export const GET_ENERGY_USE_BY_UID = gql`
  query getEnergyUseByUid($uid: String!){
    getEnergyUseByUid(uid: $uid){
      ${responseGqlFields(energyUseFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_ENERGY_USE = gql`
  mutation createOrUpdateEnergyUse($input: EnergyUseDtoInput!){
    createOrUpdateEnergyUse(input: $input){
      ${responseGqlFields(energyUseFields)}
    }
  }
`;

export const DELETE_ENERGY_USE = gql`
  mutation deleteEnergyUse($uid: String!){
    deleteEnergyUse(uid: $uid){
      ${responseGqlFields(energyUseFields)}
    }
  }
`;

// ⚠️ Backend op name is verbatim `totalEnergyUsageByuse` (lowercase "use"), arg is `uid`.
export const GET_TOTAL_ENERGY_USAGE_BY_USE = gql`
  query totalEnergyUsageByuse($uid: String!){
    totalEnergyUsageByuse(uid: $uid){
      ${plainResponseGqlFields}
    }
  }
`;

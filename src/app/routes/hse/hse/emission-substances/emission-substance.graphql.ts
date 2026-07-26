import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
} from '@shared/fetch/graphql.constants';

export const emissionSubstanceFields = `
  code
  name
  unitOfMeasure
  conversionFactor
  energyUse {
    uid
    name
  }
  description
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_EMISSION_SUBSTANCES = gql`
  query getAllEmissionSubstancesPageable($active: Boolean, $pageableParam: PageableParamInput!){
    getAllEmissionSubstancesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(emissionSubstanceFields)}
    }
  }
`;

export const GET_EMISSION_SUBSTANCES_BY_ENERGY_USE = gql`
  query getEmissionSubstancesByEnergyUse($energyUseUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getEmissionSubstancesByEnergyUse(energyUseUid: $energyUseUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(emissionSubstanceFields)}
    }
  }
`;

export const GET_EMISSION_SUBSTANCE_BY_UID = gql`
  query getEmissionSubstanceByUid($uid: String!){
    getEmissionSubstanceByUid(uid: $uid){
      ${responseGqlFields(emissionSubstanceFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_EMISSION_SUBSTANCE = gql`
  mutation createOrUpdateEmissionSubstance($input: EmissionSubstanceDtoInput!){
    createOrUpdateEmissionSubstance(input: $input){
      ${responseGqlFields(emissionSubstanceFields)}
    }
  }
`;

export const DELETE_EMISSION_SUBSTANCE = gql`
  mutation deleteEmissionSubstance($uid: String!){
    deleteEmissionSubstance(uid: $uid){
      ${responseGqlFields(emissionSubstanceFields)}
    }
  }
`;

export const GET_TOTAL_EMISSION_BY_SUBSTANCE = gql`
  query totalEmissionBySubstance($uid: String!){
    totalEmissionBySubstance(uid: $uid){
      ${plainResponseGqlFields}
    }
  }
`;

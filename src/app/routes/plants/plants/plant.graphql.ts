import { gql } from '@apollo/client/core';
import { subwardFields } from '@routes/settings/regions/subward/subward.graphql';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import {
  responseGqlFields,
  pageGqlFields,
  baseGqlResponseFields,
} from '@shared/fetch/graphql.constants';

export const plantGqlFields = `
  name
  code
  blockNumber
  active
  dailyProductionCapacityMmscfd
  maximumCapacityMmscfd
  physicalAddress
  postalAddress
  createdAt
  deletedAt
  deletedBy
  id
  isDeleted
  uid
  updatedAt
  subWard{${subwardFields}}
  supervisorUser{
   id
   uid
   fullName
  }
`;

//
//  Mutations
export const SAVE_PLANT = gql`
  mutation savePlant($input: PlantDtoInput!){
   savePlant(input: $input) {
      ${responseGqlFields(plantGqlFields)}
    }
  }
 `;

export const DELETE_PLANT = gql`
  query deletePlant($uid: String!){
   deletePlant(uid: $uid) {
      ${responseGqlFields(plantGqlFields)}
    }
  }
 `;

//  Queries
export const ALL_PLANT = gql`
  query allPlant{
   allPlant {
      ${plantGqlFields}
    }
  }
 `;

export const ALL_PLANT_PAGEABLE = gql`
  query allPlantPageable($pageableParam: PageableParamInput, $active: Boolean){
   allPlantPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(plantGqlFields)}
    }
  }
 `;

export const FIND_PLANT = gql`
  query findPlant($uid: String!){
   findPlant(uid: $uid) {
      ${responseGqlFields(plantGqlFields)}
    }
  }
 `;

export const GET_ALL_USERS_PAGEABLE = gql`
  query getAllUsersPageable($pageableParam: PageableParamInput, $active: Boolean) {
    getAllUsersPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields('uid fullName')}
    }
  }
`;

import { gql } from '@apollo/client/core';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

export const plantFormGroupGqlFields = `
  active
  createdAt
  createdBy{
    fullName
    username
    email
  }
  deletedAt
  deletedBy
  id
  isDeleted
  migrated
  name
  inputType
  uid
  updatedAt
  updatedBy
`;

//
//  Mutations
export const SAVE_OR_UPDATE_PLANT_FORM_GROUP = gql`
  mutation saveOrUpdatePlantFormGroup($plantFormGroup: PlantFormGroupDtoInput){
   saveOrUpdatePlantFormGroup(plantFormGroup: $plantFormGroup) {
      ${responseGqlFields(plantFormGroupGqlFields)}
    }
  }
 `;

export const ACTIVATE_OR_DEACTIVATE_PLANT_FORM_GROUP = gql`
  mutation activateOrDeactivatePlantFormGroup($uid: String){
   activateOrDeactivatePlantFormGroup(uid: $uid) {
      ${responseGqlFields(plantFormGroupGqlFields)}
    }
  }
 `;

//  Queries
export const GET_PLANT_FORM_GROUP_OBJECT_BY_UID = gql`
  query getPlantFormGroupObjectByUid($uid: String){
   getPlantFormGroupObjectByUid(uid: $uid) {
      ${responseGqlFields(plantFormGroupGqlFields)}
    }
  }
 `;

export const GET_ALL_PLANT_FORM_GROUPS = gql`
  query getAllPlantFormGroups{
   getAllPlantFormGroups {
      ${plantFormGroupGqlFields}
    }
  }
 `;

export const GET_ALL_IN_ACTIVE_PLANT_FORM_GROUPS = gql`
  query getAllInActivePlantFormGroups{
   getAllInActivePlantFormGroups {
      ${plantFormGroupGqlFields}
    }
  }
 `;

export const GET_PLANT_FORM_GROUP_BY_UID = gql`
  query getPlantFormGroupByUid($uid: String){
   getPlantFormGroupByUid(uid: $uid) {
      ${responseGqlFields(plantFormGroupGqlFields)}
    }
  }
 `;

export const GET_FORM_GROUPS_BY_INPUT_TYPE = gql`
  query getFormGroupsByInputType($uid: String){
   getFormGroupsByInputType(uid: $uid) {
      ${plantFormGroupGqlFields}
    }
  }
 `;

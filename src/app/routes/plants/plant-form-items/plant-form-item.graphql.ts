import { gql } from '@apollo/client/core';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

export const plantFormItemGqlFields = `
  active
  createdAt
  createdBy{
    fullName
    username
    email
  }
  group{
    name
    inputType
    uid
  }
  deletedAt
  deletedBy
  id
  isDeleted
  migrated
  name
  uid
  updatedAt
  updatedBy
  hasSpecification
  maximumValue
  minimumValue
  specificationType
  unitOfMeasure
`;

//
//  Mutations
export const SAVE_OR_UPDATE_PLANT_FORM_ITEM = gql`
  mutation saveOrUpdatePlantFormItem($plantFormItem: PlantFormItemDtoInput){
   saveOrUpdatePlantFormItem(plantFormItem: $plantFormItem) {
      ${responseGqlFields(plantFormItemGqlFields)}
    }
  }
 `;

export const ACTIVATE_OR_DEACTIVATE_PLANT_FORM_ITEM = gql`
  mutation activateOrDeactivatePlantFormItem($uid: String){
   activateOrDeactivatePlantFormItem(uid: $uid) {
      ${responseGqlFields(plantFormItemGqlFields)}
    }
  }
 `;

//  Queries
export const GET_PLANT_FORM_ITEM_BY_UID = gql`
  query getPlantFormItemByUid($uid: String){
   getPlantFormItemByUid(uid: $uid) {
      ${responseGqlFields(plantFormItemGqlFields)}
    }
  }
 `;

export const GET_PLANT_FORM_ITEM_OBJECT_BY_UID = gql`
  query getPlantFormItemObjectByUid($uid: String){
   getPlantFormItemObjectByUid(uid: $uid) {
      ${responseGqlFields(plantFormItemGqlFields)}
    }
  }
 `;

export const GET_ALL_IN_ACTIVE_PLANT_FORM_ITEMS = gql`
  query getAllInActivePlantFormItems{
   getAllInActivePlantFormItems {
      ${plantFormItemGqlFields}
    }
  }
 `;

export const GET_ALL_PLANT_FORM_ITEMS = gql`
  query getAllPlantFormItems{
   getAllPlantFormItems {
      ${plantFormItemGqlFields}
    }
  }
 `;

export const GET_PLANT_FORM_ITEMS_BY_GROUP = gql`
  query getPlantFormItemsByGroup($groupUid: String){
   getPlantFormItemsByGroup(groupUid: $groupUid) {
      ${plantFormItemGqlFields}
    }
  }
 `;

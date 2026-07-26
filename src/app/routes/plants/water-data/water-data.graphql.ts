import { gql } from '@apollo/client/core';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const waterDataGqlFields = `
  createdBy{${userMinimalGqlFields}}
  firstTrain
  plant{name uid}
  secondTrain
  thirdTrain
  type
  ${baseGqlFields}
`;

//
//  Mutations
export const CREATE_UPDATE_WATER_DATA = gql`
  mutation createUpdateWaterData($uid: String, $inputs: WaterDataDtoInput!, $plantUid: String){
   createUpdateWaterData(uid: $uid, inputs: $inputs, plantUid: $plantUid) {
      ${responseGqlFields(waterDataGqlFields)}
    }
  }
 `;

//  Queries
export const GET_MY_WATER_DATA_PAGEABLE = gql`
  query getMyWaterDataPageable($pageableParam: PageableParamInput, $type: WaterDataType){
   getMyWaterDataPageable(pageableParam: $pageableParam, type: $type) {
      ${pageGqlFields(waterDataGqlFields)}
    }
  }
 `;

export const GET_ALL_WATER_DATA_PAGEABLE = gql`
  query getAllWaterDataPageable($pageableParam: PageableParamInput, $active: Boolean, $type: WaterDataType){
   getAllWaterDataPageable(pageableParam: $pageableParam, active: $active, type: $type) {
      ${pageGqlFields(waterDataGqlFields)}
    }
  }
 `;

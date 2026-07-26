import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { plantGqlFields } from '../plants/plant.graphql';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';

export const plantWaterReadingGqlFields = `
  active
  createdBy{${userMinimalGqlFields}}
  plant{${plantGqlFields}}
  producedCondensate
  producedWater
  waterDewPoint
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_PLANT_WATER_READING = gql`
  mutation savePlantWaterReading($input: PlantWaterReadingDtoInput!){
   savePlantWaterReading(input: $input) {
      ${responseGqlFields(plantWaterReadingGqlFields)}
    }
  }
 `;

//  Queries
export const ALL_PLANT_WATER_READING_PAGEABLE = gql`
  query allPlantWaterReadingPageable($pageableParam: PageableParamInput, $active: Boolean){
   allPlantWaterReadingPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(plantWaterReadingGqlFields)}
    }
  }
 `;

export const FIND_PLANT_WATER_READING = gql`
  query findPlantWaterReading($uid: String!){
   findPlantWaterReading(uid: $uid) {
      ${responseGqlFields(plantWaterReadingGqlFields)}
    }
  }
 `;

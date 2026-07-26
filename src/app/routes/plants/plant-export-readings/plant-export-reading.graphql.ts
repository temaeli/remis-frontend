import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { plantGqlFields } from '../plants/plant.graphql';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';

export const plantExportReadingGqlFields = `
  active
  createdBy{${userMinimalGqlFields}}
  availableCapacity
  exportedGas
  flaredGas
  producedGas
  utilizedCapacity
  pipelineExportFlowRate
  pipelineExportPressure
  pipelineExportTemperature
  plant{ ${plantGqlFields} }
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_PLANT_EXPORT_READING = gql`
  mutation savePlantExportReading($input: PlantExportReadingDtoInput!){
   savePlantExportReading(input: $input) {
      ${responseGqlFields(plantExportReadingGqlFields)}
    }
  }
 `;

//  Queries
export const FIND_PLANT_EXPORT_READING = gql`
  query findPlantExportReading($uid: String!){
   findPlantExportReading(uid: $uid) {
      ${responseGqlFields(plantExportReadingGqlFields)}
    }
  }
 `;

export const ALL_PLANT_EXPORT_READING_PAGEABLE = gql`
  query allPlantExportReadingPageable($pageableParam: PageableParamInput, $active: Boolean){
   allPlantExportReadingPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(plantExportReadingGqlFields)}
    }
  }
 `;

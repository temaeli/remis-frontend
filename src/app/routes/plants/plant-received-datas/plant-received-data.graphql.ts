import { gql } from '@apollo/client/core';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { plantGqlFields } from '../plants/plant.graphql';
import { clientMinimalGqlFields } from '@routes/client-registration/customers/clients.graphql';

export const plantReceivedDataGqlFields = `
  active
  client{ ${clientMinimalGqlFields} }
  createdBy{ ${userMinimalGqlFields} }
  #flaredGas
  ownUseGas
  plant{${plantGqlFields}}
  receivedRawGasPressure
  receivedRawGasTemperature
  receivedRawGasVolume
   ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_PLANT_PROCESSING_DATA = gql`
  mutation savePlantProcessingData($input: PlantReceivedDataDtoInput!){
   savePlantProcessingData(input: $input) {
      ${responseGqlFields(plantReceivedDataGqlFields)}
    }
  }
 `;

//  Queries
export const FIND_PLANT_PROCESSING_DATA = gql`
  query findPlantProcessingData($uid: String!){
   findPlantProcessingData(uid: $uid) {
      ${responseGqlFields(plantReceivedDataGqlFields)}
    }
  }
 `;

export const ALL_PLANT_PROCESSING_DATA_PAGEABLE = gql`
  query allPlantProcessingDataPageable($pageableParam: PageableParamInput, $active: Boolean = true){
   allPlantProcessingDataPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(plantReceivedDataGqlFields)}
    }
  }
 `;

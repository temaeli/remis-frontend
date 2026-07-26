import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  plainResponseGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const powerGeneratorFields = `
  code
  name
  serialNumber
  manufacturer
  model
  capacityKva
  capacityKw
  voltage
  frequencyHz
  phaseType
  powerFactor
  fuelType
  fuelTankCapacityLiters
  minimumVolume
  fuelConsumptionPerHour
  remarks
  engineNumber
  engineModel
  engineManufacturer
  installationDate
  commissioningDate
  operatingHours
  status
  conditionStatus
  lastServiceDate
  nextServiceDate
  maintenanceIntervalHours
  workStation {
    uid
    name
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_POWER_GENERATORS = gql`
  query getAllPowerGeneratorsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPowerGeneratorsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorFields)}
    }
  }
`;

export const GET_POWER_GENERATORS_BY_STATION = gql`
  query getPowerGeneratorsByStation($stationUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getPowerGeneratorsByStation(stationUid: $stationUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_BY_UID = gql`
  query getPowerGeneratorByUid($uid: String!){
    getPowerGeneratorByUid(uid: $uid){
      ${responseGqlFields(powerGeneratorFields)}
    }
  }
`;

export const CREATE_POWER_GENERATOR = gql`
  mutation createPowerGenerator($input: PowerGeneratorDtoInput!){
    createPowerGenerator(input: $input){
      ${responseGqlFields(powerGeneratorFields)}
    }
  }
`;

export const UPDATE_POWER_GENERATOR = gql`
  mutation updatePowerGenerator($input: PowerGeneratorDtoInput!){
    updatePowerGenerator(input: $input){
      ${responseGqlFields(powerGeneratorFields)}
    }
  }
`;

export const DELETE_POWER_GENERATOR = gql`
  mutation deletePowerGenerator($uid: String!){
    deletePowerGenerator(uid: $uid){
      ${responseGqlFields(powerGeneratorFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_FUEL_LEVEL = gql`
  query getPowerGeneratorFuelLevel($uid: String!){
    getPowerGeneratorFuelLevel(uid: $uid){
      ${plainResponseGqlFields}
    }
  }
`;

export const GET_POWER_GENERATOR_TOTAL_RUN_HOURS = gql`
  query getPowerGeneratorTotalRunHours($generatorUid: String!){
    getPowerGeneratorTotalRunHours(generatorUid: $generatorUid){
      ${plainResponseGqlFields}
    }
  }
`;

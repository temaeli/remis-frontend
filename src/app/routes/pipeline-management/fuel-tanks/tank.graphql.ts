import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

export const powerGeneratorTankFields = `
  name
  capacityInLitres
  minimumVolume
  workingStation {
    uid
    name
    code
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_POWER_GENERATOR_TANKS = gql`
  query getAllPowerGeneratorTanksPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPowerGeneratorTanksPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorTankFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_TANKS_BY_GENERATOR = gql`
  query getPowerGeneratorTanksByGenerator($generatorUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getPowerGeneratorTanksByGenerator(generatorUid: $generatorUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorTankFields)}
    }
  }
`;

// SPQR quirk: BE param name kept as `generatorUid` even though it takes a Working Station UID.
export const GET_FUEL_TANKS_BY_WORKSTATION = gql`
  query getFuelTanksByWorkStation($generatorUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getFuelTanksByWorkStation(generatorUid: $generatorUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorTankFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_TANK_BY_UID = gql`
  query getPowerGeneratorTankByUid($uid: String!){
    getPowerGeneratorTankByUid(uid: $uid){
      ${responseGqlFields(powerGeneratorTankFields)}
    }
  }
`;

export const CREATE_POWER_GENERATOR_TANK = gql`
  mutation createPowerGeneratorTank($input: FuelTankDtoInput!){
    createPowerGeneratorTank(input: $input){
      ${responseGqlFields(powerGeneratorTankFields)}
    }
  }
`;

export const UPDATE_POWER_GENERATOR_TANK = gql`
  mutation updatePowerGeneratorTank($input: FuelTankDtoInput!){
    updatePowerGeneratorTank(input: $input){
      ${responseGqlFields(powerGeneratorTankFields)}
    }
  }
`;

export const DELETE_POWER_GENERATOR_TANK = gql`
  mutation deletePowerGeneratorTank($uid: String!){
    deletePowerGeneratorTank(uid: $uid){
      ${responseGqlFields(powerGeneratorTankFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_TANK_FUEL_LEVEL = gql`
  query getPowerGeneratorTankFuelLevel($uid: String!){
    getPowerGeneratorTankFuelLevel(uid: $uid){
      ${plainResponseGqlFields}
    }
  }
`;

export const GET_MONTHLY_FUEL_BALANCE = gql`
  query getMonthlyFuelBalance($input: FuelBalanceReportDtoInput!){
    getMonthlyFuelBalance(input: $input){
      ${plainResponseGqlFields}
    }
  }
`;

export const GENERATE_MONTHLY_FUEL_BALANCE_REPORT = gql`
  query generateMonthlyFuelBalanceReport($input: FuelBalanceReportDtoInput!){
    generateMonthlyFuelBalanceReport(input: $input){
      ${plainResponseGqlFields}
    }
  }
`;

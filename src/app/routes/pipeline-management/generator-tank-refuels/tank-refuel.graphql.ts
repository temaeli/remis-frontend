import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const generatorTankRefuelFields = `
  date
  quantityInLitres
  newVolume
  submittedAt
  approvedAt
  approvedBy {
    uid
    username
    firstName
    lastName
  }
  rejectedAt
  rejectedBy {
    uid
    username
    firstName
    lastName
  }
  remarks
  comment
  generatorTank {
    uid
    name
    capacityInLitres
    workingStation {
      uid
      name
      code
    }
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_GENERATOR_TANK_REFUELS = gql`
  query getAllGeneratorTankRefuelsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllGeneratorTankRefuelsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(generatorTankRefuelFields)}
    }
  }
`;

export const GET_GENERATOR_TANK_REFUELS_BY_TANK = gql`
  query getGeneratorTankRefuelsByTank($tankUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getGeneratorTankRefuelsByTank(tankUid: $tankUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(generatorTankRefuelFields)}
    }
  }
`;

export const GET_GENERATOR_TANK_REFUEL_BY_UID = gql`
  query getGeneratorTankRefuelByUid($uid: String!){
    getGeneratorTankRefuelByUid(uid: $uid){
      ${responseGqlFields(generatorTankRefuelFields)}
    }
  }
`;

export const CREATE_GENERATOR_TANK_REFUEL = gql`
  mutation createGeneratorTankRefuel($input: FuelTankRefuelDtoInput!){
    createGeneratorTankRefuel(input: $input){
      ${responseGqlFields(generatorTankRefuelFields)}
    }
  }
`;

export const UPDATE_GENERATOR_TANK_REFUEL = gql`
  mutation updateGeneratorTankRefuel($input: FuelTankRefuelDtoInput!){
    updateGeneratorTankRefuel(input: $input){
      ${responseGqlFields(generatorTankRefuelFields)}
    }
  }
`;

export const DELETE_GENERATOR_TANK_REFUEL = gql`
  mutation deleteGeneratorTankRefuel($uid: String!){
    deleteGeneratorTankRefuel(uid: $uid){
      ${responseGqlFields(generatorTankRefuelFields)}
    }
  }
`;

export const SUBMIT_GENERATOR_TANK_REFUEL = gql`
  mutation submitGeneratorTankRefuel($uid: String!){
    submitGeneratorTankRefuel(uid: $uid){
      ${responseGqlFields(generatorTankRefuelFields)}
    }
  }
`;

export const APPROVE_GENERATOR_TANK_REFUEL = gql`
  mutation approveGeneratorTankRefuel($uid: String!, $comment: String!){
    approveGeneratorTankRefuel(uid: $uid, comment: $comment){
      ${responseGqlFields(generatorTankRefuelFields)}
    }
  }
`;

export const REJECT_GENERATOR_TANK_REFUEL = gql`
  mutation rejectGeneratorTankRefuel($uid: String!, $comment: String!){
    rejectGeneratorTankRefuel(uid: $uid, comment: $comment){
      ${responseGqlFields(generatorTankRefuelFields)}
    }
  }
`;

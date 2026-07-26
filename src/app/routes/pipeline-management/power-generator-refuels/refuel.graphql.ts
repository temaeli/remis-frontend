import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const powerGeneratorRefuelFields = `
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
  powerGenerator {
    uid
    name
    code
  }
  generatorTank {
    uid
    name
    capacityInLitres
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_POWER_GENERATOR_REFUELS = gql`
  query getAllPowerGeneratorRefuelsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPowerGeneratorRefuelsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_REFUELS_BY_GENERATOR = gql`
  query getPowerGeneratorRefuelsByGenerator($generatorUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getPowerGeneratorRefuelsByGenerator(generatorUid: $generatorUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_REFUELS_BY_TANK = gql`
  query getPowerGeneratorRefuelsByTank($tankUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getPowerGeneratorRefuelsByTank(tankUid: $tankUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_REFUEL_BY_UID = gql`
  query getPowerGeneratorRefuelByUid($uid: String!){
    getPowerGeneratorRefuelByUid(uid: $uid){
      ${responseGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

export const CREATE_POWER_GENERATOR_REFUEL = gql`
  mutation createPowerGeneratorRefuel($input: PowerGeneratorRefuelDtoInput!){
    createPowerGeneratorRefuel(input: $input){
      ${responseGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

export const UPDATE_POWER_GENERATOR_REFUEL = gql`
  mutation updatePowerGeneratorRefuel($input: PowerGeneratorRefuelDtoInput!){
    updatePowerGeneratorRefuel(input: $input){
      ${responseGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

export const DELETE_POWER_GENERATOR_REFUEL = gql`
  mutation deletePowerGeneratorRefuel($uid: String!){
    deletePowerGeneratorRefuel(uid: $uid){
      ${responseGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

export const SUBMIT_POWER_GENERATOR_REFUEL = gql`
  mutation submitPowerGeneratorRefuel($uid: String!){
    submitPowerGeneratorRefuel(uid: $uid){
      ${responseGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

export const APPROVE_POWER_GENERATOR_REFUEL = gql`
  mutation approvePowerGeneratorRefuel($uid: String!, $comment: String!){
    approvePowerGeneratorRefuel(uid: $uid, comment: $comment){
      ${responseGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

export const REJECT_POWER_GENERATOR_REFUEL = gql`
  mutation rejectPowerGeneratorRefuel($uid: String!, $comment: String!){
    rejectPowerGeneratorRefuel(uid: $uid, comment: $comment){
      ${responseGqlFields(powerGeneratorRefuelFields)}
    }
  }
`;

// ---------- EquipmentRefuel (polymorphic — POWER_GENERATOR | MOTOR_VEHICLE | MOBILE_EQUIPMENT | OTHER) ----------

export const equipmentRefuelFields = `
  date
  quantityInLitres
  newVolume
  newTankVolume
  equipmentType
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
  powerGenerator {
    uid
    name
    code
  }
  generatorTank {
    uid
    name
    capacityInLitres
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_EQUIPMENT_REFUELS = gql`
  query getAllEquipmentRefuelsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllEquipmentRefuelsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(equipmentRefuelFields)}
    }
  }
`;

export const GET_EQUIPMENT_REFUELS_BY_GENERATOR = gql`
  query getEquipmentRefuelsByGenerator($generatorUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getEquipmentRefuelsByGenerator(generatorUid: $generatorUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(equipmentRefuelFields)}
    }
  }
`;

export const GET_EQUIPMENT_REFUELS_BY_TANK = gql`
  query getEquipmentRefuelsByTank($tankUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getEquipmentRefuelsByTank(tankUid: $tankUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(equipmentRefuelFields)}
    }
  }
`;

export const GET_EQUIPMENT_REFUEL_BY_UID = gql`
  query getEquipmentRefuelByUid($uid: String!){
    getEquipmentRefuelByUid(uid: $uid){
      ${responseGqlFields(equipmentRefuelFields)}
    }
  }
`;

export const CREATE_EQUIPMENT_REFUEL = gql`
  mutation createEquipmentRefuel($input: EquipmentRefuelDtoInput!){
    createEquipmentRefuel(input: $input){
      ${responseGqlFields(equipmentRefuelFields)}
    }
  }
`;

export const UPDATE_EQUIPMENT_REFUEL = gql`
  mutation updateEquipmentRefuel($input: EquipmentRefuelDtoInput!){
    updateEquipmentRefuel(input: $input){
      ${responseGqlFields(equipmentRefuelFields)}
    }
  }
`;

export const DELETE_EQUIPMENT_REFUEL = gql`
  mutation deleteEquipmentRefuel($uid: String!){
    deleteEquipmentRefuel(uid: $uid){
      ${responseGqlFields(equipmentRefuelFields)}
    }
  }
`;

export const SUBMIT_EQUIPMENT_REFUEL = gql`
  mutation submitEquipmentRefuel($uid: String!){
    submitEquipmentRefuel(uid: $uid){
      ${responseGqlFields(equipmentRefuelFields)}
    }
  }
`;

export const APPROVE_EQUIPMENT_REFUEL = gql`
  mutation approveEquipmentRefuel($uid: String!, $comment: String!){
    approveEquipmentRefuel(uid: $uid, comment: $comment){
      ${responseGqlFields(equipmentRefuelFields)}
    }
  }
`;

export const REJECT_EQUIPMENT_REFUEL = gql`
  mutation rejectEquipmentRefuel($uid: String!, $comment: String!){
    rejectEquipmentRefuel(uid: $uid, comment: $comment){
      ${responseGqlFields(equipmentRefuelFields)}
    }
  }
`;

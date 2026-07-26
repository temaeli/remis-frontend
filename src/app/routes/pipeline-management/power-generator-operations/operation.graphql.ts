import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const powerGeneratorOperationFields = `
  date
  fuelLevel
  fuelConsumed
  runHours
  accumulatedRunHours
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
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_POWER_GENERATOR_OPERATIONS = gql`
  query getAllPowerGeneratorOperationsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPowerGeneratorOperationsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorOperationFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_OPERATIONS_BY_GENERATOR = gql`
  query getPowerGeneratorOperationsByGenerator($generatorUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getPowerGeneratorOperationsByGenerator(generatorUid: $generatorUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(powerGeneratorOperationFields)}
    }
  }
`;

export const GET_POWER_GENERATOR_OPERATION_BY_UID = gql`
  query getPowerGeneratorOperationByUid($uid: String!){
    getPowerGeneratorOperationByUid(uid: $uid){
      ${responseGqlFields(powerGeneratorOperationFields)}
    }
  }
`;

export const CREATE_POWER_GENERATOR_OPERATION = gql`
  mutation createPowerGeneratorOperation($input: PowerGeneratorOperationDtoInput!){
    createPowerGeneratorOperation(input: $input){
      ${responseGqlFields(powerGeneratorOperationFields)}
    }
  }
`;

export const UPDATE_POWER_GENERATOR_OPERATION = gql`
  mutation updatePowerGeneratorOperation($input: PowerGeneratorOperationDtoInput!){
    updatePowerGeneratorOperation(input: $input){
      ${responseGqlFields(powerGeneratorOperationFields)}
    }
  }
`;

export const DELETE_POWER_GENERATOR_OPERATION = gql`
  mutation deletePowerGeneratorOperation($uid: String!){
    deletePowerGeneratorOperation(uid: $uid){
      ${responseGqlFields(powerGeneratorOperationFields)}
    }
  }
`;

export const SUBMIT_POWER_GENERATOR_OPERATION = gql`
  mutation submitPowerGeneratorOperation($uid: String!){
    submitPowerGeneratorOperation(uid: $uid){
      ${responseGqlFields(powerGeneratorOperationFields)}
    }
  }
`;

export const APPROVE_POWER_GENERATOR_OPERATION = gql`
  mutation approvePowerGeneratorOperation($uid: String!, $comment: String!){
    approvePowerGeneratorOperation(uid: $uid, comment: $comment){
      ${responseGqlFields(powerGeneratorOperationFields)}
    }
  }
`;

export const REJECT_POWER_GENERATOR_OPERATION = gql`
  mutation rejectPowerGeneratorOperation($uid: String!, $comment: String!){
    rejectPowerGeneratorOperation(uid: $uid, comment: $comment){
      ${responseGqlFields(powerGeneratorOperationFields)}
    }
  }
`;

import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from 'app/routes/users-managment/users/user.graphql';
import { stagesGqlFields } from '../hse-reports/hse-report.graphql';
import { plantFormItemGqlFields } from '../plant-form-items/plant-form-item.graphql';

export const fuelFlaredGasGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  ${baseGqlFields}
`;
// stages{${stagesGqlFields}}

export const fuelFlaredGasItemGqlFields = `
  active
  measure
  item{${plantFormItemGqlFields}}
  fuelFlaredGas{name uid}
  ${baseGqlFields}
`;

export const SAVE_FUEL_FLARED_GAS = gql`
  mutation saveFuelFlaredGas(
    $inputs: [FuelFlaredGasDataInputDtoInput]!
    $uid: String
    $plantUid: String
  ) {
    saveFuelFlaredGas(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(fuelFlaredGasGqlFields)}
    }
  }
`;

export const PROCESS_FUEL_FLARED_GAS = gql`
  mutation processFuelFlaredGas($processingDto: ProcessingDtoInput!) {
    processFuelFlaredGas(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

export const GET_FUEL_FLARED_GAS_BY_UID = gql`
  query getFuelFlaredGasByUid($uid: String) {
    getFuelFlaredGasByUid(uid: $uid) {
      ${responseGqlFields(fuelFlaredGasGqlFields)}
    }
  }
`;

export const GET_FUEL_FLARED_GAS_ITEMS = gql`
  query getFuelFlaredGasItems($formUid: String) {
    getFuelFlaredGasItems(formUid: $formUid) {
      ${fuelFlaredGasItemGqlFields}
    }
  }
`;

export const GET_FUEL_FLARED_GASES_PAGEABLE = gql`
  query getFuelFlaredGasesPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getFuelFlaredGasesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(fuelFlaredGasGqlFields)}
    }
  }
`;

export const GET_OFFICER_FUEL_FLARED_GAS_PAGEABLE = gql`
  query getOfficerFuelFlaredGasPageable($pageableParam: PageableParamInput!) {
    getOfficerFuelFlaredGasPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fuelFlaredGasGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_FUEL_FLARED_GAS_PAGEABLE = gql`
  query getShiftSupervisorFuelFlaredGasPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorFuelFlaredGasPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fuelFlaredGasGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_FUEL_FLARED_GAS_PAGEABLE = gql`
  query getSuperintendentFuelFlaredGasPageable($pageableParam: PageableParamInput!) {
    getSuperintendentFuelFlaredGasPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fuelFlaredGasGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_FUEL_FLARED_GAS_PAGEABLE = gql`
  query getPlantManagerFuelFlaredGasPageable($pageableParam: PageableParamInput!) {
    getPlantManagerFuelFlaredGasPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fuelFlaredGasGqlFields)}
    }
  }
`;

export const GET_MY_FUEL_FLARED_GAS_PAGEABLE = gql`
  query getMyFuelFlaredGasPageable($pageableParam: PageableParamInput!) {
    getMyFuelFlaredGasPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fuelFlaredGasGqlFields)}
    }
  }
`;

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

export const waterTankLevelGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const waterTankLevelItemGqlFields = `
  active
  measure
  item{${plantFormItemGqlFields}}
  waterTankLevel{name uid}
  ${baseGqlFields}
`;

export const SAVE_WATER_TANK_LEVEL = gql`
  mutation saveWaterTankLevel(
    $inputs: [WaterTankLevelDataInputDtoInput]!
    $uid: String
    $plantUid: String
  ) {
    saveWaterTankLevel(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(waterTankLevelGqlFields)}
    }
  }
`;

export const PROCESS_WATER_TANK_LEVEL = gql`
  mutation processWaterTankLevel($processingDto: ProcessingDtoInput!) {
    processWaterTankLevel(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

export const GET_WATER_TANK_LEVEL_BY_UID = gql`
  query getWaterTankLevelByUid($uid: String) {
    getWaterTankLevelByUid(uid: $uid) {
      ${responseGqlFields(waterTankLevelGqlFields)}
    }
  }
`;

export const GET_WATER_TANK_LEVEL_ITEMS = gql`
  query getWaterTankLevelItems($formUid: String) {
    getWaterTankLevelItems(formUid: $formUid) {
      ${waterTankLevelItemGqlFields}
    }
  }
`;

export const GET_WATER_TANK_LEVELS_PAGEABLE = gql`
  query getWaterTankLevelsPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getWaterTankLevelsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(waterTankLevelGqlFields)}
    }
  }
`;

export const GET_OFFICER_WATER_TANK_LEVEL_PAGEABLE = gql`
  query getOfficerWaterTankLevelPageable($pageableParam: PageableParamInput!) {
    getOfficerWaterTankLevelPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterTankLevelGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_WATER_TANK_LEVEL_PAGEABLE = gql`
  query getShiftSupervisorWaterTankLevelPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorWaterTankLevelPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterTankLevelGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_WATER_TANK_LEVEL_PAGEABLE = gql`
  query getSuperintendentWaterTankLevelPageable($pageableParam: PageableParamInput!) {
    getSuperintendentWaterTankLevelPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterTankLevelGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_WATER_TANK_LEVEL_PAGEABLE = gql`
  query getPlantManagerWaterTankLevelPageable($pageableParam: PageableParamInput!) {
    getPlantManagerWaterTankLevelPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterTankLevelGqlFields)}
    }
  }
`;

export const GET_MY_WATER_TANK_LEVEL_PAGEABLE = gql`
  query getMyWaterTankLevelPageable($pageableParam: PageableParamInput!) {
    getMyWaterTankLevelPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterTankLevelGqlFields)}
    }
  }
`;

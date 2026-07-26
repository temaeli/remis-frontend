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

export const potableWaterProductionGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  ${baseGqlFields}
`;
//  stages{${stagesGqlFields}}

export const potableWaterProductionItemGqlFields = `
  active
  previousDay
  today
  item{${plantFormItemGqlFields}}
  potableWaterProduction{name uid}
  ${baseGqlFields}
`;

export const SAVE_POTABLE_WATER_PRODUCTION = gql`
  mutation savePotableWaterProduction(
    $inputs: [WaterDataInputFormDtoInput]!
    $uid: String
    $plantUid: String
  ) {
    savePotableWaterProduction(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(potableWaterProductionGqlFields)}
    }
  }
`;

export const PROCESS_POTABLE_WATER_PRODUCTION = gql`
  mutation processPotableWaterProduction($processingDto: ProcessingDtoInput!) {
    processPotableWaterProduction(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

export const GET_POTABLE_WATER_PRODUCTION_BY_UID = gql`
  query getPotableWaterProductionByUid($uid: String) {
    getPotableWaterProductionByUid(uid: $uid) {
      ${responseGqlFields(potableWaterProductionGqlFields)}
    }
  }
`;

export const GET_POTABLE_WATER_PRODUCTION_ITEMS = gql`
  query getPotableWaterProductionItems($reportUid: String) {
    getPotableWaterProductionItems(reportUid: $reportUid) {
      ${potableWaterProductionItemGqlFields}
    }
  }
`;

export const GET_POTABLE_WATER_PRODUCTIONS_PAGEABLE = gql`
  query getPotableWaterProductionsPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getPotableWaterProductionsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(potableWaterProductionGqlFields)}
    }
  }
`;

export const GET_OFFICER_POTABLE_WATER_PRODUCTION_PAGEABLE = gql`
  query getOfficerPotableWaterProductionPageable($pageableParam: PageableParamInput!) {
    getOfficerPotableWaterProductionPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterProductionGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_POTABLE_WATER_PRODUCTION_PAGEABLE = gql`
  query getShiftSupervisorPotableWaterProductionPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorPotableWaterProductionPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterProductionGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_POTABLE_WATER_PRODUCTION_PAGEABLE = gql`
  query getSuperintendentPotableWaterProductionPageable($pageableParam: PageableParamInput!) {
    getSuperintendentPotableWaterProductionPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterProductionGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_POTABLE_WATER_PRODUCTION_PAGEABLE = gql`
  query getPlantManagerPotableWaterProductionPageable($pageableParam: PageableParamInput!) {
    getPlantManagerPotableWaterProductionPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterProductionGqlFields)}
    }
  }
`;

export const GET_MY_POTABLE_WATER_PRODUCTION_PAGEABLE = gql`
  query getMyPotableWaterProductionPageable($pageableParam: PageableParamInput!) {
    getMyPotableWaterProductionPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterProductionGqlFields)}
    }
  }
`;

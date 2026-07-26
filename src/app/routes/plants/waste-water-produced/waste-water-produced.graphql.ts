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

export const wasteWaterProducedGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  ${baseGqlFields}
`;

//  stages{${stagesGqlFields}}

export const wasteWaterProducedItemGqlFields = `
  active
  previousDay
  today
  item{${plantFormItemGqlFields}}
  wasteWaterProduced{name uid}
  ${baseGqlFields}
`;

export const SAVE_WASTE_WATER_PRODUCED = gql`
  mutation saveWasteWaterProduced(
    $inputs: [WaterDataInputFormDtoInput]!
    $uid: String
    $plantUid: String
  ) {
    saveWasteWaterProduced(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(wasteWaterProducedGqlFields)}
    }
  }
`;

export const PROCESS_WASTE_WATER_PRODUCED = gql`
  mutation processWasteWaterProduced($processingDto: ProcessingDtoInput!) {
    processWasteWaterProduced(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

export const GET_WASTE_WATER_PRODUCED_ITEMS = gql`
  query getWasteWaterProducedItems($reportUid: String) {
    getWasteWaterProducedItems(reportUid: $reportUid) {
      ${wasteWaterProducedItemGqlFields}
    }
  }
`;

export const GET_WASTE_WATER_PRODUCED_PAGEABLE = gql`
  query getWasteWaterProducedPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getWasteWaterProducedPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(wasteWaterProducedGqlFields)}
    }
  }
`;

export const GET_WASTE_WATER_PRODUCED_BY_UID = gql`
  query getWasteWaterProducedByUid($uid: String) {
    getWasteWaterProducedByUid(uid: $uid) {
      ${responseGqlFields(wasteWaterProducedGqlFields)}
    }
  }
`;

export const GET_OFFICER_WASTE_WATER_PRODUCED_PAGEABLE = gql`
  query getOfficerWasteWaterProducedPageable($pageableParam: PageableParamInput!) {
    getOfficerWasteWaterProducedPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterProducedGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_WASTE_WATER_PRODUCED_PAGEABLE = gql`
  query getShiftSupervisorWasteWaterProducedPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorWasteWaterProducedPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterProducedGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_WASTE_WATER_PRODUCED_PAGEABLE = gql`
  query getSuperintendentWasteWaterProducedPageable($pageableParam: PageableParamInput!) {
    getSuperintendentWasteWaterProducedPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterProducedGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_WASTE_WATER_PRODUCED_PAGEABLE = gql`
  query getPlantManagerWasteWaterProducedPageable($pageableParam: PageableParamInput!) {
    getPlantManagerWasteWaterProducedPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterProducedGqlFields)}
    }
  }
`;

export const GET_MY_WASTE_WATER_PRODUCED_PAGEABLE = gql`
  query getMyWasteWaterProducedPageable($pageableParam: PageableParamInput!) {
    getMyWasteWaterProducedPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterProducedGqlFields)}
    }
  }
`;

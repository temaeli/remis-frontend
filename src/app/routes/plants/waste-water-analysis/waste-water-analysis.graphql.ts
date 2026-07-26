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

export const wasteWaterAnalysisGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const wasteWaterAnalysisItemGqlFields = `
  active
  testedResult
  item{${plantFormItemGqlFields}}
  wasteWaterAnalysis{name uid}
  ${baseGqlFields}
`;

export const SAVE_WASTE_WATER_ANALYSIS = gql`
  mutation saveWasteWaterAnalysis(
    $inputs: [WasteWaterAnalysisDataInputDtoInput]!
    $uid: String
    $plantUid: String
  ) {
    saveWasteWaterAnalysis(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(wasteWaterAnalysisGqlFields)}
    }
  }
`;

export const PROCESS_WASTE_WATER_ANALYSIS = gql`
  mutation processWasteWaterAnalysis($processingDto: ProcessingDtoInput!) {
    processWasteWaterAnalysis(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

export const GET_WASTE_WATER_ANALYSIS_PAGEABLE = gql`
  query getWasteWaterAnalysisPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getWasteWaterAnalysisPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(wasteWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_WASTE_WATER_ANALYSIS_ITEMS = gql`
  query getWasteWaterAnalysisItems($reportUid: String) {
    getWasteWaterAnalysisItems(reportUid: $reportUid) {
      ${wasteWaterAnalysisItemGqlFields}
    }
  }
`;

export const GET_WASTE_WATER_ANALYSIS_BY_UID = gql`
  query getWasteWaterAnalysisByUid($uid: String) {
    getWasteWaterAnalysisByUid(uid: $uid) {
      ${responseGqlFields(wasteWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_OFFICER_WASTE_WATER_ANALYSIS_PAGEABLE = gql`
  query getOfficerWasteWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getOfficerWasteWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_WASTE_WATER_ANALYSIS_PAGEABLE = gql`
  query getShiftSupervisorWasteWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorWasteWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_WASTE_WATER_ANALYSIS_PAGEABLE = gql`
  query getSuperintendentWasteWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getSuperintendentWasteWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_WASTE_WATER_ANALYSIS_PAGEABLE = gql`
  query getPlantManagerWasteWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getPlantManagerWasteWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_MY_WASTE_WATER_ANALYSIS_PAGEABLE = gql`
  query getMyWasteWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getMyWasteWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(wasteWaterAnalysisGqlFields)}
    }
  }
`;

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

export const potableWaterAnalysisGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const potableWaterAnalysisItemGqlFields = `
  active
  specification
  testedResult
  item{${plantFormItemGqlFields}}
  potableWaterAnalysis{name uid}
  ${baseGqlFields}
`;

export const SAVE_POTABLE_WATER_ANALYSIS = gql`
  mutation savePotableWaterAnalysisReport(
    $inputs: [PotableWaterAnalysisDataInputDtoInput]!
    $uid: String
    $plantUid: String
  ) {
    savePotableWaterAnalysisReport(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(potableWaterAnalysisGqlFields)}
    }
  }
`;

export const PROCESS_POTABLE_WATER_ANALYSIS = gql`
  mutation processPotableWaterAnalysisReport($processingDto: ProcessingDtoInput!) {
    processPotableWaterAnalysisReport(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

export const GET_POTABLE_WATER_ANALYSIS_ITEMS = gql`
  query getPotableWaterAnalysisItems($formUid: String) {
    getPotableWaterAnalysisItems(formUid: $formUid) {
      ${potableWaterAnalysisItemGqlFields}
    }
  }
`;

export const GET_POTABLE_WATER_ANALYSIS_BY_UID = gql`
  query getPotableWaterAnalysisByUid($uid: String) {
    getPotableWaterAnalysisByUid(uid: $uid) {
      ${responseGqlFields(potableWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_POTABLE_WATER_ANALYSIS_PAGEABLE = gql`
  query getPotableWaterAnalysisPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getPotableWaterAnalysisPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(potableWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_OFFICER_POTABLE_WATER_ANALYSIS_PAGEABLE = gql`
  query getOfficerPotableWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getOfficerPotableWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_POTABLE_WATER_ANALYSIS_PAGEABLE = gql`
  query getShiftSupervisorPotableWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorPotableWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_POTABLE_WATER_ANALYSIS_PAGEABLE = gql`
  query getSuperintendentPotableWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getSuperintendentPotableWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_POTABLE_WATER_ANALYSIS_PAGEABLE = gql`
  query getPlantManagerPotableWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getPlantManagerPotableWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterAnalysisGqlFields)}
    }
  }
`;

export const GET_MY_POTABLE_WATER_ANALYSIS_PAGEABLE = gql`
  query getMyPotableWaterAnalysisPageable($pageableParam: PageableParamInput!) {
    getMyPotableWaterAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(potableWaterAnalysisGqlFields)}
    }
  }
`;

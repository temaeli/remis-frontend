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

export const exportGasAnalysisGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  ${baseGqlFields}
`;

// stages{${stagesGqlFields}}

export const exportGasAnalysisItemGqlFields = `
  active
  measure
  exportGasAnalysis{name uid}
  item{${plantFormItemGqlFields}}
  ${baseGqlFields}
`;

export const SAVE_EXPORT_GAS_ANALYSIS = gql`
  mutation saveExportGasAnalysis(
    $inputs: [ExportGasAnalysisInputDtoInput]!
    $uid: String
    $plantUid: String
  ) {
    saveExportGasAnalysis(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(exportGasAnalysisGqlFields)}
    }
  }
`;

export const PROCESS_EXPORT_GAS_ANALYSIS = gql`
  mutation processExportGasAnalysis($processingDto: ProcessingDtoInput!) {
    processExportGasAnalysis(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

export const GET_EXPORT_GAS_ANALYSIS_ITEMS = gql`
  query getExportGasAnalysisItems($formUid: String) {
    getExportGasAnalysisItems(formUid: $formUid) {
      ${exportGasAnalysisItemGqlFields}
    }
  }
`;

export const GET_EXPORT_GAS_ANALYSIS_PAGEABLE = gql`
  query getExportGasAnalysisPageable(
    $pageableParam: PageableParamInput!
    $active: Boolean = true
  ) {
    getExportGasAnalysisPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(exportGasAnalysisGqlFields)}
    }
  }
`;

export const GET_EXPORT_GAS_ANALYSIS_BY_UID = gql`
  query getExportGasAnalysisByUid($uid: String) {
    getExportGasAnalysisByUid(uid: $uid) {
      ${responseGqlFields(exportGasAnalysisGqlFields)}
    }
  }
`;

export const GET_OFFICER_EXPORT_GAS_ANALYSIS_PAGEABLE = gql`
  query getOfficerExportGasAnalysisPageable($pageableParam: PageableParamInput!) {
    getOfficerExportGasAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(exportGasAnalysisGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_EXPORT_GAS_ANALYSIS_PAGEABLE = gql`
  query getShiftSupervisorExportGasAnalysisPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorExportGasAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(exportGasAnalysisGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_EXPORT_GAS_ANALYSIS_PAGEABLE = gql`
  query getSuperintendentExportGasAnalysisPageable($pageableParam: PageableParamInput!) {
    getSuperintendentExportGasAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(exportGasAnalysisGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_EXPORT_GAS_ANALYSIS_PAGEABLE = gql`
  query getPlantManagerExportGasAnalysisPageable($pageableParam: PageableParamInput!) {
    getPlantManagerExportGasAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(exportGasAnalysisGqlFields)}
    }
  }
`;

export const GET_MY_EXPORT_GAS_ANALYSIS_PAGEABLE = gql`
  query getMyExportGasAnalysisPageable($pageableParam: PageableParamInput!) {
    getMyExportGasAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(exportGasAnalysisGqlFields)}
    }
  }
`;

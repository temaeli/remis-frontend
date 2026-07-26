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

export const monoEthyleneGlycolAnalysisGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const monoEthyleneGlycolAnalysisItemGqlFields = `
  concentration
  ph
  item{${plantFormItemGqlFields}}
  monoEthyleneGlycolAnalysis{name uid}
  ${baseGqlFields}
`;

export const SAVE_MONO_ETHYLENE_GLYCOL_ANALYSIS = gql`
  mutation saveMonoEthyleneGlycolAnalysis(
    $inputs: [MegaInputFormDtoInput]!
    $uid: String
    $plantUid: String
  ) {
    saveMonoEthyleneGlycolAnalysis(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(monoEthyleneGlycolAnalysisGqlFields)}
    }
  }
`;

export const PROCESS_MONO_ETHYLENE_GLYCOL_ANALYSIS = gql`
  mutation processMonoEthyleneGlycolAnalysis($processingDto: ProcessingDtoInput!) {
    processMonoEthyleneGlycolAnalysis(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

export const GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_ITEMS = gql`
  query MonoEthyleneGlycolAnalysisItems($reportUid: String) {
    MonoEthyleneGlycolAnalysisItems(reportUid: $reportUid) {
      ${monoEthyleneGlycolAnalysisItemGqlFields}
    }
  }
`;

export const GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_BY_UID = gql`
  query getMonoEthyleneGlycolAnalysisByUid($uid: String) {
    getMonoEthyleneGlycolAnalysisByUid(uid: $uid) {
      ${responseGqlFields(monoEthyleneGlycolAnalysisGqlFields)}
    }
  }
`;

export const GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE = gql`
  query getMonoEthyleneGlycolAnalysisPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getMonoEthyleneGlycolAnalysisPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(monoEthyleneGlycolAnalysisGqlFields)}
    }
  }
`;

export const GET_OFFICER_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE = gql`
  query getOfficerMonoEthyleneGlycolAnalysisPageable($pageableParam: PageableParamInput!) {
    getOfficerMonoEthyleneGlycolAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(monoEthyleneGlycolAnalysisGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE = gql`
  query getShiftSupervisorMonoEthyleneGlycolAnalysisPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorMonoEthyleneGlycolAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(monoEthyleneGlycolAnalysisGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE = gql`
  query getSuperintendentMonoEthyleneGlycolAnalysisPageable($pageableParam: PageableParamInput!) {
    getSuperintendentMonoEthyleneGlycolAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(monoEthyleneGlycolAnalysisGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE = gql`
  query getPlantManagerMonoEthyleneGlycolAnalysisPageable($pageableParam: PageableParamInput!) {
    getPlantManagerMonoEthyleneGlycolAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(monoEthyleneGlycolAnalysisGqlFields)}
    }
  }
`;

export const GET_MY_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE = gql`
  query getMyMonoEthyleneGlycolAnalysisPageable($pageableParam: PageableParamInput!) {
    getMyMonoEthyleneGlycolAnalysisPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(monoEthyleneGlycolAnalysisGqlFields)}
    }
  }
`;

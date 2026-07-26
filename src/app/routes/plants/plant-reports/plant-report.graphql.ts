import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from 'app/routes/users-managment/users/user.graphql';
import { stagesGqlFields } from '../hse-reports/hse-report.graphql';
import { condensateParameterGqlFields } from '../condensate-parameters/condensate-parameter.graphql';
import { exportGasAnalysisGqlFields } from '../export-gas-analysis/export-gas-analysis.graphql';

/**
 * Extends the common per-stage fields with a reference to every report type an
 * aggregated PlantReport stage can carry (condensate storage tank, HSE, etc).
 * Kept to `uid` only - the backend hasn't shipped detail views for these yet,
 * so there's nothing to render beyond "this stage does/doesn't have one".
 */
export const plantReportStageGqlFields = `
  comment
  stage
  createdAt
  description
  createdBy{ ${userMinimalGqlFields}}
  condensateStorageTank{ name uid }
  exportGasAnalysis{ name uid  }
  exportReading{ uid }
  fieldReport{ uid }
  fuelFlaredGas{ uid }
  hseReport{ uid }
  labReport{ uid }
  maintenanceReport{ uid }
  monoEthyleneGlycolAnalysis{ uid }
  potableWaterAnalysis{ uid }
  potableWaterProduction{ uid }
  powerReport{ uid }
  securityReport{ uid }
  wasteWaterAnalysis{ uid }
  wasteWaterProduced{ uid }
  waterTankLevel{ uid }
`;

export const plantReportGqlFields = `
  approvalStatus
  name
  plant{name uid}
  reportDate
  stage
  stages{${plantReportStageGqlFields}}
  uid
  id
`;

//
//  Mutations
export const INITIALIZE_AGGREGATED_PLANT_REPORT = gql`
  mutation initializeAggregatedPlantReport {
    initializeAggregatedPlantReport {
      ${booleanResponseGqlFields}
    }
  }
`;

export const PROCESS_PLANT_REPORT = gql`
  mutation processPlantReport($processingDto: ProcessingDtoInput!) {
    processPlantReport(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

//  Queries
export const GET_SHIFT_SUPERVISOR_PLANT_REPORTS_PAGEABLE = gql`
  query getShiftSupervisorPlantReportsPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorPlantReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(plantReportGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_PLANT_REPORTS_PAGEABLE = gql`
  query getSuperintendentPlantReportsPageable($pageableParam: PageableParamInput!) {
    getSuperintendentPlantReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(plantReportGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_PLANT_REPORTS_PAGEABLE = gql`
  query getPlantManagerPlantReportsPageable($pageableParam: PageableParamInput!) {
    getPlantManagerPlantReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(plantReportGqlFields)}
    }
  }
`;

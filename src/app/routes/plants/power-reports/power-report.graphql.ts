import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { plantFormItemGqlFields } from '../plant-form-items/plant-form-item.graphql';
import { userMinimalGqlFields } from 'app/routes/users-managment/users/user.graphql';
import { stagesGqlFields } from '../hse-reports/hse-report.graphql';

export const powerReportGqlFields = `
  approvalStatus
  createdAtDate
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const powerFormItemGqlFields = `
  last24Hours
  powerDemand
  previousHours
  previousMwh
  todayHours
  todayMwh
  form{ name uid }
  item{${plantFormItemGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_POWER_GENERATION_REPORT = gql`
  mutation savePowerGenerationReport($inputs: [PowerDataInputFormDtoInput]!, $uid: String, $plantUid: String){
   savePowerGenerationReport(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(powerReportGqlFields)}
    }
  }
 `;

export const PROCESS_POWER_GENERATION_REPORT = gql`
  mutation processPowerGenerationReport($processingDto: ProcessingDtoInput!) {
    processPowerGenerationReport(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

//  Queries
export const GET_POWER_GEN_REPORT_ITEMS = gql`
  query getPowerGenReportItems($formUid: String ){
   getPowerGenReportItems(formUid: $formUid) {
      ${powerFormItemGqlFields}
    }
  }
 `;

export const GET_POWER_REPORTS_PAGEABLE = gql`
  query getPowerReportsPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getPowerReportsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(powerReportGqlFields)}
    }
  }
`;

export const GET_POWER_REPORT_BY_UID = gql`
  query getPowerReportByUid($uid: String) {
    getPowerReportByUid(uid: $uid) {
      ${responseGqlFields(powerReportGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_POWER_GENERATION_REPORTS_PAGEABLE = gql`
  query getSuperintendentPowerGenerationReportsPageable($pageableParam: PageableParamInput!) {
    getSuperintendentPowerGenerationReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(powerReportGqlFields)}
    }
  }
`;

export const GET_OFFICER_POWER_GENERATION_REPORTS_PAGEABLE = gql`
  query getOfficerPowerGenerationReportsPageable($pageableParam: PageableParamInput!) {
    getOfficerPowerGenerationReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(powerReportGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_POWER_GENERATION_REPORTS_PAGEABLE = gql`
  query getPlantManagerPowerGenerationReportsPageable($pageableParam: PageableParamInput!) {
    getPlantManagerPowerGenerationReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(powerReportGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_POWER_GENERATION_REPORTS_PAGEABLE = gql`
  query getShiftSupervisorPowerGenerationReportsPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorPowerGenerationReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(powerReportGqlFields)}
    }
  }
`;

export const GET_MY_POWER_REPORTS_PAGEABLE = gql`
  query getMyPowerReportsPageable($pageableParam: PageableParamInput!) {
    getMyPowerReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(powerReportGqlFields)}
    }
  }
`;

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

export const maintenanceReportGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const maintenanceFormItemGqlFields = `
  plannedMaintenance
  plannedMaintenanceDone
  plannedMaintenanceNotDone
  unPlannedMaintenanceDone
  report{ name uid }
  item{${plantFormItemGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_MAINTENANCE_REPORT = gql`
  mutation saveMaintenanceReport($inputs: [MaintanceInputFormDtoInput]!, $uid: String, $plantUid: String){
   saveMaintenanceReport(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(maintenanceReportGqlFields)}
    }
  }
 `;

export const PROCESS_MAINTENANCE_REPORT = gql`
  mutation processMaintenanceReport($processingDto: ProcessingDtoInput!) {
    processMaintenanceReport(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

//  Queries
export const GET_MAINTENANCE_FORM_ITEMS = gql`
  query getMaintenanceFormItems($reportUid: String){
   getMaintenanceFormItems(reportUid: $reportUid) {
      ${maintenanceFormItemGqlFields}
    }
  }
 `;

export const GET_MAINTENANCE_REPORTS_PAGEABLE = gql`
  query getMaintenanceReportsPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getMaintenanceReportsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(maintenanceReportGqlFields)}
    }
  }
`;

export const GET_MAINTENANCE_REPORT_BY_UID = gql`
  query getMaintenanceReportByUid($uid: String!) {
    getMaintenanceReportByUid(uid: $uid) {
      ${responseGqlFields(maintenanceReportGqlFields)}
    }
  }
`;

export const GET_OFFICER_MAINTENANCE_REPORTS_PAGEABLE = gql`
  query getOfficerMaintenanceReportsPageable($pageableParam: PageableParamInput!) {
    getOfficerMaintenanceReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(maintenanceReportGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_MAINTENANCE_REPORTS_PAGEABLE = gql`
  query getPlantManagerMaintenanceReportsPageable($pageableParam: PageableParamInput!) {
    getPlantManagerMaintenanceReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(maintenanceReportGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_MAINTENANCE_REPORTS_PAGEABLE = gql`
  query getSuperintendentMaintenanceReportsPageable($pageableParam: PageableParamInput!) {
    getSuperintendentMaintenanceReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(maintenanceReportGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_MAINTENANCE_REPORTS_PAGEABLE = gql`
  query getShiftSupervisorMaintenanceReportsPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorMaintenanceReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(maintenanceReportGqlFields)}
    }
  }
`;

export const GET_MY_MAINTENANCE_REPORTS_PAGEABLE = gql`
  query getMyMaintenanceReportsPageable($pageableParam: PageableParamInput!) {
    getMyMaintenanceReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(maintenanceReportGqlFields)}
    }
  }
`;

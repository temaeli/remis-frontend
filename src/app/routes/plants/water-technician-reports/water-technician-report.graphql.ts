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

export const waterFormItemGqlFields = `
  active
  previousDay
  today
  item{${plantFormItemGqlFields}}
  ${baseGqlFields}
`;

export const waterReportGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_WATER_TECHNICIAN_REPORT = gql`
  mutation saveWaterTechnicianReport($inputs: [WaterDataInputFormDtoInput]!, $uid: String, $plantUid: String){
   saveWaterTechnicianReport(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(waterReportGqlFields)}
    }
  }
 `;

export const PROCESS_WATER_TECHNICIAN_REPORT = gql`
  mutation processWaterTechnicianReport($processingDto: ProcessingDtoInput!) {
    processWaterTechnicianReport(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

//  Queries
export const GET_WATER_REPORT_ITEMS = gql`
  query getWaterReportItems($reportUid: String){
   getWaterReportItems(reportUid: $reportUid) {
      ${waterFormItemGqlFields}
    }
  }
 `;

export const GET_WATER_TECHNICIAN_REPORTS_PAGEABLE = gql`
   query getWaterTechnicianReportsPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
     getWaterTechnicianReportsPageable(pageableParam: $pageableParam, active: $active) {
       ${pageGqlFields(waterReportGqlFields)}
     }
   }
 `;

export const GET_WATER_TECHNICIAN_REPORT_BY_UID = gql`
  query getWaterTechnicianReportByUid($uid: String) {
    getWaterTechnicianReportByUid(uid: $uid) {
      ${responseGqlFields(waterReportGqlFields)}
    }
  }
`;

export const GET_OFFICER_WATER_TECHNICIAN_REPORTS_PAGEABLE = gql`
  query getOfficerWaterTechnicianReportsPageable($pageableParam: PageableParamInput!) {
    getOfficerWaterTechnicianReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterReportGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_WATER_TECHNICIAN_REPORTS_PAGEABLE = gql`
  query getShiftSupervisorWaterTechnicianReportsPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorWaterTechnicianReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterReportGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_WATER_TECHNICIAN_REPORTS_PAGEABLE = gql`
  query getSuperintendentWaterTechnicianReportsPageable($pageableParam: PageableParamInput!) {
    getSuperintendentWaterTechnicianReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterReportGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_WATER_TECHNICIAN_REPORTS_PAGEABLE = gql`
  query getPlantManagerWaterTechnicianReportsPageable($pageableParam: PageableParamInput!) {
    getPlantManagerWaterTechnicianReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterReportGqlFields)}
    }
  }
`;

export const GET_MY_WATER_TECHNICIAN_REPORTS_PAGEABLE = gql`
  query getMyWaterTechnicianReportsPageable($pageableParam: PageableParamInput!) {
    getMyWaterTechnicianReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(waterReportGqlFields)}
    }
  }
`;

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

export const securityReportGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const securityFormItemGqlFields = `
  active
  count
  form{ name uid }
  item{${plantFormItemGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_SECURITY_REPORT = gql`
  mutation saveSecurityReport($inputs: [SecurityDataInputFormDtoInput]!, $uid: String, $plantUid: String){
   saveSecurityReport(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(securityReportGqlFields)}
    }
  }
 `;

export const PROCESS_SECURITY_REPORT = gql`
  mutation processSecurityReport($processingDto: ProcessingDtoInput!) {
    processSecurityReport(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

//  Queries
export const GET_SECURITY_REPORT_ITEMS = gql`
  query getSecurityReportItems($reportUid: String){
   getSecurityReportItems(reportUid: $reportUid) {
      ${securityFormItemGqlFields}
    }
  }
 `;

export const GET_SECURITY_REPORTS_PAGEABLE = gql`
   query getSecurityReportsPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
     getSecurityReportsPageable(pageableParam: $pageableParam, active: $active) {
       ${pageGqlFields(securityReportGqlFields)}
     }
   }
 `;

export const GET_SECURITY_REPORT_BY_UID = gql`
  query getSecurityReportByUid($uid: String) {
    getSecurityReportByUid(uid: $uid) {
      ${responseGqlFields(securityReportGqlFields)}
    }
  }
`;

export const GET_OFFICER_SECURITY_REPORTS_PAGEABLE = gql`
  query getOfficerSecurityReportsPageable($pageableParam: PageableParamInput!) {
    getOfficerSecurityReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(securityReportGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_SECURITY_REPORTS_PAGEABLE = gql`
  query getShiftSupervisorSecurityReportsPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorSecurityReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(securityReportGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_SECURITY_REPORTS_PAGEABLE = gql`
  query getSuperintendentSecurityReportsPageable($pageableParam: PageableParamInput!) {
    getSuperintendentSecurityReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(securityReportGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_SECURITY_REPORTS_PAGEABLE = gql`
  query getPlantManagerSecurityReportsPageable($pageableParam: PageableParamInput!) {
    getPlantManagerSecurityReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(securityReportGqlFields)}
    }
  }
`;

export const GET_MY_SECURITY_REPORTS_PAGEABLE = gql`
  query getMySecurityReportsPageable($pageableParam: PageableParamInput!) {
    getMySecurityReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(securityReportGqlFields)}
    }
  }
`;

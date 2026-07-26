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

export const labReportGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const labFormItemGqlFields = `
  active
  measuredValue
  uoM
  form{ name uid }
  item{${plantFormItemGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_LAB_REPORT = gql`
  mutation saveLabReport($inputs: [LabDataInputFormDtoInput]!, $uid: String, $plantUid: String){
   saveLabReport(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(labReportGqlFields)}
    }
  }
 `;

export const PROCESS_LAB_REPORT = gql`
  mutation processLabReport($processingDto: ProcessingDtoInput!) {
    processLabReport(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

//  Queries
export const GET_LAB_FORM_ITEMS = gql`
  query getLabFormItems($formUid: String){
   getLabFormItems(formUid: $formUid) {
      ${labFormItemGqlFields}
    }
  }
 `;

export const GET_LAB_REPORTS_PAGEABLE = gql`
    query getLabReportsPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
      getLabReportsPageable(pageableParam: $pageableParam, active: $active) {
        ${pageGqlFields(labReportGqlFields)}
      }
    }
  `;

export const GET_LAB_REPORT_BY_UID = gql`
  query getLabReportByUid($uid: String) {
    getLabReportByUid(uid: $uid) {
      ${responseGqlFields(labReportGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_LAB_REPORTS_PAGEABLE = gql`
  query getPlantManagerLabReportsPageable($pageableParam: PageableParamInput!) {
    getPlantManagerLabReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(labReportGqlFields)}
    }
  }
`;

export const GET_OFFICER_LAB_REPORTS_PAGEABLE = gql`
  query getOfficerLabReportsPageable($pageableParam: PageableParamInput!) {
    getOfficerLabReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(labReportGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_LAB_REPORTS_PAGEABLE = gql`
  query getSuperintendentLabReportsPageable($pageableParam: PageableParamInput!) {
    getSuperintendentLabReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(labReportGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_LAB_REPORTS_PAGEABLE = gql`
  query getShiftSupervisorLabReportsPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorLabReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(labReportGqlFields)}
    }
  }
`;

export const GET_MY_LAB_REPORTS_PAGEABLE = gql`
  query getMyLabReportsPageable($pageableParam: PageableParamInput!) {
    getMyLabReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(labReportGqlFields)}
    }
  }
`;

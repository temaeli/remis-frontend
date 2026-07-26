import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { plantFormItemGqlFields } from '../plant-form-items/plant-form-item.graphql';
import { userMinimalGqlFields } from 'app/routes/users-managment/users/user.graphql';
import { plantFormGroupGqlFields } from '../plant-form-groups/plant-form-group.graphql';
import { stagesGqlFields } from '../hse-reports/hse-report.graphql';

export const fieldEngineerFormItemGqlFields = `
  form {
    name
    uid
  }
  previousRunHours
  runHours
  item{${plantFormItemGqlFields}}
  ${baseGqlFields}
`;

export const fieldEngineerReportGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  items{${fieldEngineerFormItemGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_FIELD_ENGINEER_REPORT = gql`
  mutation saveFieldEngineerReport($inputs: [FieldDataInputFormDtoInput]!, $uid: String, $plantUid: String){
   saveFieldEngineerReport(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(fieldEngineerReportGqlFields)}
    }
  }
 `;

export const PROCESS_FIELD_ENGINEER_REPORT = gql`
  mutation processFieldEngineerReport($processingDto: ProcessingDtoInput!) {
    processFieldEngineerReport(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

//  Queries
export const GET_FIELD_FORM_ITEMS = gql`
  query getFieldFormItems($formUid: String){
   getFieldFormItems(formUid: $formUid) {
      ${fieldEngineerFormItemGqlFields}
    }
  }
 `;

export const GET_FIELD_REPORTS_PAGEABLE = gql`
   query getFieldReportsPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
     getFieldReportsPageable(pageableParam: $pageableParam, active: $active) {
       ${pageGqlFields(fieldEngineerReportGqlFields)}
     }
   }
 `;

export const GET_FIELD_REPORT_BY_UID = gql`
  query getFieldEngineerReportByUid($uid: String) {
    getFieldEngineerReportByUid(uid: $uid) {
      ${responseGqlFields(fieldEngineerReportGqlFields)}
    }
  }
`;

export const GET_OFFICER_FIELD_ENGINEER_REPORTS_PAGEABLE = gql`
  query getOfficerFieldEngineerReportsPageable($pageableParam: PageableParamInput!) {
    getOfficerFieldEngineerReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fieldEngineerReportGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_FIELD_ENGINEER_REPORTS_PAGEABLE = gql`
  query getShiftSupervisorFieldEngineerReportsPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorFieldEngineerReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fieldEngineerReportGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_FIELD_ENGINEER_REPORTS_PAGEABLE = gql`
  query getPlantManagerFieldEngineerReportsPageable($pageableParam: PageableParamInput!) {
    getPlantManagerFieldEngineerReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fieldEngineerReportGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_FIELD_ENGINEER_REPORTS_PAGEABLE = gql`
  query getSuperintendentFieldEngineerReportsPageable($pageableParam: PageableParamInput!) {
    getSuperintendentFieldEngineerReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fieldEngineerReportGqlFields)}
    }
  }
`;

export const GET_MY_FIELD_ENGINEER_REPORTS_PAGEABLE = gql`
  query getMyFieldEngineerReportsPageable($pageableParam: PageableParamInput!) {
    getMyFieldEngineerReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(fieldEngineerReportGqlFields)}
    }
  }
`;

import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { plantFormItemGqlFields } from '../plant-form-items/plant-form-item.graphql';
import { userMinimalGqlFields } from 'app/routes/users-managment/users/user.graphql';

export const stagesGqlFields = `
  #active
  stage
  createdBy{${userMinimalGqlFields}}
  sentBy{${userMinimalGqlFields}}
  #current
  description
  comment
  previousStage{
    comment
    uid
    description
    createdBy{ ${userMinimalGqlFields}}
  }
  createdAt
`;

export const hseReportGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const hseFormItemGqlFields = `
  active
  count
  prevCount
  form{ name uid }
  item{${plantFormItemGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_HSE_REPORT = gql`
  mutation saveHseReport($inputs: [HseDataInputFormDtoInput]!, $uid: String, $plantUid: String){
   saveHseReport(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(hseReportGqlFields)}
    }
  }
 `;

export const PROCESS_HSE_REPORT = gql`
  mutation processHseReport($processingDto: ProcessingDtoInput!) {
    processHseReport(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

//  Queries
export const GET_HSE_FORM_ITEMS = gql`
  query getHseFormItems($formUid: String = "373f9eae-fd48-4014-9f31-87cb5d968269"){
    getHseFormItems(formUid: $formUid) {
      ${hseFormItemGqlFields}
    }
  }
`;

export const GET_HSE_REPORTS_PAGEABLE = gql`
  query getHseReportsPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getHseReportsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(hseReportGqlFields)}
    }
  }
`;

export const GET_HSE_REPORT_BY_UID = gql`
  query getHseReportByUid($uid: String!) {
    getHseReportByUid(uid: $uid) {
      ${responseGqlFields(hseReportGqlFields)}
    }
  }
`;

export const GET_HEAD_OF_OPERATION_HSE_REPORTS_PAGEABLE = gql`
  query getHeadOfOperationHseReportsPageable($pageableParam: PageableParamInput!) {
    getHeadOfOperationHseReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(hseReportGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_HSE_REPORTS_PAGEABLE = gql`
  query getPlantManagerHseReportsPageable($pageableParam: PageableParamInput!) {
    getPlantManagerHseReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(hseReportGqlFields)}
    }
  }
`;

export const GET_OFFICER_HSE_REPORTS_PAGEABLE = gql`
  query getOfficerHseReportsPageable($pageableParam: PageableParamInput!) {
    getOfficerHseReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(hseReportGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_HSE_REPORTS_PAGEABLE = gql`
  query getShiftSupervisorHseReportsPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorHseReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(hseReportGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_HSE_REPORTS_PAGEABLE = gql`
  query getSuperintendentHseReportsPageable($pageableParam: PageableParamInput!) {
    getSuperintendentHseReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(hseReportGqlFields)}
    }
  }
`;

export const GET_MY_HSE_REPORTS_PAGEABLE = gql`
  query getMyHseReportsPageable($pageableParam: PageableParamInput!) {
    getMyHseReportsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(hseReportGqlFields)}
    }
  }
`;

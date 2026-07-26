import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const hseReportStageFields = `
  assignedTo {
    uid
    sequence
    action
    role {
      uid
      name
      permissionList {
        name
      }
    }
  }
  status
  actedAt
  comments
  actor {
    uid
    firstName
    lastName
  }
  ${baseGqlFields}
`;

export const hseReportFields = `
  content
  outputFormat
  sourceId
  section
  startDate
  endDate
  description
  status
  template {
    uid
    name
    templateType
  }
  currentStage {
    ${hseReportStageFields}
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_HSE_REPORTS = gql`
  query getHSEReportsPageable($filter: ReportFilterDtoInput, $pageableParam: PageableParamInput){
    getHSEReportsPageable(filter: $filter, pageableParam: $pageableParam){
      ${pageGqlFields(hseReportFields)}
    }
  }
`;

export const GET_HSE_REPORT = gql`
  query getHSEReport($uid: String!){
    getHSEReport(uid: $uid){
      ${responseGqlFields(hseReportFields)}
    }
  }
`;

export const GET_HSE_REPORT_STAGES = gql`
  query getHSEReportStages($uid: String!, $pageableParam: PageableParamInput){
    getHSEReportStages(uid: $uid, pageableParam: $pageableParam){
      ${pageGqlFields(hseReportStageFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_HSE_REPORT = gql`
  mutation createOrUpdateHSEReport($input: ReportDtoInput!){
    createOrUpdateHSEReport(input: $input){
      ${responseGqlFields(hseReportFields)}
    }
  }
`;

export const SUBMIT_HSE_REPORT = gql`
  mutation submitHSEReport($input: ReportDtoInput!){
    submitHSEReport(input: $input){
      ${responseGqlFields(hseReportFields)}
    }
  }
`;

export const APPROVE_HSE_REPORT = gql`
  mutation approveHSEReport($uid: String!, $comment: String!){
    approveHSEReport(uid: $uid, comment: $comment){
      ${responseGqlFields(hseReportFields)}
    }
  }
`;

export const REJECT_HSE_REPORT = gql`
  mutation rejectHSEReport($uid: String!, $comment: String!){
    rejectHSEReport(uid: $uid, comment: $comment){
      ${responseGqlFields(hseReportFields)}
    }
  }
`;

export const DELETE_HSE_REPORT = gql`
  mutation deleteHSEReport($uid: String!){
    deleteHSEReport(uid: $uid){
      ${responseGqlFields(hseReportFields)}
    }
  }
`;

export const RE_GENERATE_HSE_REPORT_CONTENT = gql`
  mutation reGenerateHSEReportContent($reportUid: String!){
    reGenerateHSEReportContent(reportUid: $reportUid){
      ${responseGqlFields(hseReportFields)}
    }
  }
`;

export const hseReportOutputFields = `
  fileName
  content
  fileType
`;

export const EXPORT_HSE_REPORT = gql`
  mutation exportHSEReport($reportUid: String!){
    exportHSEReport(reportUid: $reportUid){
      ${responseGqlFields(hseReportOutputFields)}
    }
  }
`;

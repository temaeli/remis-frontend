import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const ewuraReportStageFields = `
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

export const ewuraReportFields = `
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
    ${ewuraReportStageFields}
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_EWURA_REPORTS = gql`
  query getEwuraReportsPageable($filter: ReportFilterDtoInput, $pageableParam: PageableParamInput){
    getEwuraReportsPageable(filter: $filter, pageableParam: $pageableParam){
      ${pageGqlFields(ewuraReportFields)}
    }
  }
`;

export const GET_EWURA_REPORT = gql`
  query getEwuraReport($uid: String!){
    getEwuraReport(uid: $uid){
      ${responseGqlFields(ewuraReportFields)}
    }
  }
`;

export const GET_EWURA_REPORT_STAGES = gql`
  query getEwuraReportStages($uid: String!, $pageableParam: PageableParamInput){
    getEwuraReportStages(uid: $uid, pageableParam: $pageableParam){
      ${pageGqlFields(ewuraReportStageFields)}
    }
  }
`;

export const CREATE_EWURA_REPORT = gql`
  mutation createEwuraReport($reportDto: ReportDtoInput!){
    createEwuraReport(reportDto: $reportDto){
      ${responseGqlFields(ewuraReportFields)}
    }
  }
`;

export const SUBMIT_EWURA_REPORT = gql`
  mutation submitEwuraReport($reportDto: ReportDtoInput!){
    submitEwuraReport(reportDto: $reportDto){
      ${responseGqlFields(ewuraReportFields)}
    }
  }
`;

export const UPDATE_EWURA_REPORT = gql`
  mutation updateEwuraReport($reportDto: ReportDtoInput!){
    updateEwuraReport(reportDto: $reportDto){
      ${responseGqlFields(ewuraReportFields)}
    }
  }
`;

export const APPROVE_EWURA_REPORT = gql`
  mutation approveEwuraReport($reportDto: ReportDtoInput!, $comment: String!){
    approveEwuraReport(reportDto: $reportDto, comment: $comment){
      ${responseGqlFields(ewuraReportFields)}
    }
  }
`;

export const REJECT_EWURA_REPORT = gql`
  mutation rejectEwuraReport($reportDto: ReportDtoInput!, $comment: String!){
    rejectEwuraReport(reportDto: $reportDto, comment: $comment){
      ${responseGqlFields(ewuraReportFields)}
    }
  }
`;

export const DELETE_EWURA_REPORT = gql`
  mutation deleteEwuraReport($uid: String!){
    deleteEwuraReport(uid: $uid){
      ${responseGqlFields(ewuraReportFields)}
    }
  }
`;

export const RE_GENERATE_EWURA_REPORT_CONTENT = gql`
  mutation reGenerateEwuraReportContent($reportUid: String!){
    reGenerateEwuraReportContent(reportUid: $reportUid){
      ${responseGqlFields(ewuraReportFields)}
    }
  }
`;

export const ewuraReportOutputFields = `
  fileName
  content
  fileType
`;

export const EXPORT_EWURA_REPORT = gql`
  mutation exportEwuraReport($reportUid: String!){
    exportEwuraReport(reportUid: $reportUid){
      ${responseGqlFields(ewuraReportOutputFields)}
    }
  }
`;

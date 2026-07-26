import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const reportStageFields = `
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

export const pipelineReportFields = `
  content
  outputFormat
  sourceId
  section
  date
  startDate
  endDate
  summaryType
  description
  operationStatus
  constructionProgress
  majorMaintenanceStatus
  status
  template {
    uid
    name
    templateType
  }
  currentStage {
    ${reportStageFields}
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_PIPELINE_REPORTS = gql`
  query getPipelineReportsPageable($filter: ReportFilterDtoInput, $pageableParam: PageableParamInput){
    getPipelineReportsPageable(filter: $filter, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineReportFields)}
    }
  }
`;

export const GET_PIPELINE_REPORT = gql`
  query getPipelineReport($uid: String!){
    getPipelineReport(uid: $uid){
      ${responseGqlFields(pipelineReportFields)}
    }
  }
`;

export const GET_PIPELINE_REPORT_STAGES = gql`
  query getPipelineReportStages($uid: String!, $pageableParam: PageableParamInput){
    getPipelineReportStages(uid: $uid, pageableParam: $pageableParam){
      ${pageGqlFields(reportStageFields)}
    }
  }
`;

export const CREATE_PIPELINE_REPORT = gql`
  mutation createPipelineReport($reportDto: ReportDtoInput!, $pipelineUid: String!){
    createPipelineReport(reportDto: $reportDto, pipelineUid: $pipelineUid){
      ${responseGqlFields(pipelineReportFields)}
    }
  }
`;

export const SUBMIT_PIPELINE_REPORT = gql`
  mutation submitPipelineReport($reportDto: ReportDtoInput!){
    submitPipelineReport(reportDto: $reportDto){
      ${responseGqlFields(pipelineReportFields)}
    }
  }
`;

export const UPDATE_PIPELINE_REPORT = gql`
  mutation updatePipelineReport($reportDto: ReportDtoInput!){
    updatePipelineReport(reportDto: $reportDto){
      ${responseGqlFields(pipelineReportFields)}
    }
  }
`;

export const APPROVE_PIPELINE_REPORT = gql`
  mutation approvePipelineReport($reportDto: ReportDtoInput!, $comment: String!){
    approvePipelineReport(reportDto: $reportDto, comment: $comment){
      ${responseGqlFields(pipelineReportFields)}
    }
  }
`;

export const REJECT_PIPELINE_REPORT = gql`
  mutation rejectPipelineReport($reportDto: ReportDtoInput!, $comment: String!){
    rejectPipelineReport(reportDto: $reportDto, comment: $comment){
      ${responseGqlFields(pipelineReportFields)}
    }
  }
`;

export const DELETE_PIPELINE_REPORT = gql`
  mutation deletePipelineReport($uid: String!){
    deletePipelineReport(uid: $uid){
      ${responseGqlFields(pipelineReportFields)}
    }
  }
`;

export const RE_GENERATE_PIPELINE_REPORT_CONTENT = gql`
  mutation reGeneratePipelineReportContent($reportUid: String!){
    reGeneratePipelineReportContent(reportUid: $reportUid){
      ${responseGqlFields(pipelineReportFields)}
    }
  }
`;

export const reportOutputFields = `
  fileName
  content
  fileType
`;

export const EXPORT_PIPELINE_REPORT = gql`
  mutation exportPipelineReport($reportUid: String!){
    exportPipelineReport(reportUid: $reportUid){
      ${responseGqlFields(reportOutputFields)}
    }
  }
`;

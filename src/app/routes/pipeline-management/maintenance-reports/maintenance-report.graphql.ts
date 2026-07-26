import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';
import { plantFormItemGqlFields } from '@routes/plants/plant-form-items/plant-form-item.graphql';

export const pipelineMaintenanceFormItemGqlFields = `
  plannedMaintenance
  plannedMaintenanceDone
  plannedMaintenanceNotDone
  unPlannedMaintenanceDone
  item{${plantFormItemGqlFields}}
  ${baseGqlFields}
`;

export const pipelineMaintenanceReportGqlFields = `
  name
  remarks
  comment
  approvalStatus
  stage
  createdAtDate
  pipeline { uid name }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  items{${pipelineMaintenanceFormItemGqlFields}}
  ${baseGqlFields}
`;

export const GET_PIPELINE_MAINTENANCE_REPORTS = gql`
  query getPipelineMaintenanceReports($pipelineUid: String!, $pageableParam: PageableParamInput, $active: Boolean) {
    getPipelineMaintenanceReports(pipelineUid: $pipelineUid, pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(pipelineMaintenanceReportGqlFields)}
    }
  }
`;

// verbatim BE op name — kept unchanged during PipelineMaintenanceReport refactor
export const GET_MAINTENANCE_ACTIVITY_BY_UID = gql`
  query getMaintenanceActivityByUid($uid: String!) {
    getMaintenanceActivityByUid(uid: $uid) {
      ${responseGqlFields(pipelineMaintenanceReportGqlFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_PIPELINE_MAINTENANCE_REPORT = gql`
  mutation createOrUpdatePipelineMaintenanceReport($input: MaintenanceReportDtoInput!) {
    createOrUpdatePipelineMaintenanceReport(input: $input) {
      ${responseGqlFields(pipelineMaintenanceReportGqlFields)}
    }
  }
`;

// verbatim BE op name — kept unchanged during PipelineMaintenanceReport refactor
export const DELETE_MAINTENANCE_ACTIVITY = gql`
  mutation deleteMaintenanceActivity($uid: String!) {
    deleteMaintenanceActivity(uid: $uid) {
      ${responseGqlFields(pipelineMaintenanceReportGqlFields)}
    }
  }
`;

export const SUBMIT_PIPELINE_MAINTENANCE_REPORT = gql`
  mutation submitPipelineMaintenanceReport($uid: String!) {
    submitPipelineMaintenanceReport(uid: $uid) {
      ${responseGqlFields(pipelineMaintenanceReportGqlFields)}
    }
  }
`;

export const APPROVE_PIPELINE_MAINTENANCE_REPORT = gql`
  mutation approvePipelineMaintenanceReport($uid: String!, $comment: String!) {
    approvePipelineMaintenanceReport(uid: $uid, comment: $comment) {
      ${responseGqlFields(pipelineMaintenanceReportGqlFields)}
    }
  }
`;

export const REJECT_PIPELINE_MAINTENANCE_REPORT = gql`
  mutation rejectPipelineMaintenanceReport($uid: String!, $comment: String!) {
    rejectPipelineMaintenanceReport(uid: $uid, comment: $comment) {
      ${responseGqlFields(pipelineMaintenanceReportGqlFields)}
    }
  }
`;

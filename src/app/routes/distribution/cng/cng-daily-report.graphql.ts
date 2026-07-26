import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const cngDailyReportGqlFields = `
  uid
  station {
    uid
    code
    name
  }
  stationName
  reportDate
  producedQuantity
  soldQuantity
  remarks
  status
  active
  approvedAt
  approvedByUser {
    id
    uid
    fullName
  }
  submittedAt
  submittedByUser {
    id
    uid
    fullName
  }
  ${baseGqlFields}
`;

export const ALL_CNG_DAILY_REPORTS_PAGEABLE = gql`
  query cngDailyReportsByStation($stationUid: String!) {
    cngDailyReportsByStation(stationUid: $stationUid) {
      ${cngDailyReportGqlFields}
    }
  }
`;

export const FIND_CNG_DAILY_REPORT = gql`
  query findCngDailyReport($uid: String!) {
    findCngDailyReport(uid: $uid) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
`;

export const SAVE_CNG_DAILY_REPORT = gql`
  mutation saveCngDailyReport($dto: CngDailyReportDtoInput) {
    saveCngDailyReport(dto: $dto) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
`;

export const DELETE_CNG_DAILY_REPORT = gql`
  mutation deleteCngDailyReport($uid: String!) {
    deleteCngDailyReport(uid: $uid) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
`;

export const SUBMIT_CNG_DAILY_REPORT = gql`
  mutation submitCngDailyReport($dto: WorkflowActionDtoInput) {
    submitCngDailyReport(dto: $dto) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
`;

export const APPROVE_CNG_DAILY_REPORT = gql`
  mutation approveCngDailyReport($dto: WorkflowActionDtoInput) {
    approveCngDailyReport(dto: $dto) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
`;

export const REJECT_CNG_DAILY_REPORT = gql`
  mutation rejectCngDailyReport($dto: WorkflowActionDtoInput) {
    rejectCngDailyReport(dto: $dto) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
`;

export const CNG_DAILY_REPORT_PDF = gql`
  query cngDailyReportPdf($uid: String!) {
    cngDailyReportPdf(uid: $uid) {
      status
      message
      data
    }
  }
`;

export const CNG_DAILY_REPORT_XLSX = gql`
  query cngDailyReportXlsx($uid: String!) {
    cngDailyReportXlsx(uid: $uid) {
      status
      message
      data
    }
  }
`;

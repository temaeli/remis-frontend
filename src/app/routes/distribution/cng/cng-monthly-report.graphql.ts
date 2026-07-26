import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const cngMonthlyReportHseStatGqlFields = `
  item
  numberOfCases
  description
  orderIndex
`;

export const cngMonthlyReportMaintenanceSummaryGqlFields = `
  workOrderCategory
  issued
  closed
  inProgress
  orderIndex
`;

export const cngMonthlyReportGqlFields = `
  uid
  station {
    uid
    code
    name
  }
  stationName
  year
  month
  status
  executiveSummary
  hseNarrative
  facilitiesNarrative
  administrationNarrative
  trainingNarrative
  preparedByName
  reviewedByName
  tanescoPowerUnits
  potableWaterM3
  hseStats {
    ${cngMonthlyReportHseStatGqlFields}
  }
  maintenanceSummaries {
    ${cngMonthlyReportMaintenanceSummaryGqlFields}
  }
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

export const ALL_CNG_MONTHLY_REPORTS_PAGEABLE = gql`
  query cngMonthlyReportsByStation($stationUid: String!) {
    cngMonthlyReportsByStation(stationUid: $stationUid) {
      ${cngMonthlyReportGqlFields}
    }
  }
`;

export const FIND_CNG_MONTHLY_REPORT = gql`
  query findCngMonthlyReport($uid: String!) {
    findCngMonthlyReport(uid: $uid) {
      ${responseGqlFields(cngMonthlyReportGqlFields)}
    }
  }
`;

export const SAVE_CNG_MONTHLY_REPORT = gql`
  mutation saveCngMonthlyReport($dto: CngMonthlyReportDtoInput) {
    saveCngMonthlyReport(dto: $dto) {
      ${responseGqlFields(cngMonthlyReportGqlFields)}
    }
  }
`;

export const DELETE_CNG_MONTHLY_REPORT = gql`
  mutation deleteCngMonthlyReport($uid: String!) {
    deleteCngMonthlyReport(uid: $uid) {
      ${responseGqlFields(cngMonthlyReportGqlFields)}
    }
  }
`;

export const SUBMIT_CNG_MONTHLY_REPORT = gql`
  mutation submitCngMonthlyReport($dto: WorkflowActionDtoInput) {
    submitCngMonthlyReport(dto: $dto) {
      ${responseGqlFields(cngMonthlyReportGqlFields)}
    }
  }
`;

export const REVIEW_CNG_MONTHLY_REPORT = gql`
  mutation reviewCngMonthlyReport($dto: WorkflowActionDtoInput) {
    reviewCngMonthlyReport(dto: $dto) {
      ${responseGqlFields(cngMonthlyReportGqlFields)}
    }
  }
`;

export const APPROVE_CNG_MONTHLY_REPORT = gql`
  mutation approveCngMonthlyReport($dto: WorkflowActionDtoInput) {
    approveCngMonthlyReport(dto: $dto) {
      ${responseGqlFields(cngMonthlyReportGqlFields)}
    }
  }
`;

export const REJECT_CNG_MONTHLY_REPORT = gql`
  mutation rejectCngMonthlyReport($dto: WorkflowActionDtoInput) {
    rejectCngMonthlyReport(dto: $dto) {
      ${responseGqlFields(cngMonthlyReportGqlFields)}
    }
  }
`;

export const CNG_PRODUCTION_SUMMARY = gql`
  query cngProductionSummary($stationUid: String!, $year: Int!, $month: Int!) {
    cngProductionSummary(stationUid: $stationUid, year: $year, month: $month) {
      daysReported
      totalGasDispensedKg
      avgGasDispensedKgPerDay
      totalFuelGasScm
      totalGasVentedScm
      customersTubeTrailers
      customersBuses
      customersCars
      customersBajaj
    }
  }
`;

export const CNG_MONTHLY_REPORT_PDF = gql`
  query cngMonthlyReportPdf($uid: String!) {
    cngMonthlyReportPdf(uid: $uid) {
      status
      message
      data
    }
  }
`;

export const CNG_MONTHLY_REPORT_XLSX = gql`
  query cngMonthlyReportXlsx($uid: String!) {
    cngMonthlyReportXlsx(uid: $uid) {
      status
      message
      data
    }
  }
`;

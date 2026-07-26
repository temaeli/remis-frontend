import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';

// ==================== CNG STATION GRAPHQL ====================

export const cngStationGqlFields = `
  uid
  code
  name
  stationType
  region
  location
  contact
  description
  active
  ${baseGqlFields}
`;

export const userCngStationGqlFields = `
  id
  current
  createdAt
  cngStation {
    ${cngStationGqlFields}
  }
  user {
    ${userMinimalGqlFields}
  }
`;

export const SAVE_CNG_STATION = gql`
  mutation saveCngStation($dto: CngStationDtoInput) {
    saveCngStation(dto: $dto) {
      ${responseGqlFields(cngStationGqlFields)}
    }
  }
`;

export const ALL_CNG_STATIONS = gql`
  query allCngStations {
    allCngStations {
      ${cngStationGqlFields}
    }
  }
`;

export const ALL_CNG_STATIONS_PAGEABLE = gql`
  query allCngStations {
    allCngStations {
      ${cngStationGqlFields}
    }
  }
`;

export const FIND_CNG_STATION = gql`
  query findCngStation($uid: String!) {
    findCngStation(uid: $uid) {
      ${responseGqlFields(cngStationGqlFields)}
    }
  }
`;

export const DELETE_CNG_STATION = gql`
  mutation deleteCngStation($uid: String!) {
    deleteCngStation(uid: $uid) {
      ${responseGqlFields(cngStationGqlFields)}
    }
  }
`;

export const ASSIGN_USER_TO_CNG_STATION = gql`
  mutation assignUserToCngStation($userUid: String!, $stationUid: String!) {
    assignUserToCngStation(userUid: $userUid, stationUid: $stationUid) {
      ${responseGqlFields(userCngStationGqlFields)}
    }
  }
`;

export const CNG_STATION_USERS = gql`
  query cngStationUsers($stationUid: String!) {
    cngStationUsers(stationUid: $stationUid) {
      ${userCngStationGqlFields}
    }
  }
`;

export const MY_CNG_STATION = gql`
  query myCngStation {
    myCngStation {
      ${cngStationGqlFields}
    }
  }
`;

export const CNG_STATION_FOR_USER = gql`
  query cngStationForUser($userUid: String!) {
    cngStationForUser(userUid: $userUid) {
      ${cngStationGqlFields}
    }
  }
`;

// ==================== CNG DAILY REPORT GRAPHQL ====================

export const cngDailyReportDispenserGqlFields = `
  nozzleLabel
  dispensedKg
  orderIndex
`;

export const cngDailyReportEquipmentRunGqlFields = `
  equipmentType
  label
  prevHours
  todayHours
  last24Hours
  kwh
  dewPoint
  statusNote
  orderIndex
`;

export const cngDailyReportHseRecordGqlFields = `
  metric
  todayCount
  yearToDateCount
  orderIndex
`;

export const cngDailyReportPersonnelGqlFields = `
  category
  headcount
  orderIndex
`;

export const cngDailyReportGqlFields = `
  uid
  stationUid
  stationName
  reportDate
  status
  unplannedDowntimeHours
  plannedOperatingHours
  availabilityPercent
  customersTubeTrailers
  customersBuses
  customersCars
  customersBajaj
  fmsMeterPrevScm
  fmsMeterTodayScm
  fmsMeterReadingScm
  fuelGasPrevScm
  fuelGasTodayScm
  fuelGasUsedScm
  totalGasDispensedScm
  totalGasDispensedKg
  cascadeStoredKg
  compressedGasStoredScm
  gasVentedScm
  operationMaintenanceActivities
  preparedByName
  reviewedByName
  dispensers {
    ${cngDailyReportDispenserGqlFields}
  }
  equipmentRuns {
    ${cngDailyReportEquipmentRunGqlFields}
  }
  hseRecords {
    ${cngDailyReportHseRecordGqlFields}
  }
  personnel {
    ${cngDailyReportPersonnelGqlFields}
  }
  openingPressureBarg
  closingPressureBarg
  gasInletSm3
  gasOutletSm3
  compressedVolumeSm3
  salesQuantitySm3
  salesAmountTzs
  downtimeHours
  hseIncidents
  narrative
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

export const SAVE_CNG_DAILY_REPORT = gql`
  mutation saveCngDailyReport($dto: CngDailyReportDtoInput) {
    saveCngDailyReport(dto: $dto) {
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

export const ALL_CNG_DAILY_REPORTS = gql`
  query allCngDailyReports {
    allCngDailyReports {
      ${cngDailyReportGqlFields}
    }
  }
`;

export const ALL_CNG_DAILY_REPORTS_PAGEABLE = gql`
  query allCngDailyReports {
    allCngDailyReports {
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

export const CNG_DAILY_REPORTS_BY_STATION = gql`
  query cngDailyReportsByStation($stationUid: String!) {
    cngDailyReportsByStation(stationUid: $stationUid) {
      ${cngDailyReportGqlFields}
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

// ==================== CNG MONTHLY REPORT GRAPHQL ====================

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
  stationUid
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

export const SAVE_CNG_MONTHLY_REPORT = gql`
  mutation saveCngMonthlyReport($dto: CngMonthlyReportDtoInput) {
    saveCngMonthlyReport(dto: $dto) {
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

export const CNG_MONTHLY_REPORTS_BY_STATION = gql`
  query cngMonthlyReportsByStation($stationUid: String!) {
    cngMonthlyReportsByStation(stationUid: $stationUid) {
      ${cngMonthlyReportGqlFields}
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

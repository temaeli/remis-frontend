import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const cngDailyReportGqlFields = `
approvedAt
approvedByUser{ id uid fullName }
submittedAt
submittedByUser{ id uid fullName }
stationName
reportDate
status
migrated

unplannedDowntimeHours
plannedOperatingHours
availabilityPercent

customersTubeTrailers
customersBuses
customersCars
customersBajaj

fmsMeterPrevScm
fmsMeterTodayScm
fuelGasPrevScm
fuelGasTodayScm
cascadeStoredKg

fmsMeterReadingScm
fuelGasUsedScm
totalGasDispensedScm
totalGasDispensedKg
compressedGasStoredScm
gasVentedScm

gasInletSm3
gasOutletSm3
compressedVolumeSm3
salesQuantitySm3
salesAmountTzs
downtimeHours
hseIncidents

operationMaintenanceActivities
narrative
preparedByName
reviewedByName
  ${baseGqlFields}
`;

export const SAVE_CNG_DAILY_REPORT = gql`
  mutation saveCngDailyReport($dto: CngDailyReportDtoInput){
   saveCngDailyReport(dto: $dto) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
 `;

export const SUBMIT_CNG_DAILY_REPORT = gql`
  mutation submitCngDailyReport($dto: WorkflowActionDtoInput){
   submitCngDailyReport(dto: $dto) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
 `;

export const APPROVE_CNG_DAILY_REPORT = gql`
  mutation approveCngDailyReport($dto: WorkflowActionDtoInput){
   approveCngDailyReport(dto: $dto) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
 `;

export const DELETE_CNG_DAILY_REPORT = gql`
  mutation deleteCngDailyReport($uid: String){
   deleteCngDailyReport(uid: $uid) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
 `;

export const ALL_CNG_DAILY_REPORTS = gql`
  query allCngDailyReports{
   allCngDailyReports {
      ${cngDailyReportGqlFields}
    }
  }
 `;

export const ALL_CNG_DAILY_REPORTS_PAGEABLE = gql`
  query allCngDailyReportsPageable($pageableParam: PageableParamInput, $active: Boolean = true){
   allCngDailyReportsPageable(pageableParam: $pageableParam, active: $active) {
     ${pageGqlFields(cngDailyReportGqlFields)}
    }
  }
 `;

export const CNG_DAILY_REPORTS_BY_STATION = gql`
  query cngDailyReportsByStation($stationName: String!){
   cngDailyReportsByStation(stationName: $stationName) {
      ${cngDailyReportGqlFields}
    }
  }
 `;

export const FIND_CNG_DAILY_REPORT = gql`
  query findCngDailyReport($uid: String){
   findCngDailyReport(uid: $uid) {
      ${responseGqlFields(cngDailyReportGqlFields)}
    }
  }
 `;

import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const distributionWeeklyOperationReportGqlFields = `
approvedAt
approvedByUser{
 id
 uid
 fullName
}
approverComments
correctiveMaintenanceCompleted
firstAidCases
hseNarrative
lostTimeInjuries
maintenanceNarrative
manHoursWorked
migrated
nearMissCount
operationsNarrative
preventiveMaintenanceCompleted
region
reviewedAt
reviewedByUser{
 id
 uid
 fullName
}
reviewerComments
status
submittedAt
submittedByUser{
 id
 uid
 fullName
}
totalConsumptionMmscf
weekEndDate
weekStartDate
${baseGqlFields}
`;

// Distribution Weekly Report Mutations
export const SAVE_DISTRIBUTION_WEEKLY_REPORT = gql`
  mutation saveDistributionWeeklyReport($dto: DistributionWeeklyOperationReportDtoInput){
   saveDistributionWeeklyReport(dto: $dto) {
      ${responseGqlFields(distributionWeeklyOperationReportGqlFields)}
    }
  }
 `;

export const SUBMIT_DISTRIBUTION_WEEKLY_REPORT = gql`
  mutation submitDistributionWeeklyReport($dto: WorkflowActionDtoInput){
   submitDistributionWeeklyReport(dto: $dto) {
      ${responseGqlFields(distributionWeeklyOperationReportGqlFields)}
    }
  }
 `;

export const REVIEW_DISTRIBUTION_WEEKLY_REPORT = gql`
  mutation reviewDistributionWeeklyReport($dto: WorkflowActionDtoInput){
   reviewDistributionWeeklyReport(dto: $dto) {
      ${responseGqlFields(distributionWeeklyOperationReportGqlFields)}
    }
  }
 `;

export const APPROVE_DISTRIBUTION_WEEKLY_REPORT = gql`
  mutation approveDistributionWeeklyReport($dto: WorkflowActionDtoInput){
   approveDistributionWeeklyReport(dto: $dto) {
      ${responseGqlFields(distributionWeeklyOperationReportGqlFields)}
    }
  }
 `;

export const REJECT_DISTRIBUTION_WEEKLY_REPORT = gql`
  mutation rejectDistributionWeeklyReport($dto: WorkflowActionDtoInput){
   rejectDistributionWeeklyReport(dto: $dto) {
      ${responseGqlFields(distributionWeeklyOperationReportGqlFields)}
    }
  }
 `;

export const DELETE_DISTRIBUTION_WEEKLY_REPORT = gql`
  mutation deleteDistributionWeeklyReport($uid: String){
   deleteDistributionWeeklyReport(uid: $uid) {
      ${responseGqlFields(distributionWeeklyOperationReportGqlFields)}
    }
  }
 `;

// Distribution Weekly Report Queries
export const ALL_DISTRIBUTION_WEEKLY_REPORTS = gql`
  query allDistributionWeeklyReports{
   allDistributionWeeklyReports {
      ${distributionWeeklyOperationReportGqlFields}
}
  }
 `;

export const ALL_DISTRIBUTION_WEEKLY_REPORTS_PAGEABLE = gql`
  query allDistributionWeeklyReportsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allDistributionWeeklyReportsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(distributionWeeklyOperationReportGqlFields)}
    }
  }
 `;

export const DISTRIBUTION_WEEKLY_REPORTS_BY_REGION = gql`
  query distributionWeeklyReportsByRegion($region: DistributionRegion){
   distributionWeeklyReportsByRegion(region: $region) {
      ${distributionWeeklyOperationReportGqlFields}
    }
  }
 `;

export const FIND_DISTRIBUTION_WEEKLY_REPORT = gql`
  query findDistributionWeeklyReport($uid: String!){
   findDistributionWeeklyReport(uid: $uid) {
            ${responseGqlFields(distributionWeeklyOperationReportGqlFields)}
    }
  }
 `;

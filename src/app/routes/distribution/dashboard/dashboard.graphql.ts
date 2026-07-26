import { gql } from '@apollo/client/core';

export const DISTRIBUTION_CUSTOMERS_BY_CATEGORY = gql`
  query DistributionCustomersByCategory {
    distributionCustomersByCategory {
      categoryUid
      category
      code
      count
    }
  }
`;

export const DISTRIBUTION_REPORTS_BY_REGION = gql`
  query DistributionReportsByRegion($from: LocalDate, $to: LocalDate) {
    distributionReportsByRegion(from: $from, to: $to) {
      region
      reports
      approvedReports
      totalConsumptionMmscf
      lostTimeInjuries
      nearMissCount
      firstAidCases
      preventiveMaintenanceCompleted
      correctiveMaintenanceCompleted
    }
  }
`;

export const CONSTRUCTION_SOP_DASHBOARD = gql`
  query ConstructionSopDashboard($from: LocalDate, $to: LocalDate) {
    constructionSopDashboard(from: $from, to: $to) {
      totalRecords
      openRecords
      approvedRecords
      rejectedRecords
      openNonConformities
      dueSoonNonConformities
      overdueNonConformities
      averageDaysToApprove
      statusBreakdown {
        status
        count
        openNonConformities
      }
      usageBySop {
        sopCatalogUid
        sopCode
        totalRecords
        openRecords
        approvedRecords
      }
      recentRecords {
        uid
        referenceNumber
        sopCode
        location
        executionDate
        status
        fieldEngineerFullName
        supervisorFullName
        openNonConformities
      }
    }
  }
`;

// POST /graphql - distributionCustomersByCategory
// POST /graphql - distributionReportsByRegion
// POST /graphql - constructionSopDashboard

import { gql } from '@apollo/client/core';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { entityLinkPanels, EntityLinkConfig } from '@shared/lookup';

/**
 * What a unit links to, from both ends — the same shape `project-asset.ts` uses
 * for projects and assets.
 *
 * Every one is its own two-column join table with its own link/unlink pair, and
 * each side reads the same join rows filtered by the other. So a unit's page
 * lists what it is linked to, and each of those records' pages lists the units it
 * applies to, both able to link and unlink.
 *
 * Declared here rather than in either registry. `UNIT` lives in the project
 * settings catalogue and the records live in this module, so having the two
 * registries import each other would be a cycle; everything needed — the reads,
 * and the lists the link form picks from — is declared here instead.
 *
 * Unlinking takes the join row's own uid rather than the pair, because that is
 * what the controllers ask for.
 */

const ALL_AGREEMENT = gql`
  query allAgreements {
    allAgreements {
      id
      name
    }
  }
`;

const ALL_ASSET = gql`
  query allAssets {
    allAssets {
      id
      name
    }
  }
`;

const ALL_BANK_ACCOUNT = gql`
  query allBankAccounts {
    allBankAccounts {
      id
      name
    }
  }
`;

const ALL_BILL_PAY_OPTION = gql`
  query allBillPayOptions {
    allBillPayOptions {
      id
      name
    }
  }
`;

const ALL_BIO_DATA = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

const ALL_BOOKING = gql`
  query allBookings {
    allBookings {
      id
      name
    }
  }
`;

const ALL_BUSINESS_NAME = gql`
  query allBusinessNames {
    allBusinessNames {
      id
      name
    }
  }
`;

const ALL_COLLECTION_CENTER = gql`
  query allCollectionCenters {
    allCollectionCenters {
      id
      name
    }
  }
`;

const ALL_COMMISSION = gql`
  query allCommissions {
    allCommissions {
      id
      name
    }
  }
`;

const ALL_COST = gql`
  query allCosts {
    allCosts {
      id
      name
    }
  }
`;

const ALL_DISCOUNT = gql`
  query allDiscounts {
    allDiscounts {
      id
      name
    }
  }
`;

const ALL_ENTRY = gql`
  query allEntries {
    allEntries {
      id
      name
    }
  }
`;

const ALL_EVICTION = gql`
  query allEvictions {
    allEvictions {
      id
      name
    }
  }
`;

const ALL_EXIT = gql`
  query allExits {
    allExits {
      id
      name
    }
  }
`;

const ALL_FEE = gql`
  query allFees {
    allFees {
      id
      name
    }
  }
`;

const ALL_GFS_CODE = gql`
  query allGfsCodes {
    allGfsCodes {
      id
      name
    }
  }
`;

const ALL_GRADE = gql`
  query allGrades {
    allGrades {
      id
      name
    }
  }
`;

const ALL_HANDOVER = gql`
  query allHandovers {
    allHandovers {
      id
      name
    }
  }
`;

const ALL_INSPECTION = gql`
  query allInspections {
    allInspections {
      id
      name
    }
  }
`;

const ALL_LAND_USE = gql`
  query allLandUses {
    allLandUses {
      id
      name
    }
  }
`;

const ALL_LEASE = gql`
  query allLeases {
    allLeases {
      id
      name
    }
  }
`;

const ALL_LIABILITY = gql`
  query allLiabilities {
    allLiabilities {
      id
      name
    }
  }
`;

const ALL_LOAN = gql`
  query allLoans {
    allLoans {
      id
      name
    }
  }
`;

const ALL_MAINTENANCE = gql`
  query allMaintenances {
    allMaintenances {
      id
      name
    }
  }
`;

const ALL_METER = gql`
  query allMeters {
    allMeters {
      id
      name
    }
  }
`;

const ALL_NOTICE = gql`
  query allNotices {
    allNotices {
      id
      name
    }
  }
`;

const ALL_NOTICE_DAY = gql`
  query allNoticeDays {
    allNoticeDays {
      id
      name
    }
  }
`;

const ALL_PENALTY = gql`
  query allPenalties {
    allPenalties {
      id
      name
    }
  }
`;

const ALL_PROBLEM = gql`
  query allProblems {
    allProblems {
      id
      name
    }
  }
`;

const ALL_PURCHASE = gql`
  query allPurchases {
    allPurchases {
      id
      name
    }
  }
`;

const ALL_QUALITATIVE_PARAMETER = gql`
  query allQualitativeParameters {
    allQualitativeParameters {
      id
      name
    }
  }
`;

const ALL_BOOLEAN_PARAMETER = gql`
  query allBooleanParameters {
    allBooleanParameters {
      id
      name
    }
  }
`;

const ALL_QUANTITATIVE_PARAMETER = gql`
  query allQuantitativeParameters {
    allQuantitativeParameters {
      id
      name
    }
  }
`;

const ALL_REGISTRY_MASTER_PLAN = gql`
  query allRegistryMasterPlans {
    allRegistryMasterPlans {
      id
      name
    }
  }
`;

const ALL_REGISTRY_PROJECT = gql`
  query allRegistryProjects {
    allRegistryProjects {
      id
      name
    }
  }
`;

const ALL_RENT = gql`
  query allRents {
    allRents {
      id
      name
    }
  }
`;

const ALL_RENT_BILLING_CYCLE = gql`
  query allRentBillingCycles {
    allRentBillingCycles {
      id
      name
    }
  }
`;

const ALL_RESERVATION = gql`
  query allReservations {
    allReservations {
      id
      name
    }
  }
`;

const ALL_RETURN = gql`
  query allReturns {
    allReturns {
      id
      name
    }
  }
`;

const ALL_SECURITY_DEPOSIT = gql`
  query allSecurityDeposits {
    allSecurityDeposits {
      id
      name
    }
  }
`;

const ALL_SELL = gql`
  query allSells {
    allSells {
      id
      name
    }
  }
`;

const ALL_SERVICE_CONNECTION = gql`
  query allServiceConnections {
    allServiceConnections {
      id
      name
    }
  }
`;

const ALL_SERVICE_DISCONNECTION = gql`
  query allServiceDisconnections {
    allServiceDisconnections {
      id
      name
    }
  }
`;

const ALL_SERVICE_OFFERING = gql`
  query allServiceOfferings {
    allServiceOfferings {
      id
      name
    }
  }
`;

const ALL_SOLUTION = gql`
  query allSolutions {
    allSolutions {
      id
      name
    }
  }
`;

const ALL_STREET = gql`
  query allStreets {
    allStreets {
      id
      name
    }
  }
`;

const ALL_TERMINATION = gql`
  query allTerminations {
    allTerminations {
      id
      name
    }
  }
`;

const ALL_TITLE_DEED = gql`
  query allTitleDeeds {
    allTitleDeeds {
      id
      name
    }
  }
`;

const ALL_UNIT = gql`
  query allUnits {
    allUnits {
      id
      name
    }
  }
`;

const ALL_VALUATION = gql`
  query allValuations {
    allValuations {
      id
      name
    }
  }
`;

const ALL_VISIT = gql`
  query allVisits {
    allVisits {
      id
      name
    }
  }
`;

/** Panels for a unit's own page: everything it is linked to. */
const UNIT_LINKS: EntityLinkConfig[] = [
  {
    entity: 'SecurityDepositUnit',
    byOwnerQuery: 'securityDepositUnitsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'securityDepositUid',
    field: 'securityDeposit',
    label: 'Security Deposit',
    pluralLabel: 'Security Deposits',
    icon: 'account_balance',
    permission: 'SECURITY_DEPOSIT_UNIT',
    optionsQuery: ALL_SECURITY_DEPOSIT,
  },
  {
    entity: 'UnitAgreement',
    byOwnerQuery: 'unitAgreementsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'agreementUid',
    field: 'agreement',
    label: 'Agreement',
    pluralLabel: 'Agreements',
    icon: 'assignment_ind',
    permission: 'UNIT_AGREEMENT',
    optionsQuery: ALL_AGREEMENT,
  },
  {
    entity: 'UnitAsset',
    byOwnerQuery: 'unitAssetsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'assetUid',
    field: 'asset',
    label: 'Asset',
    pluralLabel: 'Assets',
    icon: 'shop',
    permission: 'UNIT_ASSET',
    optionsQuery: ALL_ASSET,
  },
  {
    entity: 'UnitBankAccount',
    byOwnerQuery: 'unitBankAccountsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'bankAccountUid',
    field: 'bankAccount',
    label: 'Bank Account',
    pluralLabel: 'Bank Accounts',
    icon: 'account_balance',
    permission: 'UNIT_BANK_ACCOUNT',
    optionsQuery: ALL_BANK_ACCOUNT,
  },
  {
    entity: 'UnitBillPayOption',
    byOwnerQuery: 'unitBillPayOptionsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'billPayOptionUid',
    field: 'billPayOption',
    label: 'Bill Pay Option',
    pluralLabel: 'Bill Pay Options',
    icon: 'payment',
    permission: 'UNIT_BILL_PAY_OPTION',
    optionsQuery: ALL_BILL_PAY_OPTION,
  },
  {
    entity: 'UnitBioData',
    byOwnerQuery: 'unitBioDatasByUnit',
    ownerArg: 'unitUid',
    targetArg: 'bioDataUid',
    field: 'bioData',
    label: 'Person',
    pluralLabel: 'People',
    icon: 'person',
    permission: 'UNIT_BIO_DATA',
    optionsQuery: ALL_BIO_DATA,
    targetGqlFields: `
    id
    uid: id
    name
  `,
    columns: ['index', 'bioData.name as Person', 'actions'],
  },
  {
    entity: 'UnitBooking',
    byOwnerQuery: 'unitBookingsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'bookingUid',
    field: 'booking',
    label: 'Booking',
    pluralLabel: 'Bookings',
    icon: 'event_available',
    permission: 'UNIT_BOOKING',
    optionsQuery: ALL_BOOKING,
  },
  {
    entity: 'UnitBusinessName',
    byOwnerQuery: 'unitBusinessNamesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'businessNameUid',
    field: 'businessName',
    label: 'Business',
    pluralLabel: 'Businesses',
    icon: 'business',
    permission: 'UNIT_BUSINESS_NAME',
    optionsQuery: ALL_BUSINESS_NAME,
  },
  {
    entity: 'UnitCollectionCenter',
    byOwnerQuery: 'unitCollectionCentersByUnit',
    ownerArg: 'unitUid',
    targetArg: 'collectionCenterUid',
    field: 'collectionCenter',
    label: 'Collection Centre',
    pluralLabel: 'Collection Centres',
    icon: 'store',
    permission: 'UNIT_COLLECTION_CENTER',
    optionsQuery: ALL_COLLECTION_CENTER,
  },
  {
    entity: 'UnitCommission',
    byOwnerQuery: 'unitCommissionsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'commissionUid',
    field: 'commission',
    label: 'Commission',
    pluralLabel: 'Commissions',
    icon: 'money',
    permission: 'UNIT_COMMISSION',
    optionsQuery: ALL_COMMISSION,
  },
  {
    entity: 'UnitConnection',
    byOwnerQuery: 'unitConnectionsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'connectionUid',
    field: 'connection',
    label: 'Connection',
    pluralLabel: 'Connections',
    icon: 'power',
    permission: 'UNIT_CONNECTION',
    optionsQuery: ALL_SERVICE_CONNECTION,
  },
  {
    entity: 'UnitCost',
    byOwnerQuery: 'unitCostsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'costUid',
    field: 'cost',
    label: 'Cost',
    pluralLabel: 'Costs',
    icon: 'attach_money',
    permission: 'UNIT_COST',
    optionsQuery: ALL_COST,
  },
  {
    entity: 'UnitDisconnection',
    byOwnerQuery: 'unitDisconnectionsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'disconnectionUid',
    field: 'disconnection',
    label: 'Disconnection',
    pluralLabel: 'Disconnections',
    icon: 'power_off',
    permission: 'UNIT_DISCONNECTION',
    optionsQuery: ALL_SERVICE_DISCONNECTION,
  },
  {
    entity: 'UnitDiscount',
    byOwnerQuery: 'unitDiscountsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'discountUid',
    field: 'discount',
    label: 'Discount',
    pluralLabel: 'Discounts',
    icon: 'local_offer',
    permission: 'UNIT_DISCOUNT',
    optionsQuery: ALL_DISCOUNT,
  },
  {
    entity: 'UnitEntry',
    byOwnerQuery: 'unitEntriesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'entryUid',
    field: 'entry',
    label: 'Entry',
    pluralLabel: 'Entries',
    icon: 'login',
    permission: 'UNIT_ENTRY',
    optionsQuery: ALL_ENTRY,
  },
  {
    entity: 'UnitEviction',
    byOwnerQuery: 'unitEvictionsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'evictionUid',
    field: 'eviction',
    label: 'Eviction',
    pluralLabel: 'Evictions',
    icon: 'gavel',
    permission: 'UNIT_EVICTION',
    optionsQuery: ALL_EVICTION,
  },
  {
    entity: 'UnitExit',
    byOwnerQuery: 'unitExitsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'exitUid',
    field: 'exit',
    label: 'Exit',
    pluralLabel: 'Exits',
    icon: 'logout',
    permission: 'UNIT_EXIT',
    optionsQuery: ALL_EXIT,
  },
  {
    entity: 'UnitFee',
    byOwnerQuery: 'unitFeesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'feeUid',
    field: 'fee',
    label: 'Fee',
    pluralLabel: 'Fees',
    icon: 'receipt',
    permission: 'UNIT_FEE',
    optionsQuery: ALL_FEE,
  },
  {
    entity: 'UnitGfsCode',
    byOwnerQuery: 'unitGfsCodesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'gfsCodeUid',
    field: 'gfsCode',
    label: 'GFS Code',
    pluralLabel: 'GFS Codes',
    icon: 'label',
    permission: 'UNIT_GFS_CODE',
    optionsQuery: ALL_GFS_CODE,
  },
  {
    entity: 'UnitGrade',
    byOwnerQuery: 'unitGradesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'gradeUid',
    field: 'grade',
    label: 'Grade',
    pluralLabel: 'Grades',
    icon: 'grade',
    permission: 'UNIT_GRADE',
    optionsQuery: ALL_GRADE,
  },
  {
    entity: 'UnitHandover',
    byOwnerQuery: 'unitHandoversByUnit',
    ownerArg: 'unitUid',
    targetArg: 'handoverUid',
    field: 'handover',
    label: 'Handover',
    pluralLabel: 'Handovers',
    icon: 'swap_horiz',
    permission: 'UNIT_HANDOVER',
    optionsQuery: ALL_HANDOVER,
  },
  {
    entity: 'UnitInspection',
    byOwnerQuery: 'unitInspectionsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'inspectionUid',
    field: 'inspection',
    label: 'Inspection',
    pluralLabel: 'Inspections',
    icon: 'assignment_turned_in',
    permission: 'UNIT_INSPECTION',
    optionsQuery: ALL_INSPECTION,
  },
  {
    entity: 'UnitLandUse',
    byOwnerQuery: 'unitLandUsesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'landUseUid',
    field: 'landUse',
    label: 'Land Use',
    pluralLabel: 'Land Uses',
    icon: 'terrain',
    permission: 'UNIT_LAND_USE',
    optionsQuery: ALL_LAND_USE,
  },
  {
    entity: 'UnitLease',
    byOwnerQuery: 'unitLeasesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'leaseUid',
    field: 'lease',
    label: 'Lease',
    pluralLabel: 'Leases',
    icon: 'description',
    permission: 'UNIT_LEASE',
    optionsQuery: ALL_LEASE,
  },
  {
    entity: 'UnitLiability',
    byOwnerQuery: 'unitLiabilitiesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'liabilityUid',
    field: 'liability',
    label: 'Liability',
    pluralLabel: 'Liabilities',
    icon: 'account_balance',
    permission: 'UNIT_LIABILITY',
    optionsQuery: ALL_LIABILITY,
  },
  {
    entity: 'UnitLoan',
    byOwnerQuery: 'unitLoansByUnit',
    ownerArg: 'unitUid',
    targetArg: 'loanUid',
    field: 'loan',
    label: 'Loan',
    pluralLabel: 'Loans',
    icon: 'account_balance_wallet',
    permission: 'UNIT_LOAN',
    optionsQuery: ALL_LOAN,
  },
  {
    entity: 'UnitMaintenance',
    byOwnerQuery: 'unitMaintenancesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'maintenanceUid',
    field: 'maintenance',
    label: 'Maintenance',
    pluralLabel: 'Maintenance',
    icon: 'build',
    permission: 'UNIT_MAINTENANCE',
    optionsQuery: ALL_MAINTENANCE,
  },
  {
    entity: 'UnitMasterPlan',
    byOwnerQuery: 'unitMasterPlansByUnit',
    ownerArg: 'unitUid',
    targetArg: 'masterPlanUid',
    field: 'masterPlan',
    label: 'Master Plan',
    pluralLabel: 'Master Plans',
    icon: 'map',
    permission: 'UNIT_MASTER_PLAN',
    optionsQuery: ALL_REGISTRY_MASTER_PLAN,
  },
  {
    entity: 'UnitMeter',
    byOwnerQuery: 'unitMetersByUnit',
    ownerArg: 'unitUid',
    targetArg: 'meterUid',
    field: 'meter',
    label: 'Meter',
    pluralLabel: 'Meters',
    icon: 'shutter_speed',
    permission: 'UNIT_METER',
    optionsQuery: ALL_METER,
  },
  {
    entity: 'UnitNotice',
    byOwnerQuery: 'unitNoticesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'noticeUid',
    field: 'notice',
    label: 'Notice',
    pluralLabel: 'Notices',
    icon: 'announcement',
    permission: 'UNIT_NOTICE',
    optionsQuery: ALL_NOTICE,
  },
  {
    entity: 'UnitNoticeDay',
    byOwnerQuery: 'unitNoticeDaysByUnit',
    ownerArg: 'unitUid',
    targetArg: 'noticeDayUid',
    field: 'noticeDay',
    label: 'Notice Period',
    pluralLabel: 'Notice Periods',
    icon: 'event',
    permission: 'UNIT_NOTICE_DAY',
    optionsQuery: ALL_NOTICE_DAY,
  },
  {
    entity: 'UnitPenalty',
    byOwnerQuery: 'unitPenaltiesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'penaltyUid',
    field: 'penalty',
    label: 'Penalty',
    pluralLabel: 'Penalties',
    icon: 'warning',
    permission: 'UNIT_PENALTY',
    optionsQuery: ALL_PENALTY,
  },
  {
    entity: 'UnitProblem',
    byOwnerQuery: 'unitProblemsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'problemUid',
    field: 'problem',
    label: 'Problem',
    pluralLabel: 'Problems',
    icon: 'report_problem',
    permission: 'UNIT_PROBLEM',
    optionsQuery: ALL_PROBLEM,
  },
  {
    entity: 'UnitProject',
    byOwnerQuery: 'unitProjectsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'projectUid',
    field: 'project',
    label: 'Project',
    pluralLabel: 'Projects',
    icon: 'suitcase',
    permission: 'UNIT_PROJECT',
    optionsQuery: ALL_REGISTRY_PROJECT,
  },
  {
    entity: 'UnitPurchase',
    byOwnerQuery: 'unitPurchasesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'purchaseUid',
    field: 'purchase',
    label: 'Purchase',
    pluralLabel: 'Purchases',
    icon: 'shopping_cart',
    permission: 'UNIT_PURCHASE',
    optionsQuery: ALL_PURCHASE,
  },
  {
    entity: 'UnitQualitativeParameter',
    byOwnerQuery: 'unitQualitativeParametersByUnit',
    ownerArg: 'unitUid',
    targetArg: 'qualitativeParameterUid',
    field: 'qualitativeParameter',
    label: 'Qualitative Parameter',
    pluralLabel: 'Qualitative Parameters',
    icon: 'assessment',
    permission: 'UNIT_QUALITATIVE_PARAMETER',
    optionsQuery: ALL_QUALITATIVE_PARAMETER,
  },
  {
    entity: 'UnitQuantitativeParameter',
    byOwnerQuery: 'unitQuantitativeParametersByUnit',
    ownerArg: 'unitUid',
    targetArg: 'quantitativeParameterUid',
    field: 'quantitativeParameter',
    label: 'Quantitative Parameter',
    pluralLabel: 'Quantitative Parameters',
    icon: 'functions',
    permission: 'UNIT_QUANTITATIVE_PARAMETER',
    optionsQuery: ALL_QUANTITATIVE_PARAMETER,
  },
  {
    entity: 'UnitRent',
    byOwnerQuery: 'unitRentsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'rentUid',
    field: 'rent',
    label: 'Rent',
    pluralLabel: 'Rents',
    icon: 'home',
    permission: 'UNIT_RENT',
    optionsQuery: ALL_RENT,
  },
  {
    entity: 'UnitRentBillingCycle',
    byOwnerQuery: 'unitRentBillingCyclesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'rentBillingCycleUid',
    field: 'rentBillingCycle',
    label: 'Billing Cycle',
    pluralLabel: 'Billing Cycles',
    icon: 'calendar_today',
    permission: 'UNIT_RENT_BILLING_CYCLE',
    optionsQuery: ALL_RENT_BILLING_CYCLE,
  },
  {
    entity: 'UnitReservation',
    byOwnerQuery: 'unitReservationsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'reservationUid',
    field: 'reservation',
    label: 'Reservation',
    pluralLabel: 'Reservations',
    icon: 'event_available',
    permission: 'UNIT_RESERVATION',
    optionsQuery: ALL_RESERVATION,
  },
  {
    entity: 'UnitReturn',
    byOwnerQuery: 'unitReturnsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'unitReturnUid',
    field: 'unitReturn',
    label: 'Return',
    pluralLabel: 'Returns',
    icon: 'undo',
    permission: 'UNIT_RETURN',
    optionsQuery: ALL_RETURN,
  },
  {
    entity: 'UnitSell',
    byOwnerQuery: 'unitSellsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'sellUid',
    field: 'sell',
    label: 'Sale',
    pluralLabel: 'Sales',
    icon: 'local_offer',
    permission: 'UNIT_SELL',
    optionsQuery: ALL_SELL,
  },
  {
    entity: 'UnitServiceOffering',
    byOwnerQuery: 'unitServiceOfferingsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'serviceUid',
    field: 'service',
    label: 'Service',
    pluralLabel: 'Services',
    icon: 'build',
    permission: 'UNIT_SERVICE_OFFERING',
    optionsQuery: ALL_SERVICE_OFFERING,
  },
  {
    entity: 'UnitStreet',
    byOwnerQuery: 'unitStreetsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'streetUid',
    field: 'street',
    label: 'Street',
    pluralLabel: 'Streets',
    icon: 'place',
    permission: 'UNIT_STREET',
    optionsQuery: ALL_STREET,
  },
  {
    entity: 'UnitTermination',
    byOwnerQuery: 'unitTerminationsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'terminationUid',
    field: 'termination',
    label: 'Termination',
    pluralLabel: 'Terminations',
    icon: 'cancel',
    permission: 'UNIT_TERMINATION',
    optionsQuery: ALL_TERMINATION,
  },
  {
    entity: 'UnitTitleDeed',
    byOwnerQuery: 'unitTitleDeedsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'titleDeedUid',
    field: 'titleDeed',
    label: 'Title Deed',
    pluralLabel: 'Title Deeds',
    icon: 'verified_user',
    permission: 'UNIT_TITLE_DEED',
    optionsQuery: ALL_TITLE_DEED,
  },
  {
    entity: 'UnitValuation',
    byOwnerQuery: 'unitValuationsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'valuationUid',
    field: 'valuation',
    label: 'Valuation',
    pluralLabel: 'Valuations',
    icon: 'assessment',
    permission: 'UNIT_VALUATION',
    optionsQuery: ALL_VALUATION,
  },
  {
    entity: 'UnitVisit',
    byOwnerQuery: 'unitVisitsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'visitUid',
    field: 'visit',
    label: 'Visit',
    pluralLabel: 'Visits',
    icon: 'place',
    permission: 'UNIT_VISIT',
    optionsQuery: ALL_VISIT,
  },
];

/**
 * The same joins read from the other end, keyed by the record the panel belongs
 * to. A booking's page lists the units it covers, and so on.
 *
 * A list rather than one config each: a problem is joined both to units and to
 * solutions, so it earns two panels.
 */
const LINKS_BY_RECORD: Record<string, EntityLinkConfig[]> = {
  Agreement: [
    {
      entity: 'UnitAgreement',
      byOwnerQuery: 'unitAgreementsByAgreement',
      ownerArg: 'agreementUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_AGREEMENT',
      optionsQuery: ALL_UNIT,
    },
  ],
  Asset: [
    {
      entity: 'UnitAsset',
      byOwnerQuery: 'unitAssetsByAsset',
      ownerArg: 'assetUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_ASSET',
      optionsQuery: ALL_UNIT,
    },
    {
      entity: 'LiabilityAsset',
      byOwnerQuery: 'liabilityAssetsByAsset',
      ownerArg: 'assetUid',
      targetArg: 'liabilityUid',
      field: 'liability',
      label: 'Liability',
      pluralLabel: 'Liabilities',
      icon: 'account_balance',
      permission: 'LIABILITY_ASSET',
      optionsQuery: ALL_LIABILITY,
    },
  ],
  BankAccount: [
    {
      entity: 'UnitBankAccount',
      byOwnerQuery: 'unitBankAccountsByBankAccount',
      ownerArg: 'bankAccountUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_BANK_ACCOUNT',
      optionsQuery: ALL_UNIT,
    },
  ],
  BillPayOption: [
    {
      entity: 'UnitBillPayOption',
      byOwnerQuery: 'unitBillPayOptionsByBillPayOption',
      ownerArg: 'billPayOptionUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_BILL_PAY_OPTION',
      optionsQuery: ALL_UNIT,
    },
  ],
  BioData: [
    {
      entity: 'UnitBioData',
      byOwnerQuery: 'unitBioDatasByBioData',
      ownerArg: 'bioDataUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_BIO_DATA',
      optionsQuery: ALL_UNIT,
    },
    {
      entity: 'LiabilityBioData',
      byOwnerQuery: 'liabilityBioDataByBioData',
      ownerArg: 'bioDataUid',
      targetArg: 'liabilityUid',
      field: 'liability',
      label: 'Liability',
      pluralLabel: 'Liabilities',
      icon: 'account_balance',
      permission: 'LIABILITY_BIO_DATA',
      optionsQuery: ALL_LIABILITY,
    },
  ],
  BooleanParameter: [
    {
      entity: 'HandoverBooleanParameter',
      byOwnerQuery: 'handoverBooleanParametersByParameter',
      ownerArg: 'booleanParameterUid',
      targetArg: 'handoverUid',
      field: 'handover',
      label: 'Handover',
      pluralLabel: 'Handovers',
      icon: 'swap_horiz',
      permission: 'HANDOVER_BOOLEAN_PARAMETER',
      optionsQuery: ALL_HANDOVER,
      // A handover's name says little on its own, so the date it took place is
      // selected alongside the inherited triple and shown as a column.
      targetGqlFields: `
    id
    assignedNumber
    name
    handedOverAt
  `,
      columns: [
        'index',
        'handover.assignedNumber as Assigned Number',
        'handover.name as Handover',
        'handover.handedOverAt as Handed Over',
        'actions',
      ],
    },
  ],
  Booking: [
    {
      entity: 'UnitBooking',
      byOwnerQuery: 'unitBookingsByBooking',
      ownerArg: 'bookingUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_BOOKING',
      optionsQuery: ALL_UNIT,
    },
  ],
  BusinessName: [
    {
      entity: 'UnitBusinessName',
      byOwnerQuery: 'unitBusinessNamesByBusinessName',
      ownerArg: 'businessNameUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_BUSINESS_NAME',
      optionsQuery: ALL_UNIT,
    },
    {
      entity: 'LiabilityBusinessName',
      byOwnerQuery: 'liabilityBusinessNamesByBusinessName',
      ownerArg: 'businessNameUid',
      targetArg: 'liabilityUid',
      field: 'liability',
      label: 'Liability',
      pluralLabel: 'Liabilities',
      icon: 'account_balance',
      permission: 'LIABILITY_BUSINESS_NAME',
      optionsQuery: ALL_LIABILITY,
    },
  ],
  CollectionCenter: [
    {
      entity: 'UnitCollectionCenter',
      byOwnerQuery: 'unitCollectionCentersByCollectionCenter',
      ownerArg: 'collectionCenterUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_COLLECTION_CENTER',
      optionsQuery: ALL_UNIT,
    },
  ],
  Commission: [
    {
      entity: 'UnitCommission',
      byOwnerQuery: 'unitCommissionsByCommission',
      ownerArg: 'commissionUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_COMMISSION',
      optionsQuery: ALL_UNIT,
    },
  ],
  Cost: [
    {
      entity: 'UnitCost',
      byOwnerQuery: 'unitCostsByCost',
      ownerArg: 'costUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_COST',
      optionsQuery: ALL_UNIT,
    },
  ],
  Discount: [
    {
      entity: 'UnitDiscount',
      byOwnerQuery: 'unitDiscountsByDiscount',
      ownerArg: 'discountUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_DISCOUNT',
      optionsQuery: ALL_UNIT,
    },
  ],
  Entry: [
    {
      entity: 'UnitEntry',
      byOwnerQuery: 'unitEntriesByEntry',
      ownerArg: 'entryUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_ENTRY',
      optionsQuery: ALL_UNIT,
    },
  ],
  Eviction: [
    {
      entity: 'UnitEviction',
      byOwnerQuery: 'unitEvictionsByEviction',
      ownerArg: 'evictionUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_EVICTION',
      optionsQuery: ALL_UNIT,
    },
  ],
  Exit: [
    {
      entity: 'UnitExit',
      byOwnerQuery: 'unitExitsByExit',
      ownerArg: 'exitUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_EXIT',
      optionsQuery: ALL_UNIT,
    },
  ],
  Fee: [
    {
      entity: 'UnitFee',
      byOwnerQuery: 'unitFeesByFee',
      ownerArg: 'feeUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_FEE',
      optionsQuery: ALL_UNIT,
    },
  ],
  GfsCode: [
    {
      entity: 'UnitGfsCode',
      byOwnerQuery: 'unitGfsCodesByGfsCode',
      ownerArg: 'gfsCodeUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_GFS_CODE',
      optionsQuery: ALL_UNIT,
    },
  ],
  Grade: [
    {
      entity: 'UnitGrade',
      byOwnerQuery: 'unitGradesByGrade',
      ownerArg: 'gradeUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_GRADE',
      optionsQuery: ALL_UNIT,
    },
  ],
  Handover: [
    {
      entity: 'UnitHandover',
      byOwnerQuery: 'unitHandoversByHandover',
      ownerArg: 'handoverUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_HANDOVER',
      optionsQuery: ALL_UNIT,
    },
    // What the handover is assessed on. The link says only that the parameter
    // applies — the reading itself is a *_parameter_values row, which points at
    // the parameter and not at the handover, so it cannot be shown here.
    {
      entity: 'HandoverQualitativeParameter',
      byOwnerQuery: 'handoverQualitativeParametersByHandover',
      ownerArg: 'handoverUid',
      targetArg: 'qualitativeParameterUid',
      field: 'qualitativeParameter',
      label: 'Qualitative Parameter',
      pluralLabel: 'Qualitative Parameters',
      icon: 'assessment',
      permission: 'HANDOVER_QUALITATIVE_PARAMETER',
      optionsQuery: ALL_QUALITATIVE_PARAMETER,
    },
    {
      entity: 'HandoverQuantitativeParameter',
      byOwnerQuery: 'handoverQuantitativeParametersByHandover',
      ownerArg: 'handoverUid',
      targetArg: 'quantitativeParameterUid',
      field: 'quantitativeParameter',
      label: 'Quantitative Parameter',
      pluralLabel: 'Quantitative Parameters',
      icon: 'straighten',
      permission: 'HANDOVER_QUANTITATIVE_PARAMETER',
      optionsQuery: ALL_QUANTITATIVE_PARAMETER,
    },
    {
      entity: 'HandoverBooleanParameter',
      byOwnerQuery: 'handoverBooleanParametersByHandover',
      ownerArg: 'handoverUid',
      targetArg: 'booleanParameterUid',
      field: 'booleanParameter',
      label: 'Boolean Parameter',
      pluralLabel: 'Boolean Parameters',
      icon: 'rule',
      permission: 'HANDOVER_BOOLEAN_PARAMETER',
      optionsQuery: ALL_BOOLEAN_PARAMETER,
    },
  ],
  Inspection: [
    {
      entity: 'UnitInspection',
      byOwnerQuery: 'unitInspectionsByInspection',
      ownerArg: 'inspectionUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_INSPECTION',
      optionsQuery: ALL_UNIT,
    },
  ],
  LandUse: [
    {
      entity: 'UnitLandUse',
      byOwnerQuery: 'unitLandUsesByLandUse',
      ownerArg: 'landUseUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_LAND_USE',
      optionsQuery: ALL_UNIT,
    },
  ],
  Lease: [
    {
      entity: 'UnitLease',
      byOwnerQuery: 'unitLeasesByLease',
      ownerArg: 'leaseUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_LEASE',
      optionsQuery: ALL_UNIT,
    },
  ],
  Liability: [
    {
      entity: 'UnitLiability',
      byOwnerQuery: 'unitLiabilitiesByLiability',
      ownerArg: 'liabilityUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_LIABILITY',
      optionsQuery: ALL_UNIT,
    },
    // The three below are the liability's own join tables, not the unit's. A
    // liability is the one record here that links to something other than a
    // unit: who owes it, and what it is secured on.
    {
      entity: 'LiabilityBioData',
      byOwnerQuery: 'liabilityBioDataByLiability',
      ownerArg: 'liabilityUid',
      targetArg: 'bioDataUid',
      field: 'bioData',
      label: 'Person',
      pluralLabel: 'Debtors — People',
      icon: 'person',
      permission: 'LIABILITY_BIO_DATA',
      optionsQuery: ALL_BIO_DATA,
      // bio_data is not a CoreNamedEntity — no assignedNumber to select.
      targetGqlFields: `
    id
    uid: id
    name
  `,
      columns: ['index', 'bioData.name as Person', 'actions'],
    },
    {
      entity: 'LiabilityBusinessName',
      byOwnerQuery: 'liabilityBusinessNamesByLiability',
      ownerArg: 'liabilityUid',
      targetArg: 'businessNameUid',
      field: 'businessName',
      label: 'Business',
      pluralLabel: 'Debtors — Businesses',
      icon: 'business',
      permission: 'LIABILITY_BUSINESS_NAME',
      optionsQuery: ALL_BUSINESS_NAME,
    },
    {
      entity: 'LiabilityAsset',
      byOwnerQuery: 'liabilityAssetsByLiability',
      ownerArg: 'liabilityUid',
      targetArg: 'assetUid',
      field: 'asset',
      label: 'Asset',
      // The join records no share, so this says which assets the debt is
      // secured on and not how much of it each one covers.
      pluralLabel: 'Secured On',
      icon: 'shop',
      permission: 'LIABILITY_ASSET',
      optionsQuery: ALL_ASSET,
    },
  ],
  Loan: [
    {
      entity: 'UnitLoan',
      byOwnerQuery: 'unitLoansByLoan',
      ownerArg: 'loanUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_LOAN',
      optionsQuery: ALL_UNIT,
    },
  ],
  Maintenance: [
    {
      entity: 'UnitMaintenance',
      byOwnerQuery: 'unitMaintenancesByMaintenance',
      ownerArg: 'maintenanceUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_MAINTENANCE',
      optionsQuery: ALL_UNIT,
    },
  ],
  Meter: [
    {
      entity: 'UnitMeter',
      byOwnerQuery: 'unitMetersByMeter',
      ownerArg: 'meterUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_METER',
      optionsQuery: ALL_UNIT,
    },
  ],
  Notice: [
    {
      entity: 'UnitNotice',
      byOwnerQuery: 'unitNoticesByNotice',
      ownerArg: 'noticeUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_NOTICE',
      optionsQuery: ALL_UNIT,
    },
  ],
  NoticeDay: [
    {
      entity: 'UnitNoticeDay',
      byOwnerQuery: 'unitNoticeDaysByNoticeDay',
      ownerArg: 'noticeDayUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_NOTICE_DAY',
      optionsQuery: ALL_UNIT,
    },
  ],
  Penalty: [
    {
      entity: 'UnitPenalty',
      byOwnerQuery: 'unitPenaltiesByPenalty',
      ownerArg: 'penaltyUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_PENALTY',
      optionsQuery: ALL_UNIT,
    },
  ],
  Problem: [
    {
      entity: 'SolutionProblem',
      byOwnerQuery: 'solutionProblemsByProblem',
      ownerArg: 'problemUid',
      targetArg: 'solutionUid',
      field: 'solution',
      label: 'Solution',
      pluralLabel: 'Solutions',
      icon: 'highlight',
      permission: 'SOLUTION_PROBLEM',
      optionsQuery: ALL_SOLUTION,
    },
    {
      entity: 'UnitProblem',
      byOwnerQuery: 'unitProblemsByProblem',
      ownerArg: 'problemUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_PROBLEM',
      optionsQuery: ALL_UNIT,
    },
  ],
  Purchase: [
    {
      entity: 'UnitPurchase',
      byOwnerQuery: 'unitPurchasesByPurchase',
      ownerArg: 'purchaseUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_PURCHASE',
      optionsQuery: ALL_UNIT,
    },
  ],
  QualitativeParameter: [
    {
      entity: 'UnitQualitativeParameter',
      byOwnerQuery: 'unitQualitativeParametersByQualitativeParameter',
      ownerArg: 'qualitativeParameterUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_QUALITATIVE_PARAMETER',
      optionsQuery: ALL_UNIT,
    },
    {
      entity: 'HandoverQualitativeParameter',
      byOwnerQuery: 'handoverQualitativeParametersByParameter',
      ownerArg: 'qualitativeParameterUid',
      targetArg: 'handoverUid',
      field: 'handover',
      label: 'Handover',
      pluralLabel: 'Handovers',
      icon: 'swap_horiz',
      permission: 'HANDOVER_QUALITATIVE_PARAMETER',
      optionsQuery: ALL_HANDOVER,
      // A handover's name says little on its own, so the date it took place is
      // selected alongside the inherited triple and shown as a column.
      targetGqlFields: `
    id
    assignedNumber
    name
    handedOverAt
  `,
      columns: [
        'index',
        'handover.assignedNumber as Assigned Number',
        'handover.name as Handover',
        'handover.handedOverAt as Handed Over',
        'actions',
      ],
    },
  ],
  QuantitativeParameter: [
    {
      entity: 'UnitQuantitativeParameter',
      byOwnerQuery: 'unitQuantitativeParametersByQuantitativeParameter',
      ownerArg: 'quantitativeParameterUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_QUANTITATIVE_PARAMETER',
      optionsQuery: ALL_UNIT,
    },
    {
      entity: 'HandoverQuantitativeParameter',
      byOwnerQuery: 'handoverQuantitativeParametersByParameter',
      ownerArg: 'quantitativeParameterUid',
      targetArg: 'handoverUid',
      field: 'handover',
      label: 'Handover',
      pluralLabel: 'Handovers',
      icon: 'swap_horiz',
      permission: 'HANDOVER_QUANTITATIVE_PARAMETER',
      optionsQuery: ALL_HANDOVER,
      // A handover's name says little on its own, so the date it took place is
      // selected alongside the inherited triple and shown as a column.
      targetGqlFields: `
    id
    assignedNumber
    name
    handedOverAt
  `,
      columns: [
        'index',
        'handover.assignedNumber as Assigned Number',
        'handover.name as Handover',
        'handover.handedOverAt as Handed Over',
        'actions',
      ],
    },
  ],
  RegistryMasterPlan: [
    {
      entity: 'UnitMasterPlan',
      byOwnerQuery: 'unitMasterPlansByMasterPlan',
      ownerArg: 'masterPlanUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_MASTER_PLAN',
      optionsQuery: ALL_UNIT,
    },
  ],
  RegistryProject: [
    {
      entity: 'UnitProject',
      byOwnerQuery: 'unitProjectsByProject',
      ownerArg: 'projectUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_PROJECT',
      optionsQuery: ALL_UNIT,
    },
  ],
  Rent: [
    {
      entity: 'UnitRent',
      byOwnerQuery: 'unitRentsByRent',
      ownerArg: 'rentUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_RENT',
      optionsQuery: ALL_UNIT,
    },
  ],
  RentBillingCycle: [
    {
      entity: 'UnitRentBillingCycle',
      byOwnerQuery: 'unitRentBillingCyclesByRentBillingCycle',
      ownerArg: 'rentBillingCycleUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_RENT_BILLING_CYCLE',
      optionsQuery: ALL_UNIT,
    },
  ],
  Reservation: [
    {
      entity: 'UnitReservation',
      byOwnerQuery: 'unitReservationsByReservation',
      ownerArg: 'reservationUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_RESERVATION',
      optionsQuery: ALL_UNIT,
    },
  ],
  Return: [
    {
      entity: 'UnitReturn',
      byOwnerQuery: 'unitReturnsByUnitReturn',
      ownerArg: 'unitReturnUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_RETURN',
      optionsQuery: ALL_UNIT,
    },
  ],
  SecurityDeposit: [
    {
      entity: 'SecurityDepositUnit',
      byOwnerQuery: 'securityDepositUnitsBySecurityDeposit',
      ownerArg: 'securityDepositUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'SECURITY_DEPOSIT_UNIT',
      optionsQuery: ALL_UNIT,
    },
  ],
  Sell: [
    {
      entity: 'UnitSell',
      byOwnerQuery: 'unitSellsBySell',
      ownerArg: 'sellUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_SELL',
      optionsQuery: ALL_UNIT,
    },
  ],
  ServiceConnection: [
    {
      entity: 'UnitConnection',
      byOwnerQuery: 'unitConnectionsByConnection',
      ownerArg: 'connectionUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_CONNECTION',
      optionsQuery: ALL_UNIT,
    },
  ],
  ServiceDisconnection: [
    {
      entity: 'UnitDisconnection',
      byOwnerQuery: 'unitDisconnectionsByDisconnection',
      ownerArg: 'disconnectionUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_DISCONNECTION',
      optionsQuery: ALL_UNIT,
    },
  ],
  ServiceOffering: [
    {
      entity: 'UnitServiceOffering',
      byOwnerQuery: 'unitServiceOfferingsByService',
      ownerArg: 'serviceUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_SERVICE_OFFERING',
      optionsQuery: ALL_UNIT,
    },
  ],
  Solution: [
    {
      entity: 'SolutionProblem',
      byOwnerQuery: 'solutionProblemsBySolution',
      ownerArg: 'solutionUid',
      targetArg: 'problemUid',
      field: 'problem',
      label: 'Problem',
      pluralLabel: 'Problems',
      icon: 'report_problem',
      permission: 'SOLUTION_PROBLEM',
      optionsQuery: ALL_PROBLEM,
    },
  ],
  Street: [
    {
      entity: 'UnitStreet',
      byOwnerQuery: 'unitStreetsByStreet',
      ownerArg: 'streetUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_STREET',
      optionsQuery: ALL_UNIT,
    },
  ],
  Termination: [
    {
      entity: 'UnitTermination',
      byOwnerQuery: 'unitTerminationsByTermination',
      ownerArg: 'terminationUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_TERMINATION',
      optionsQuery: ALL_UNIT,
    },
  ],
  TitleDeed: [
    {
      entity: 'UnitTitleDeed',
      byOwnerQuery: 'unitTitleDeedsByTitleDeed',
      ownerArg: 'titleDeedUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_TITLE_DEED',
      optionsQuery: ALL_UNIT,
    },
  ],
  Valuation: [
    {
      entity: 'UnitValuation',
      byOwnerQuery: 'unitValuationsByValuation',
      ownerArg: 'valuationUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_VALUATION',
      optionsQuery: ALL_UNIT,
    },
  ],
  Visit: [
    {
      entity: 'UnitVisit',
      byOwnerQuery: 'unitVisitsByVisit',
      ownerArg: 'visitUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_VISIT',
      optionsQuery: ALL_UNIT,
    },
  ],
};

/** The panels appended to a unit's detail page. */
export const unitLinkPanels = (comp: BaseComponent, unitUid?: string): ContentParameter[] =>
  entityLinkPanels(comp, UNIT_LINKS, unitUid);

/**
 * The panel appended to one record's detail page, listing what it is linked to
 * from that side. Returns nothing for a record with no join table, so a lookup
 * can call it unconditionally.
 */
export const recordLinkPanels = (
  comp: BaseComponent,
  record: string,
  uid?: string,
): ContentParameter[] => {
  const configs = LINKS_BY_RECORD[record];
  return configs ? entityLinkPanels(comp, configs, uid) : [];
};

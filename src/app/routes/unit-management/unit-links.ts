import { gql } from '@apollo/client/core';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
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

const ALL_SECTION_VALUE = gql`
  query allSectionValues {
    allSectionValues {
      id
      name
    }
  }
`;

const ALL_CLAUSE_VALUE = gql`
  query allClauseValues {
    allClauseValues {
      id
      name
    }
  }
`;

const ALL_SUB_CLAUSE_VALUE = gql`
  query allSubClauseValues {
    allSubClauseValues {
      id
      name
    }
  }
`;

const ALL_SUB_SUBCLAUSE_VALUE = gql`
  query allSubSubclauseValues {
    allSubSubclauseValues {
      id
      name
    }
  }
`;

const ALL_ACCOUNT = gql`
  query allAccounts {
    allAccounts {
      id
      name
    }
  }
`;

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

const ALL_CENTER = gql`
  query allCenters {
    allCenters {
      id
      name
    }
  }
`;

const ALL_BILL_HEADERS_SETTING_QUANTITY = gql`
  query allBillHeadersSettingQuantities {
    allBillHeadersSettingQuantities {
      id
      name
    }
  }
`;

/** A quantity as the far side of a connection: what tells one from the next. */
const quantitySideGqlFields = `
    id
    uid: id
    assignedNumber
    name
    quantities
    startedDay
    deadline
  `;

const ALL_ASSESSMENT = gql`
  query allAssessments {
    allAssessments {
      id
      name
    }
  }
`;

const ALL_JUDGMENT = gql`
  query allJudgments {
    allJudgments {
      id
      name
    }
  }
`;

const ALL_FINDING = gql`
  query allFindings {
    allFindings {
      id
      name
    }
  }
`;

const ALL_OBSERVATION = gql`
  query allObservations {
    allObservations {
      id
      name
    }
  }
`;

const ALL_TASK = gql`
  query allTasks {
    allTasks {
      id
      name
    }
  }
`;

const ALL_OBJECT = gql`
  query allObjectsIds {
    allObjectsIds {
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

const ALL_BILL_HEADER = gql`
  query allBillHeaders {
    allBillHeaders {
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

/** The positions register: what a person can be put on a piece of work as. */
const ALL_POSITION = gql`
  query allPositions {
    allPositions {
      id
      name
    }
  }
`;

/**
 * The officers on an inspection or an assessment — `inspections_bio_data` and
 * `assessments_bio_data`, the same panel with different words. The join row
 * names the person and the position they hold; linking someone already there
 * under another position changes their position.
 *
 * The position is a row of `positions`, where it used to be one of twelve
 * fixed roles. Both panels offer the whole register: nothing on a position
 * says whether it is for inspecting or assessing.
 */
const officerLink = (
  entity: 'InspectionBioData' | 'AssessmentBioData',
  ownerArg: 'inspectionUid' | 'assessmentUid',
  permission: string,
): EntityLinkConfig => ({
  entity,
  byOwnerQuery:
    ownerArg === 'inspectionUid' ? 'inspectionBioDataByInspection' : 'assessmentBioDataByAssessment',
  ownerArg,
  targetArg: 'bioDataUid',
  field: 'bioData',
  label: 'Officer',
  pluralLabel: 'Officers',
  icon: 'users',
  permission,
  optionsQuery: ALL_BIO_DATA,
  targetGqlFields: `
    id
    uid: id
    name
  `,
  columns: ['index', 'bioData.name as Officer', 'position.name as Position', 'actions'],
  extraFields: [
    {
      arg: 'positionUid',
      rowField: 'position',
      rowGqlFields: 'id\nname',
      field: {
        label: 'Position',
        hint: 'Maintained under Reference Data > Positions',
        type: FieldType.select,
        optionsVariables: {
          labelKey: 'name',
          valueKey: 'id',
          fetchParameter: { query: ALL_POSITION },
        },
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
      },
    },
  ],
});

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

const ALL_DISTRICT = gql`
  query allDistricts {
    allDistricts {
      id
      name
    }
  }
`;

/** One link table read from both ends: the districts a collection centre serves. */
const COLLECTION_CENTER_DISTRICT = {
  entity: 'CollectionCenterDistrict',
  ownerArg: 'collectionCenterUid',
  targetArg: 'districtUid',
  permission: 'COLLECTION_CENTER_DISTRICT',
};

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

const ALL_DOWN_PAYMENT = gql`
  query allDownPayments {
    allDownPayments {
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

const ALL_CHARGE = gql`
  query allCharges {
    allCharges {
      id
      name
    }
  }
`;

const ALL_EXPENSE = gql`
  query allExpenses {
    allExpenses {
      id
      name
    }
  }
`;

/**
 * The grace period bill settings a unit can be put under. They have no name
 * column — the backend composes one from the grace period and the bill template
 * the row names, which is what the picker and the grid show.
 */
const ALL_GRACE_PERIOD_BILL_SETTING = gql`
  query allGracePeriodBillHeadersSettings {
    allGracePeriodBillHeadersSettings {
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

const ALL_INSTALLMENT = gql`
  query allInstallments {
    allInstallments {
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

const ALL_BOOLEAN_PARAMETER_VALUE = gql`
  query allBooleanParameterValues {
    allBooleanParameterValues {
      id
      name
    }
  }
`;

const ALL_QUALITATIVE_PARAMETER_VALUE = gql`
  query allQualitativeParameterValues {
    allQualitativeParameterValues {
      id
      name
    }
  }
`;

const ALL_QUANTITATIVE_PARAMETER_VALUE = gql`
  query allQuantitativeParameterValues {
    allQuantitativeParameterValues {
      id
      name
    }
  }
`;

const ALL_CHECKLIST = gql`
  query allChecklists {
    allChecklists {
      id
      name
    }
  }
`;

/** One of the eight checklists_* link tables, named by its far side. */
interface ChecklistLinkSide {
  /** The far side's entity name, e.g. `BooleanParameter`. */
  record: string;
  /** Its plural, as the link reads spell it, e.g. `BooleanParameters`. */
  plural: string;
  label: string;
  pluralLabel: string;
  icon: string;
  optionsQuery: unknown;
}

const CHECKLIST_LINK_SIDES: ChecklistLinkSide[] = [
  {
    record: 'BooleanParameter',
    plural: 'BooleanParameters',
    label: 'Boolean Parameter',
    pluralLabel: 'Boolean Parameters',
    icon: 'rule',
    optionsQuery: ALL_BOOLEAN_PARAMETER,
  },
  {
    record: 'QualitativeParameter',
    plural: 'QualitativeParameters',
    label: 'Qualitative Parameter',
    pluralLabel: 'Qualitative Parameters',
    icon: 'assessment',
    optionsQuery: ALL_QUALITATIVE_PARAMETER,
  },
  {
    record: 'QuantitativeParameter',
    plural: 'QuantitativeParameters',
    label: 'Quantitative Parameter',
    pluralLabel: 'Quantitative Parameters',
    icon: 'poll',
    optionsQuery: ALL_QUANTITATIVE_PARAMETER,
  },
  {
    record: 'Assessment',
    plural: 'Assessments',
    label: 'Assessment',
    pluralLabel: 'Assessments',
    icon: 'verified_user',
    optionsQuery: ALL_ASSESSMENT,
  },
  {
    record: 'BooleanParameterValue',
    plural: 'BooleanParameterValues',
    label: 'Boolean Parameter Value',
    pluralLabel: 'Boolean Parameter Values',
    icon: 'rule',
    optionsQuery: ALL_BOOLEAN_PARAMETER_VALUE,
  },
  {
    record: 'Inspection',
    plural: 'Inspections',
    label: 'Inspection',
    pluralLabel: 'Inspections',
    icon: 'assignment_turned_in',
    optionsQuery: ALL_INSPECTION,
  },
  {
    record: 'QualitativeParameterValue',
    plural: 'QualitativeParameterValues',
    label: 'Qualitative Parameter Value',
    pluralLabel: 'Qualitative Parameter Values',
    icon: 'assessment',
    optionsQuery: ALL_QUALITATIVE_PARAMETER_VALUE,
  },
  {
    record: 'QuantitativeParameterValue',
    plural: 'QuantitativeParameterValues',
    label: 'Quantitative Parameter Value',
    pluralLabel: 'Quantitative Parameter Values',
    icon: 'poll',
    optionsQuery: ALL_QUANTITATIVE_PARAMETER_VALUE,
  },
];

/** `BooleanParameter` -> `booleanParameter`. */
const camel = (name: string): string => name.charAt(0).toLowerCase() + name.slice(1);

/** `BooleanParameter` -> `BOOLEAN_PARAMETER`. */
const upperSnake = (name: string): string => name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

/** The far side's panel on a checklist's page. */
const checklistSidePanel = (side: ChecklistLinkSide): EntityLinkConfig => ({
  entity: `Checklist${side.record}`,
  byOwnerQuery: `checklist${side.plural}ByChecklist`,
  ownerArg: 'checklistUid',
  targetArg: `${camel(side.record)}Uid`,
  field: camel(side.record),
  label: side.label,
  pluralLabel: side.pluralLabel,
  icon: side.icon,
  permission: `CHECKLIST_${upperSnake(side.record)}`,
  optionsQuery: side.optionsQuery,
});

/** The same link read from the far side: the checklists a record is on. */
const checklistsPanel = (record: string): EntityLinkConfig => {
  const side = CHECKLIST_LINK_SIDES.find((s) => s.record === record)!;
  return {
    ...checklistSidePanel(side),
    byOwnerQuery: `checklist${side.plural}By${side.record}`,
    ownerArg: `${camel(side.record)}Uid`,
    targetArg: 'checklistUid',
    field: 'checklist',
    label: 'Checklist',
    pluralLabel: 'Checklists',
    icon: 'playlist_add_check',
    optionsQuery: ALL_CHECKLIST,
  };
};

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

/** Every automatic bill setting, for choosing the one a penalty is billed from. */
const ALL_BILL_HEADERS_SETTING = gql`
  query allBillHeadersSettings {
    allBillHeadersSettings {
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

const ALL_SP_CODE = gql`
  query allSpCodes {
    allSpCodes {
      id
      name
    }
  }
`;

/** Panels for a unit's own page: everything it is linked to. */
const UNIT_LINKS: EntityLinkConfig[] = [
  // The chain first: what this unit leads to, and what leads to it. Both are
  // one row at most -- units_units12 and units_units13 are UNIQUE on each
  // column on its own -- so these two grids never hold more than a single line.
  {
    entity: 'UnitUnit',
    byOwnerQuery: 'unitUnitsByParent',
    ownerArg: 'parentUid',
    targetArg: 'childUid',
    field: 'child',
    label: 'Next Unit',
    pluralLabel: 'Leads To',
    icon: 'arrow_forward',
    permission: 'UNIT_UNIT',
    optionsQuery: ALL_UNIT,
  },
  {
    entity: 'UnitUnit',
    byOwnerQuery: 'unitUnitsByChild',
    ownerArg: 'childUid',
    targetArg: 'parentUid',
    field: 'parent',
    label: 'Previous Unit',
    pluralLabel: 'Follows',
    icon: 'arrow_back',
    permission: 'UNIT_UNIT',
    optionsQuery: ALL_UNIT,
  },
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
    entity: 'UnitBillHeader',
    byOwnerQuery: 'unitBillHeadersByUnit',
    ownerArg: 'unitUid',
    targetArg: 'billHeaderUid',
    field: 'billHeader',
    label: 'Bill Header',
    pluralLabel: 'Bill Headers',
    icon: 'bill_alt',
    permission: 'UNIT_BILL_HEADER',
    optionsQuery: ALL_BILL_HEADER,
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
    entity: 'UnitExpense',
    byOwnerQuery: 'unitExpensesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'expenseUid',
    field: 'expense',
    label: 'Expense',
    pluralLabel: 'Expenses',
    icon: 'receipt',
    permission: 'UNIT_EXPENSE',
    optionsQuery: ALL_EXPENSE,
  },
  {
    entity: 'UnitCharge',
    byOwnerQuery: 'unitChargesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'chargeUid',
    field: 'charge',
    label: 'Charge',
    pluralLabel: 'Charges',
    icon: 'bill',
    permission: 'UNIT_CHARGE',
    optionsQuery: ALL_CHARGE,
  },
  {
    entity: 'UnitGracePeriodBillHeadersSetting',
    byOwnerQuery: 'unitGracePeriodBillHeadersSettingsByUnit',
    ownerArg: 'unitUid',
    targetArg: 'gracePeriodBillHeadersSettingUid',
    field: 'gracePeriodBillHeadersSetting',
    label: 'Grace Period Bill Setting',
    pluralLabel: 'Grace Period Bill Settings',
    icon: 'clock',
    permission: 'UNIT_GRACE_PERIOD_BILL_SETTING',
    optionsQuery: ALL_GRACE_PERIOD_BILL_SETTING,
    // No assignedNumber on this table: the name above is composed, and the
    // quantity is what distinguishes two settings at a glance.
    targetGqlFields: `
      id
      name
      quantities
    `,
    columns: [
      'index',
      'gracePeriodBillHeadersSetting.name as Setting',
      'gracePeriodBillHeadersSetting.quantities as Quantity',
      'actions',
    ],
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
    entity: 'UnitSpCode',
    byOwnerQuery: 'unitSpCodesByUnit',
    ownerArg: 'unitUid',
    targetArg: 'spCodeUid',
    field: 'spCode',
    label: 'Service Provider Code',
    pluralLabel: 'Service Provider Codes',
    icon: 'label',
    permission: 'UNIT_SP_CODE',
    optionsQuery: ALL_SP_CODE,
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
  // What a checklist holds: one panel per checklists_* link table.
  Checklist: CHECKLIST_LINK_SIDES.map(checklistSidePanel),
  // The checklists a reading is on (checklists_*_parameter_values).
  BooleanParameterValue: [checklistsPanel('BooleanParameterValue')],
  QualitativeParameterValue: [checklistsPanel('QualitativeParameterValue')],
  QuantitativeParameterValue: [checklistsPanel('QuantitativeParameterValue')],
  // The fees that belong to an account (accounts_fees).
  Account: [
    {
      entity: 'AccountFee',
      byOwnerQuery: 'accountFeesByAccount',
      ownerArg: 'accountUid',
      targetArg: 'feeUid',
      field: 'fee',
      label: 'Fee',
      pluralLabel: 'Fees',
      icon: 'coins',
      permission: 'ACCOUNT_FEE',
      optionsQuery: ALL_FEE,
    },
  ],
  // What an assessment covers, and what it came to: one panel per link table
  // (bio_data_assessments, tasks_assessments, objectsid_assessments,
  // judgments_assessments, findings_assessments).
  Assessment: [
    // Who carries it out, ahead of who and what it is about.
    officerLink('AssessmentBioData', 'assessmentUid', 'ASSESSMENT_BIO_DATA'),
    // The checklists it is on (checklists_assessments).
    checklistsPanel('Assessment'),
    // The inspections carried out under it (inspections_assessments, read from
    // this side).
    {
      entity: 'InspectionAssessment',
      byOwnerQuery: 'inspectionAssessmentsByAssessment',
      ownerArg: 'assessmentUid',
      targetArg: 'inspectionUid',
      field: 'inspection',
      label: 'Inspection',
      pluralLabel: 'Inspections',
      icon: 'assignment_turned_in',
      permission: 'INSPECTION_ASSESSMENT',
      optionsQuery: ALL_INSPECTION,
    },
    {
      entity: 'BioDataAssessment',
      byOwnerQuery: 'bioDataAssessmentsByAssessment',
      ownerArg: 'assessmentUid',
      targetArg: 'bioDataUid',
      field: 'bioData',
      label: 'Person',
      pluralLabel: 'People',
      icon: 'users',
      permission: 'BIO_DATA_ASSESSMENT',
      optionsQuery: ALL_BIO_DATA,
      targetGqlFields: `
    id
    uid: id
    name
  `,
      columns: ['index', 'bioData.name as Person', 'actions'],
    },
    {
      entity: 'TaskAssessment',
      byOwnerQuery: 'taskAssessmentsByAssessment',
      ownerArg: 'assessmentUid',
      targetArg: 'taskUid',
      field: 'task',
      label: 'Task',
      pluralLabel: 'Tasks',
      icon: 'list',
      permission: 'TASK_ASSESSMENT',
      optionsQuery: ALL_TASK,
    },
    {
      entity: 'ObjectsIdAssessment',
      byOwnerQuery: 'objectsIdAssessmentsByAssessment',
      ownerArg: 'assessmentUid',
      targetArg: 'objectsIdUid',
      field: 'objectsId',
      label: 'Object',
      pluralLabel: 'Objects',
      icon: 'institution',
      permission: 'OBJECTS_ID_ASSESSMENT',
      optionsQuery: ALL_OBJECT,
    },
    {
      entity: 'JudgmentAssessment',
      byOwnerQuery: 'judgmentAssessmentsByAssessment',
      ownerArg: 'assessmentUid',
      targetArg: 'judgmentUid',
      field: 'judgment',
      label: 'Judgment',
      pluralLabel: 'Judgments',
      icon: 'scales',
      permission: 'JUDGMENT_ASSESSMENT',
      optionsQuery: ALL_JUDGMENT,
    },
    {
      entity: 'FindingAssessment',
      byOwnerQuery: 'findingAssessmentsByAssessment',
      ownerArg: 'assessmentUid',
      targetArg: 'findingUid',
      field: 'finding',
      label: 'Finding',
      pluralLabel: 'Findings',
      icon: 'list',
      permission: 'FINDING_ASSESSMENT',
      optionsQuery: ALL_FINDING,
    },
  ],
  // The assessments a judgment or a finding belongs to, read from its side.
  Judgment: [
    {
      entity: 'JudgmentAssessment',
      byOwnerQuery: 'judgmentAssessmentsByJudgment',
      ownerArg: 'judgmentUid',
      targetArg: 'assessmentUid',
      field: 'assessment',
      label: 'Assessment',
      pluralLabel: 'Assessments',
      icon: 'verified_user',
      permission: 'JUDGMENT_ASSESSMENT',
      optionsQuery: ALL_ASSESSMENT,
    },
    {
      entity: 'InspectionJudgment',
      byOwnerQuery: 'inspectionJudgmentsByJudgment',
      ownerArg: 'judgmentUid',
      targetArg: 'inspectionUid',
      field: 'inspection',
      label: 'Inspection',
      pluralLabel: 'Inspections',
      icon: 'assignment_turned_in',
      permission: 'INSPECTION_JUDGMENT',
      optionsQuery: ALL_INSPECTION,
    },
  ],
  // The inspections that looked at an object, and the ones that recorded an
  // observation — inspections_objectsid and inspections_observations, each read
  // from the far side.
  ObjectsId: [
    {
      entity: 'InspectionObjectsId',
      byOwnerQuery: 'inspectionObjectsIdsByObjectsId',
      ownerArg: 'objectsIdUid',
      targetArg: 'inspectionUid',
      field: 'inspection',
      label: 'Inspection',
      pluralLabel: 'Inspections',
      icon: 'assignment_turned_in',
      permission: 'INSPECTION_OBJECTS_ID',
      optionsQuery: ALL_INSPECTION,
    },
  ],
  Observation: [
    {
      entity: 'InspectionObservation',
      byOwnerQuery: 'inspectionObservationsByObservation',
      ownerArg: 'observationUid',
      targetArg: 'inspectionUid',
      field: 'inspection',
      label: 'Inspection',
      pluralLabel: 'Inspections',
      icon: 'assignment_turned_in',
      permission: 'INSPECTION_OBSERVATION',
      optionsQuery: ALL_INSPECTION,
    },
  ],
  Finding: [
    {
      entity: 'InspectionFinding',
      byOwnerQuery: 'inspectionFindingsByFinding',
      ownerArg: 'findingUid',
      targetArg: 'inspectionUid',
      field: 'inspection',
      label: 'Inspection',
      pluralLabel: 'Inspections',
      icon: 'assignment_turned_in',
      permission: 'INSPECTION_FINDING',
      optionsQuery: ALL_INSPECTION,
    },
    {
      entity: 'FindingAssessment',
      byOwnerQuery: 'findingAssessmentsByFinding',
      ownerArg: 'findingUid',
      targetArg: 'assessmentUid',
      field: 'assessment',
      label: 'Assessment',
      pluralLabel: 'Assessments',
      icon: 'verified_user',
      permission: 'FINDING_ASSESSMENT',
      optionsQuery: ALL_ASSESSMENT,
    },
  ],
  // The quantities under a quantity, and the ones it sits under
  // (bill_headers_settings_quantities_connections). The backend refuses a link
  // between records that differ on setting, person, financial year, started
  // day, deadline or bill creation day — across the whole chain — and one that
  // would close a loop.
  BillHeadersSettingQuantity: [
    {
      entity: 'BillHeadersSettingQuantityConnection',
      byOwnerQuery: 'billHeadersSettingQuantityConnectionsByParent',
      ownerArg: 'parentUid',
      targetArg: 'childUid',
      field: 'child',
      label: 'Child Quantity',
      pluralLabel: 'Child Quantities',
      icon: 'numbers',
      permission: 'BILL_HEADERS_SETTING_QUANTITY_CONNECTION',
      optionsQuery: ALL_BILL_HEADERS_SETTING_QUANTITY,
      targetGqlFields: quantitySideGqlFields,
      columns: [
        'index',
        'child.assignedNumber as Assigned Number',
        'child.name as Quantity Record',
        'child.quantities as Quantity',
        'actions',
      ],
    },
    {
      entity: 'BillHeadersSettingQuantityConnection',
      byOwnerQuery: 'billHeadersSettingQuantityConnectionsByChild',
      ownerArg: 'childUid',
      targetArg: 'parentUid',
      field: 'parent',
      label: 'Parent Quantity',
      pluralLabel: 'Parent Quantities',
      icon: 'numbers',
      permission: 'BILL_HEADERS_SETTING_QUANTITY_CONNECTION',
      optionsQuery: ALL_BILL_HEADERS_SETTING_QUANTITY,
      targetGqlFields: quantitySideGqlFields,
      columns: [
        'index',
        'parent.assignedNumber as Assigned Number',
        'parent.name as Quantity Record',
        'parent.quantities as Quantity',
        'actions',
      ],
    },
  ],
  // The centres under a centre, and the ones it sits under (centers_centers).
  // One table read from each end: the same link mutation serves both, with the
  // centre on screen as the parent in one panel and the child in the other.
  Center: [
    {
      entity: 'CenterConnection',
      byOwnerQuery: 'centerConnectionsByParent',
      ownerArg: 'parentUid',
      targetArg: 'childUid',
      field: 'child',
      label: 'Child Centre',
      pluralLabel: 'Child Centres',
      icon: 'institution',
      permission: 'CENTER_CONNECTION',
      optionsQuery: ALL_CENTER,
      targetGqlFields: `
    id
    uid: id
    assignedNumber
    name
    hierarchy
  `,
      columns: [
        'index',
        'child.assignedNumber as Assigned Number',
        'child.name as Centre',
        'child.hierarchy as Level',
        'actions',
      ],
    },
    {
      entity: 'CenterConnection',
      byOwnerQuery: 'centerConnectionsByChild',
      ownerArg: 'childUid',
      targetArg: 'parentUid',
      field: 'parent',
      label: 'Parent Centre',
      pluralLabel: 'Parent Centres',
      icon: 'institution',
      permission: 'CENTER_CONNECTION',
      optionsQuery: ALL_CENTER,
      targetGqlFields: `
    id
    uid: id
    assignedNumber
    name
    hierarchy
  `,
      columns: [
        'index',
        'parent.assignedNumber as Assigned Number',
        'parent.name as Centre',
        'parent.hierarchy as Level',
        'actions',
      ],
    },
  ],
  // The down payments under a down payment, and the ones it sits under
  // (down_payments_down_payments) — one table read from each end, as for
  // centres. Then the units it is for (down_payments_units), where the join row
  // also names the person who pays.
  DownPayment: [
    {
      entity: 'DownPaymentConnection',
      byOwnerQuery: 'downPaymentConnectionsByParent',
      ownerArg: 'parentUid',
      targetArg: 'childUid',
      field: 'child',
      label: 'Child Down Payment',
      pluralLabel: 'Child Down Payments',
      icon: 'money',
      permission: 'DOWN_PAYMENT_CONNECTION',
      optionsQuery: ALL_DOWN_PAYMENT,
    },
    {
      entity: 'DownPaymentConnection',
      byOwnerQuery: 'downPaymentConnectionsByChild',
      ownerArg: 'childUid',
      targetArg: 'parentUid',
      field: 'parent',
      label: 'Parent Down Payment',
      pluralLabel: 'Parent Down Payments',
      icon: 'money',
      permission: 'DOWN_PAYMENT_CONNECTION',
      optionsQuery: ALL_DOWN_PAYMENT,
    },
    {
      entity: 'DownPaymentUnit',
      byOwnerQuery: 'downPaymentUnitsByDownPayment',
      ownerArg: 'downPaymentUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'DOWN_PAYMENT_UNIT',
      optionsQuery: ALL_UNIT,
      columns: [
        'index',
        'unit.assignedNumber as Assigned Number',
        'unit.name as Unit',
        'bioData.name as Paid By',
        'actions',
      ],
      // NOT NULL on the join row, so the link form has to ask for it. A unit
      // appears once under a down payment, so it carries one person there.
      extraFields: [
        {
          arg: 'bioDataUid',
          rowField: 'bioData',
          rowGqlFields: 'id\nname',
          field: {
            label: 'Paid By',
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'name',
              valueKey: 'id',
              fetchParameter: { query: ALL_BIO_DATA },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        },
      ],
    },
  ],
  // As for a down payment: the installments under an installment and the ones
  // it sits under (installments_installments), then the units it is for
  // (installments_units), where the join row also names the person who pays.
  Installment: [
    {
      entity: 'InstallmentConnection',
      byOwnerQuery: 'installmentConnectionsByParent',
      ownerArg: 'parentUid',
      targetArg: 'childUid',
      field: 'child',
      label: 'Child Installment',
      pluralLabel: 'Child Installments',
      icon: 'money',
      permission: 'INSTALLMENT_CONNECTION',
      optionsQuery: ALL_INSTALLMENT,
    },
    {
      entity: 'InstallmentConnection',
      byOwnerQuery: 'installmentConnectionsByChild',
      ownerArg: 'childUid',
      targetArg: 'parentUid',
      field: 'parent',
      label: 'Parent Installment',
      pluralLabel: 'Parent Installments',
      icon: 'money',
      permission: 'INSTALLMENT_CONNECTION',
      optionsQuery: ALL_INSTALLMENT,
    },
    {
      entity: 'InstallmentUnit',
      byOwnerQuery: 'installmentUnitsByInstallment',
      ownerArg: 'installmentUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'INSTALLMENT_UNIT',
      optionsQuery: ALL_UNIT,
      columns: [
        'index',
        'unit.assignedNumber as Assigned Number',
        'unit.name as Unit',
        'bioData.name as Paid By',
        'actions',
      ],
      // NOT NULL on the join row, so the link form has to ask for it. A unit
      // appears once under an installment, so it carries one person there.
      extraFields: [
        {
          arg: 'bioDataUid',
          rowField: 'bioData',
          rowGqlFields: 'id\nname',
          field: {
            label: 'Paid By',
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'name',
              valueKey: 'id',
              fetchParameter: { query: ALL_BIO_DATA },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        },
      ],
    },
  ],
  Agreement: [
    // The wording this agreement is written with, one panel per level
    // (agreements_sections_values, agreements_clauses_values,
    // agreements_sub_clauses_values, agreements_sub_subclauses_values). Wording
    // shared by every agreement, the GCC for one, is linked to each that uses it.
    {
      entity: 'AgreementSectionValue',
      byOwnerQuery: 'agreementSectionValuesByAgreement',
      ownerArg: 'agreementUid',
      targetArg: 'sectionValueUid',
      field: 'sectionValue',
      label: 'Section Wording',
      pluralLabel: 'Section Wordings',
      icon: 'folder',
      permission: 'AGREEMENT_SECTION_VALUE',
      optionsQuery: ALL_SECTION_VALUE,
    },
    {
      entity: 'AgreementClauseValue',
      byOwnerQuery: 'agreementClauseValuesByAgreement',
      ownerArg: 'agreementUid',
      targetArg: 'clauseValueUid',
      field: 'clauseValue',
      label: 'Clause Wording',
      pluralLabel: 'Clause Wordings',
      icon: 'notes',
      permission: 'AGREEMENT_CLAUSE_VALUE',
      optionsQuery: ALL_CLAUSE_VALUE,
    },
    {
      entity: 'AgreementSubClauseValue',
      byOwnerQuery: 'agreementSubClauseValuesByAgreement',
      ownerArg: 'agreementUid',
      targetArg: 'subClauseValueUid',
      field: 'subClauseValue',
      label: 'Sub-clause Wording',
      pluralLabel: 'Sub-clause Wordings',
      icon: 'notes',
      permission: 'AGREEMENT_SUB_CLAUSE_VALUE',
      optionsQuery: ALL_SUB_CLAUSE_VALUE,
    },
    {
      entity: 'AgreementSubSubclauseValue',
      byOwnerQuery: 'agreementSubSubclauseValuesByAgreement',
      ownerArg: 'agreementUid',
      targetArg: 'subSubclauseValueUid',
      field: 'subSubclauseValue',
      label: 'Sub-subclause Wording',
      pluralLabel: 'Sub-subclause Wordings',
      icon: 'notes',
      permission: 'AGREEMENT_SUB_SUBCLAUSE_VALUE',
      optionsQuery: ALL_SUB_SUBCLAUSE_VALUE,
    },
    // One agreement under another -- agreements_agreements. The same table
    // read from each end: what follows this agreement, and what it follows.
    {
      entity: 'AgreementConnection',
      byOwnerQuery: 'agreementConnectionsByParent',
      ownerArg: 'parentUid',
      targetArg: 'childUid',
      field: 'child',
      label: 'Child Agreement',
      pluralLabel: 'Child Agreements',
      icon: 'list',
      permission: 'AGREEMENT_CONNECTION',
      optionsQuery: ALL_AGREEMENT,
    },
    {
      entity: 'AgreementConnection',
      byOwnerQuery: 'agreementConnectionsByChild',
      ownerArg: 'childUid',
      targetArg: 'parentUid',
      field: 'parent',
      label: 'Parent Agreement',
      pluralLabel: 'Parent Agreements',
      icon: 'list',
      permission: 'AGREEMENT_CONNECTION',
      optionsQuery: ALL_AGREEMENT,
    },
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
    // The people and the organisations on the account
    // (bank_accounts_bio_data, bank_accounts_business_names).
    {
      entity: 'BankAccountBioData',
      byOwnerQuery: 'bankAccountBioDataByBankAccount',
      ownerArg: 'bankAccountUid',
      targetArg: 'bioDataUid',
      field: 'bioData',
      label: 'Person',
      pluralLabel: 'People',
      icon: 'person',
      permission: 'BANK_ACCOUNT_BIO_DATA',
      optionsQuery: ALL_BIO_DATA,
      targetGqlFields: `
    id
    uid: id
    name
  `,
      columns: ['index', 'bioData.name as Person', 'actions'],
    },
    {
      entity: 'BankAccountBusinessName',
      byOwnerQuery: 'bankAccountBusinessNamesByBankAccount',
      ownerArg: 'bankAccountUid',
      targetArg: 'businessNameUid',
      field: 'businessName',
      label: 'Organisation',
      pluralLabel: 'Organisations',
      icon: 'business',
      permission: 'BANK_ACCOUNT_BUSINESS_NAME',
      optionsQuery: ALL_BUSINESS_NAME,
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
    // The assessments a person is on (bio_data_assessments).
    {
      entity: 'BioDataAssessment',
      byOwnerQuery: 'bioDataAssessmentsByBioData',
      ownerArg: 'bioDataUid',
      targetArg: 'assessmentUid',
      field: 'assessment',
      label: 'Assessment',
      pluralLabel: 'Assessments',
      icon: 'verified_user',
      permission: 'BIO_DATA_ASSESSMENT',
      optionsQuery: ALL_ASSESSMENT,
    },
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
    checklistsPanel('BooleanParameter'),
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
    // The districts it serves (collection_centers_districts).
    {
      ...COLLECTION_CENTER_DISTRICT,
      byOwnerQuery: 'collectionCenterDistrictsByCollectionCenter',
      field: 'district',
      label: 'District',
      pluralLabel: 'Districts',
      icon: 'location',
      optionsQuery: ALL_DISTRICT,
    },
  ],

  // The collection centres serving a district, read from the district's side.
  District: [
    {
      ...COLLECTION_CENTER_DISTRICT,
      byOwnerQuery: 'collectionCenterDistrictsByDistrict',
      ownerArg: 'districtUid',
      targetArg: 'collectionCenterUid',
      field: 'collectionCenter',
      label: 'Collection Center',
      pluralLabel: 'Collection Centers',
      icon: 'location',
      optionsQuery: ALL_COLLECTION_CENTER,
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
    // Which exit this entry ended with (entries_exits).
    {
      entity: 'EntryExit',
      byOwnerQuery: 'entryExitsByEntry',
      ownerArg: 'entryUid',
      targetArg: 'exitUid',
      field: 'exit',
      label: 'Exit',
      pluralLabel: 'Exits',
      icon: 'logout',
      permission: 'ENTRY_EXIT',
      optionsQuery: ALL_EXIT,
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
    // Which entry this exit ended (entries_exits).
    {
      entity: 'EntryExit',
      byOwnerQuery: 'entryExitsByExit',
      ownerArg: 'exitUid',
      targetArg: 'entryUid',
      field: 'entry',
      label: 'Entry',
      pluralLabel: 'Entries',
      icon: 'login',
      permission: 'ENTRY_EXIT',
      optionsQuery: ALL_ENTRY,
    },
  ],
  Fee: [
    // The accounts a fee is under (accounts_fees), read from the fee's side.
    {
      entity: 'AccountFee',
      byOwnerQuery: 'accountFeesByFee',
      ownerArg: 'feeUid',
      targetArg: 'accountUid',
      field: 'account',
      label: 'Account',
      pluralLabel: 'Accounts',
      icon: 'wallet',
      permission: 'ACCOUNT_FEE',
      optionsQuery: ALL_ACCOUNT,
    },
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
  SpCode: [
    {
      entity: 'ProjectSpCode',
      byOwnerQuery: 'projectSpCodesBySpCode',
      ownerArg: 'spCodeUid',
      targetArg: 'projectUid',
      field: 'project',
      label: 'Project',
      pluralLabel: 'Projects',
      icon: 'suitcase',
      permission: 'PROJECT_SP_CODE',
      optionsQuery: ALL_REGISTRY_PROJECT,
    },
    {
      entity: 'UnitSpCode',
      byOwnerQuery: 'unitSpCodesBySpCode',
      ownerArg: 'spCodeUid',
      targetArg: 'unitUid',
      field: 'unit',
      label: 'Unit',
      pluralLabel: 'Units',
      icon: 'domain',
      permission: 'UNIT_SP_CODE',
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
    officerLink('InspectionBioData', 'inspectionUid', 'INSPECTION_BIO_DATA'),
    // The checklists it is on (checklists_inspections).
    checklistsPanel('Inspection'),
    // What the inspection belongs to and looks at, then what it records and
    // comes to — one two-key join table each (inspections_assessments,
    // inspections_objectsid, inspections_observations, inspections_findings,
    // inspections_judgments).
    {
      entity: 'InspectionAssessment',
      byOwnerQuery: 'inspectionAssessmentsByInspection',
      ownerArg: 'inspectionUid',
      targetArg: 'assessmentUid',
      field: 'assessment',
      label: 'Assessment',
      pluralLabel: 'Assessments',
      icon: 'verified_user',
      permission: 'INSPECTION_ASSESSMENT',
      optionsQuery: ALL_ASSESSMENT,
    },
    {
      entity: 'InspectionObjectsId',
      byOwnerQuery: 'inspectionObjectsIdsByInspection',
      ownerArg: 'inspectionUid',
      targetArg: 'objectsIdUid',
      field: 'objectsId',
      label: 'Object',
      pluralLabel: 'Objects',
      icon: 'institution',
      permission: 'INSPECTION_OBJECTS_ID',
      optionsQuery: ALL_OBJECT,
    },
    {
      entity: 'InspectionObservation',
      byOwnerQuery: 'inspectionObservationsByInspection',
      ownerArg: 'inspectionUid',
      targetArg: 'observationUid',
      field: 'observation',
      label: 'Observation',
      pluralLabel: 'Observations',
      icon: 'view',
      permission: 'INSPECTION_OBSERVATION',
      optionsQuery: ALL_OBSERVATION,
    },
    {
      entity: 'InspectionFinding',
      byOwnerQuery: 'inspectionFindingsByInspection',
      ownerArg: 'inspectionUid',
      targetArg: 'findingUid',
      field: 'finding',
      label: 'Finding',
      pluralLabel: 'Findings',
      icon: 'list',
      permission: 'INSPECTION_FINDING',
      optionsQuery: ALL_FINDING,
    },
    {
      entity: 'InspectionJudgment',
      byOwnerQuery: 'inspectionJudgmentsByInspection',
      ownerArg: 'inspectionUid',
      targetArg: 'judgmentUid',
      field: 'judgment',
      label: 'Judgment',
      pluralLabel: 'Judgments',
      icon: 'verified_user',
      permission: 'INSPECTION_JUDGMENT',
      optionsQuery: ALL_JUDGMENT,
    },
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
    // The bill setting a penalty line is to be raised from
    // (bill_headers_settings_penalties). Nothing raises one yet.
    {
      entity: 'BillHeadersSettingPenalty',
      byOwnerQuery: 'billHeadersSettingPenaltiesByPenalty',
      ownerArg: 'penaltyUid',
      targetArg: 'billHeadersSettingUid',
      field: 'billHeadersSetting',
      label: 'Bill Setting',
      pluralLabel: 'Bill Settings',
      icon: 'bill',
      permission: 'BILL_HEADERS_SETTING_PENALTY',
      optionsQuery: ALL_BILL_HEADERS_SETTING,
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
    checklistsPanel('QualitativeParameter'),
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
    checklistsPanel('QuantitativeParameter'),
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
      entity: 'AssetMasterPlan',
      byOwnerQuery: 'assetMasterPlansByMasterPlan',
      ownerArg: 'masterPlanUid',
      targetArg: 'assetUid',
      field: 'asset',
      label: 'Asset',
      pluralLabel: 'Assets',
      icon: 'suitcase',
      permission: 'ASSET_MASTER_PLAN',
      optionsQuery: ALL_ASSET,
    },
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
    // The expenses and the bill headers that belong to a project
    // (projects_expenses, projects_bill_headers).
    {
      entity: 'ProjectExpense',
      byOwnerQuery: 'projectExpensesByProject',
      ownerArg: 'projectUid',
      targetArg: 'expenseUid',
      field: 'expense',
      label: 'Expense',
      pluralLabel: 'Expenses',
      icon: 'coins',
      permission: 'PROJECT_EXPENSE',
      optionsQuery: ALL_EXPENSE,
    },
    {
      entity: 'ProjectBillHeader',
      byOwnerQuery: 'projectBillHeadersByProject',
      ownerArg: 'projectUid',
      targetArg: 'billHeaderUid',
      field: 'billHeader',
      label: 'Bill Header',
      pluralLabel: 'Bill Headers',
      icon: 'bill',
      permission: 'PROJECT_BILL_HEADER',
      optionsQuery: ALL_BILL_HEADER,
    },
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
/** The link configs behind {@link recordLinkPanels}, for a "Link to…" menu. */
export const recordLinkConfigs = (record: string): EntityLinkConfig[] =>
  LINKS_BY_RECORD[record] ?? [];

export const recordLinkPanels = (
  comp: BaseComponent,
  record: string,
  uid?: string,
): ContentParameter[] => {
  const configs = LINKS_BY_RECORD[record];
  return configs ? entityLinkPanels(comp, configs, uid) : [];
};

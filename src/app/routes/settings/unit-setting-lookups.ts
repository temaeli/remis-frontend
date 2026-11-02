import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  defineLookup,
  entityLinkPanels,
  lookupChildGqlFields,
  lookupChildPanel,
  Lookup,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  recordLinkPanels,
  unitLinkConfigs,
  unitLinkPanelsOf,
} from '@routes/unit-management/unit-links';
import { unitActions } from '@routes/unit-management/unit-actions';
import { UnitSummaryComponent } from '@routes/unit-management/unit-summary.component';
import { coreAttachmentPanels } from './attachment-lookups';
import { FLOOR } from './project-setting-lookups';
import { UNIT_PROCESS_LINK } from './grade-process-links';
import { unitLocksPanel } from './unit-locks';
import { unitStatusHistoryPanel } from './status-history';

/**
 * The unit's own configuration — `modules.setting.unit` on the backend, paired
 * with `modules.unit` the same way `setting.project` is paired with `project`.
 *
 * The unit itself is here, being the catalogue row the whole module hangs off,
 * together with the rates and catalogues it is charged and judged against. None
 * of them records that anything happened; the records of a unit's life are the
 * unit management module's screens.
 *
 * Kept out of the project settings even though a unit sits on a floor: a floor is
 * a building's, and the project owns it. The unit's link to it is a select, not a
 * reason to file the unit under the project.
 *
 * Every field below is `@NotBlank` or `@NotNull` on its DTO, which SPQR publishes
 * as a non-null input field, so the forms mirror the DTOs exactly.
 */

/** A required number. Left to the grid's own columns rather than spanning a row. */
const numberField = (key: string, label: string): FieldConfig => ({
  key,
  label,
  type: FieldType.input,
  inputType: 'number',
  validations: [VALIDATOR_REQUIRED],
});

/**
 * How many fractional digits the unit areas keep, matching the
 * `numeric(15,4)` and `numeric(30,4)` columns behind them. The component
 * defaults to two, which would round a fourth digit away on the way in.
 */
const UNIT_AREA_DECIMALS = 4;

/**
 * A required decimal, keeping `decimals` fractional digits.
 *
 * The input component rounds to two when `decimals` is not given, which is
 * fewer than any of these columns hold: the unit areas are `numeric(15,4)` and
 * `numeric(30,4)`, so each one says four explicitly.
 *
 * A unit share is the exception: it is a fraction of the whole property, so the
 * part that distinguishes one share from another sits far to the right of the
 * point. Rounding 0.9999999999 to two digits sends 1, which is a different
 * share, and the backend rejects it against the share it computed. Ten digits
 * is what that check expects, so ten is what the form keeps.
 */
const decimalField = (
  key: string,
  label: string,
  hint?: string,
  decimals?: number,
): FieldConfig => ({
  key,
  label,
  hint,
  decimals,
  type: FieldType.decimal,
  validations: [VALIDATOR_REQUIRED],
});

/** The survey point the located tables all carry. */
const coordinateFields = (): FieldConfig[] => [
  numberField('latitude', 'Latitude'),
  numberField('longitude', 'Longitude'),
];

const coordinateGqlFields = `
  latitude
  longitude
`;

/** A select over another table, all of which key on `id`. */
const refSelect = (key: string, label: string, query: unknown): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query },
  },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

export const UNIT = defineLookup({
  slug: 'units',
  entity: 'Unit',
  entityPlural: 'Units',
  permission: 'UNIT',
  label: 'Unit',
  pluralLabel: 'Units',
  subtitle: 'The lettable spaces a floor is divided into',
  icon: 'domain',
  extraGqlFields: `
  area
  netArea
  grossArea
  ${coordinateGqlFields}
  floor {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    decimalField('area', 'Area', undefined, UNIT_AREA_DECIMALS),
    // Enforced on save: the units of a floor may not between them claim more
    // net area than the floor has.
    decimalField(
      'netArea',
      'Net Area',
      'Together with the other units on the floor, must fit within the floor area',
      UNIT_AREA_DECIMALS,
    ),
    decimalField('grossArea', 'Gross Area', 'Not less than the net area', UNIT_AREA_DECIMALS),
    ...coordinateFields(),
    refSelect('floorUid', 'Floor', FLOOR.gql.all),
  ],
  // The overview the summary and the tabs read. Computed per unit on the
  // backend, so only the unit's own page asks for it.
  detailGqlFields: `
  linkedKinds
  floor {
    ${lookupRefGqlFields}
    asset { id name }
  }
  currentStatus { id status createdAt }
  latestStatusChange { id status since }
  recentActivity { kind uid name at }
`,
  summary: UnitSummaryComponent,
  // No status: `units` no longer carries one. The statuses a unit has taken are
  // Unit Status Records, under Unit Management.
  extraColumns: ['area', 'netArea as Net', 'grossArea as Gross', 'floor.name as Floor'],
  toModel: (data) => ({ floorUid: data?.floor?.id }),
  // Reserve, book, lease, inspect and the rest, from the unit itself: one short
  // form each, saved and linked to the unit in one go.
  extraActions: (comp, lookup) => unitActions(comp, lookup),
  /**
   * Grouped so the page reads as a few questions rather than sixty panels: who
   * has it (Occupancy), how it is kept (Care), how a tenancy ends (Closing),
   * what it earns and costs (Money), where it stands (Status), how it is set up
   * (Setup), its papers (Documents), and what else it is tied to (Links).
   *
   * Only what the unit has is shown: a kind of record gets its panel once there
   * is one — new ones come through the header's buttons — and a group with
   * nothing in it is left out. Status, Setup and Documents always show.
   */
  extraContents: (comp, record) => unitTabs(comp, record),
});

/** Every unit link kind is in exactly one group; Links takes what the others do not. */
const UNIT_TAB_GROUPS: { name: string; icon: string; kinds: string[] }[] = [
  {
    name: 'Occupancy',
    icon: 'key',
    kinds: [
      'UnitReservation',
      'UnitBooking',
      'UnitLease',
      'UnitHandover',
      'UnitEntry',
      'UnitExit',
      'UnitReturn',
      'UnitAgreement',
      'UnitBioData',
      'UnitBusinessName',
    ],
  },
  {
    name: 'Care',
    icon: 'build',
    kinds: [
      'UnitInspection',
      'UnitMaintenance',
      'UnitProblem',
      'UnitVisit',
      'UnitMeter',
      'UnitConnection',
      'UnitDisconnection',
      'UnitServiceOffering',
    ],
  },
  {
    name: 'Closing',
    icon: 'gavel',
    kinds: ['UnitNotice', 'UnitNoticeDay', 'UnitTermination', 'UnitEviction'],
  },
  {
    name: 'Money',
    icon: 'payments',
    kinds: [
      'UnitSell',
      'UnitPurchase',
      'UnitValuation',
      'UnitRent',
      'UnitRentBillingCycle',
      'UnitFee',
      'UnitCharge',
      'UnitDiscount',
      'UnitPenalty',
      'SecurityDepositUnit',
      'UnitBillHeader',
      'UnitBillPayOption',
      'UnitGracePeriodBillHeadersSetting',
      'UnitCost',
      'UnitExpense',
      'UnitCommission',
      'UnitLiability',
      'UnitLoan',
      'UnitBankAccount',
      'UnitGfsCode',
      'UnitSpCode',
      'UnitCollectionCenter',
    ],
  },
];

/** A tab that holds other tabs. */
const tabGroup = (name: string, icon: string, children: ContentParameter[]): ContentParameter => ({
  name,
  label: name,
  icon,
  children,
});

function unitTabs(comp: BaseComponent, record?: Lookup): ContentParameter[] {
  const unitUid: string | undefined = record?.id;
  const linked: string[] = record?.['linkedKinds'] ?? [];
  const has = (kind: string) => linked.includes(kind);

  const grouped = new Set(UNIT_TAB_GROUPS.flatMap((g) => g.kinds));
  const groups = UNIT_TAB_GROUPS.map((g) => ({
    ...g,
    panels: unitLinkPanelsOf(comp, unitUid, g.kinds.filter(has)),
  })).filter((g) => g.panels.length);

  const otherKinds = [
    ...new Set(
      unitLinkConfigs()
        .map((config) => config.entity)
        .filter((kind) => !grouped.has(kind) && has(kind)),
    ),
  ];
  const links = [
    ...unitLinkPanelsOf(comp, unitUid, otherKinds),
    ...(has('UnitProcess') ? entityLinkPanels(comp, [UNIT_PROCESS_LINK], unitUid) : []),
  ];

  return [
    ...groups.map((g) => tabGroup(g.name, g.icon, g.panels)),
    // The statuses the unit has taken, and since when (units_statusesid).
    tabGroup('Status', 'history', [unitStatusHistoryPanel(comp, unitUid)]),
    tabGroup('Setup', 'tune', [
      // The share of the common property, a row in its own table rather than
      // a field on the unit. Add fills the unit in already.
      lookupChildPanel(
        comp,
        () => UNIT_SHARE,
        UNIT_SHARES_BY_UNIT,
        { unitUid },
        {
          keyColumns: ['index', 'assignedNumber', 'name', 'unitShares as Share', 'actions'],
          presetModel: { unitUid },
        },
      ),
      // Locking the unit for a while (units_locks), for as long as a chosen
      // Unit Lock Duration says.
      unitLocksPanel(comp, unitUid),
    ]),
    tabGroup('Documents', 'attachment', coreAttachmentPanels(comp, 'unit', unitUid)),
    ...(links.length ? [tabGroup('Links', 'link', links)] : []),
  ];
}

/**
 * A unit's share of the common property.
 *
 * A screen of its own because the share is a table of its own —
 * `remis_core_schema.unit_shares`, keyed by `units_id`. It is not a column on
 * the unit, and mapping it as one stopped the backend booting.
 *
 * The share is left off the form on purpose. The database accepts exactly one
 * figure, `unit.net_area` over the floor hierarchy's denominator to four
 * places, and refuses anything else; the backend fills that figure in when the
 * field is empty. It is shown as a column so it can be read.
 */
export const UNIT_SHARE = defineLookup({
  slug: 'unit-shares',
  entity: 'UnitShare',
  entityPlural: 'UnitShares',
  permission: 'UNIT_SHARE',
  label: 'Unit Share',
  pluralLabel: 'Unit Shares',
  subtitle: 'What each unit holds of the common property',
  icon: 'pie_chart',
  extraGqlFields: `
  unitShares
  unit {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    refSelect('unitUid', 'Unit', UNIT.gql.all),
    {
      key: 'unitShares',
      label: 'Unit Shares',
      hint: 'Leave empty to use the share the floor hierarchy gives: net area over the hierarchy total. Any other figure is refused.',
      decimals: 6,
      type: FieldType.decimal,
    },
  ],
  extraColumns: ['unit.name as Unit', 'unitShares as Share'],
  toModel: (data) => ({ unitUid: data?.unit?.id }),
});

/** One unit's share, for the panel on the unit's own page. */
const UNIT_SHARES_BY_UNIT = gql`
  query unitSharesByUnit($unitUid: String) {
    unitSharesByUnit(unitUid: $unitUid) {
      ${lookupChildGqlFields}
      unitShares
    }
  }
`;

/*
 * What a unit is charged and judged against. Rates and catalogues, not records:
 * none of them says anything happened, so they are configuration and belong here
 * rather than among the unit module's own screens.
 *
 * The rate tables all carry a `minimum` / `maximum` pair whose CHECK bounds in
 * the database are a latitude and a longitude copied from the coordinate
 * template, so neither can exceed 90 and 180 respectively. The forms mirror the
 * database rather than what the columns ought to hold — see the backend entities.
 */
export const RENT = defineLookup({
  slug: 'rents',
  entity: 'Rent',
  entityPlural: 'Rents',
  permission: 'RENT',
  label: 'Rent',
  pluralLabel: 'Rents',
  subtitle: 'The rent set on a unit',
  icon: 'home',
  extraGqlFields: `
  rentAmount
  minimum
  maximum
  rentStartedAt
`,
  extraFields: [
    numberField('rentAmount', 'Rent amount'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
    {
      key: 'rentStartedAt',
      label: 'Rent started at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    'rentAmount',
    'minimum',
    'maximum',
    { field: 'rentStartedAt', header: 'Rent started at' },
  ],
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Rent', record?.id),
});

export const COMMISSION = defineLookup({
  slug: 'commissions',
  entity: 'Commission',
  entityPlural: 'Commissions',
  permission: 'COMMISSION',
  label: 'Commission',
  pluralLabel: 'Commissions',
  subtitle: 'What is charged for placing a unit',
  icon: 'money',
  extraGqlFields: `
  commission
  maximum
  minimum
`,
  extraFields: [
    numberField('commission', 'Commission'),
    numberField('maximum', 'Maximum'),
    numberField('minimum', 'Minimum'),
  ],
  extraColumns: ['commission', 'maximum', 'minimum'],
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Commission', record?.id),
});

export const PENALTY = defineLookup({
  slug: 'penalties',
  entity: 'Penalty',
  entityPlural: 'Penalties',
  permission: 'PENALTY',
  label: 'Penalty',
  pluralLabel: 'Penalties',
  subtitle: 'Penalties charged on a unit',
  icon: 'warning',
  extraGqlFields: `
  penalties
  minimum
  maximum
  taxesType
`,
  extraFields: [
    // Decimals, not whole numbers: the columns are `numeric(15,2)` and
    // `numeric(9,6)`. A whole-number input refused 0.31 outright. Each control
    // keeps as many places as its column does, so what is typed is what is
    // stored rather than something the database rounds afterwards.
    {
      key: 'penalties',
      label: 'Penalties',
      hint: 'Decimals allowed, to 2 places',
      type: FieldType.decimal,
      decimals: 2,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'minimum',
      label: 'Minimum',
      hint: 'Decimals allowed, to 6 places. Between -90 and 90',
      type: FieldType.decimal,
      decimals: 6,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'maximum',
      label: 'Maximum',
      hint: 'Decimals allowed, to 6 places. Between -180 and 180',
      type: FieldType.decimal,
      decimals: 6,
      validations: [VALIDATOR_REQUIRED],
    },
    // The eight `taxes_types`. Increase and decrease say which way a figure
    // moves what is owed; the six after them are held for calculations the DBA
    // has yet to describe. A penalty adds, so that is what a new one starts as.
    {
      key: 'taxesType',
      label: 'Type',
      hint: 'How the penalty is applied. Increase adds it to what is owed',
      type: FieldType.select,
      value: 'INCREASE',
      options: [
        { value: 'INCREASE', label: 'Increase' },
        { value: 'DECREASE', label: 'Decrease' },
        { value: 'ADDITION', label: 'Addition' },
        { value: 'SUBTRACTION', label: 'Subtraction' },
        { value: 'MULTIPLICATION', label: 'Multiplication' },
        { value: 'DIVISION', label: 'Division' },
        { value: 'MODULUS', label: 'Modulus' },
        { value: 'EXPONENTIATION', label: 'Exponentiation' },
      ],
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: ['penalties', 'minimum', 'maximum', { field: 'taxesType', header: 'Type' }],
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Penalty', record?.id),
});

export const SECURITY_DEPOSIT = defineLookup({
  slug: 'security-deposits',
  entity: 'SecurityDeposit',
  entityPlural: 'SecurityDeposits',
  permission: 'SECURITY_DEPOSIT',
  label: 'Security Deposit',
  pluralLabel: 'Security Deposits',
  subtitle: 'Deposits held against a unit',
  icon: 'account_balance',
  extraGqlFields: `
  securityDeposits
  minimum
  maximum
`,
  extraFields: [
    numberField('securityDeposits', 'Security deposits'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
  ],
  extraColumns: ['securityDeposits', 'minimum', 'maximum'],
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'SecurityDeposit', record?.id),
});

export const SOLUTION = defineLookup({
  slug: 'solutions',
  entity: 'Solution',
  entityPlural: 'Solutions',
  permission: 'SOLUTION',
  label: 'Solution',
  pluralLabel: 'Solutions',
  subtitle: 'Remedies that can be applied to a problem',
  icon: 'highlight',
  extraGqlFields: `

`,
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Solution', record?.id),
});

export const NOTICE_DAY = defineLookup({
  slug: 'notice-days',
  entity: 'NoticeDay',
  entityPlural: 'NoticeDays',
  permission: 'NOTICE_DAY',
  label: 'Notice Period',
  pluralLabel: 'Notice Periods',
  subtitle: "How many days' notice a unit requires",
  icon: 'event',
  // Stored as numeric(15,2), so it admits fractional days.
  extraGqlFields: `
  noticeDays
  ${coordinateGqlFields}
`,
  extraFields: [numberField('noticeDays', 'Notice Days'), ...coordinateFields()],
  extraColumns: ['noticeDays'],
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'NoticeDay', record?.id),
});

export const RENT_BILLING_CYCLE = defineLookup({
  slug: 'rent-billing-cycles',
  entity: 'RentBillingCycle',
  entityPlural: 'RentBillingCycles',
  permission: 'RENT_BILLING_CYCLE',
  label: 'Rent Billing Cycle',
  pluralLabel: 'Rent Billing Cycles',
  subtitle: 'The days of the month rent is raised on',
  icon: 'calendar_today',
  // The database constrains neither day. 1..31 is enforced by the application
  // only, and days 29-31 do not exist in every month — the billing job decides
  // whether to clamp to the month end or skip.
  extraGqlFields: `
  firstStartDay
  secondStartDay
`,
  extraFields: [
    numberField('firstStartDay', 'First Start Day'),
    numberField('secondStartDay', 'Second Start Day'),
  ],
  extraColumns: ['firstStartDay as First', 'secondStartDay as Second'],
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'RentBillingCycle', record?.id),
});

export const RESERVATION_MINUTE = defineLookup({
  slug: 'reservation-minutes',
  entity: 'ReservationMinute',
  entityPlural: 'ReservationMinutes',
  permission: 'RESERVATION_MINUTE',
  label: 'Reservation Minute',
  pluralLabel: 'Reservation Minutes',
  subtitle: 'How long a reservation is held for',
  icon: 'timer',
  // minimum and maximum carry latitude/longitude CHECK bounds in the database,
  // so neither can exceed 90 and 180 respectively — see the backend entity.
  extraGqlFields: `
  reservationMinutes
  minimum
  maximum
`,
  extraFields: [
    numberField('reservationMinutes', 'Reservation Minutes'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
  ],
  extraColumns: ['reservationMinutes as Minutes', 'minimum', 'maximum'],
});

/** The unit first, then what it is charged and judged against. */
export const UNIT_SETTING_LOOKUPS: LookupModule[] = [
  UNIT,
  UNIT_SHARE,
  RENT,
  COMMISSION,
  PENALTY,
  SECURITY_DEPOSIT,
  SOLUTION,
  NOTICE_DAY,
  RENT_BILLING_CYCLE,
  RESERVATION_MINUTE,
];

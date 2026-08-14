import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { defineLookup, lookupRefGqlFields, LookupModule } from '@shared/lookup';
import { recordLinkPanels, unitLinkPanels } from '@routes/unit-management/unit-links';
import { FLOOR } from './project-setting-lookups';

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
  unitShares
  status
  ${coordinateGqlFields}
  floor {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    numberField('area', 'Area'),
    numberField('netArea', 'Net Area'),
    numberField('grossArea', 'Gross Area'),
    numberField('unitShares', 'Unit Shares'),
    ...coordinateFields(),
    refSelect('floorUid', 'Floor', FLOOR.gql.all),
    {
      key: 'status',
      label: 'Status',
      type: FieldType.select,
      // The labels of the PostgreSQL enum `units_statuses`. The backend's
      // UnitStatus documents them as assumed — the CREATE TYPE was never
      // supplied — so confirm them against the database before relying on this.
      options: [
        { value: 'AVAILABLE', label: 'Available' },
        { value: 'RESERVED', label: 'Reserved' },
        { value: 'SOLD', label: 'Sold' },
        { value: 'OCCUPIED', label: 'Occupied' },
        { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
      ],
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: ['area', 'netArea as Net', 'grossArea as Gross', 'floor.name as Floor', 'status'],
  toModel: (data) => ({ floorUid: data?.floor?.id }),
  // Everything a unit relates to hangs off its own join table with its own
  // link/unlink pair. One panel each, declared in the unit module so this file
  // does not have to know them.
  extraContents: (comp, record) => unitLinkPanels(comp, record?.id),
});

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
`,
  extraFields: [
    numberField('penalties', 'Penalties'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
  ],
  extraColumns: ['penalties', 'minimum', 'maximum'],
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
  RENT,
  COMMISSION,
  PENALTY,
  SECURITY_DEPOSIT,
  SOLUTION,
  NOTICE_DAY,
  RENT_BILLING_CYCLE,
  RESERVATION_MINUTE,
];

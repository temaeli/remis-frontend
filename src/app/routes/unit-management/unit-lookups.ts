import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  defineLookup,
  EntityLinkConfig,
  entityLinkPanels,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';

import { recordLinkPanels } from './unit-links';
import { MOVE_IN_FIELDS, MOVE_OUT_FIELDS } from '@routes/settings/inventory-lookups';
import { readingLinkPanels } from './reading-links';
import {
  checklistTypeColumn,
  checklistTypeField,
  DEFAULT_CHECKLIST_TYPE,
} from '@routes/settings/checklist-types';

/** Declared here rather than imported, as below: subcategories sit in settings. */
const ALL_SUBCATEGORIES = gql`
  query allSubcategories {
    allSubcategories {
      id
      name
    }
  }
`;

/** Declared here rather than imported: the inventory registry sits in settings. */
const ALL_INVENTORIES = gql`
  query allInventories {
    allInventories {
      id
      name
    }
  }
`;

/**
 * The inventory items handed over at a move-in, or checked at a move-out.
 *
 * The same rows the inventory's own page shows, read from this end. They carry
 * the person, the reference and the quantity either way -- every one of those
 * is NOT NULL, so this side has to ask for them too or the link is refused.
 */
const inventoryLink = (entity: 'InventoryEntry' | 'InventoryExit'): EntityLinkConfig => {
  const isEntry = entity === 'InventoryEntry';
  return {
    entity,
    byOwnerQuery: isEntry ? 'inventoryEntriesByEntry' : 'inventoryExitsByExit',
    ownerArg: isEntry ? 'entryUid' : 'exitUid',
    targetArg: 'inventoryUid',
    field: 'inventory',
    label: 'Inventory Item',
    pluralLabel: 'Inventory Items',
    icon: 'store',
    permission: isEntry ? 'INVENTORY_ENTRY' : 'INVENTORY_EXIT',
    optionsQuery: ALL_INVENTORIES,
    extraFields: isEntry ? MOVE_IN_FIELDS : MOVE_OUT_FIELDS,
  };
};

/**
 * The unit module — `modules.unit` on the backend. Everything that happens to a
 * lettable unit over its life: how it was taken and given up, what is charged
 * against it, what was done to it, and what it is connected to.
 *
 * The unit itself is not here. It is a `CoreNamedEntity` on the project settings
 * catalogue and stays there; these are the records that hang off it, each on its
 * own table with the same five-operation API, so they are declared as configs and
 * rendered by the shared lookup screens.
 *
 * The link tables that join these to a unit are panels on the unit's own detail
 * page — see `unit-links.ts`.
 *
 * Every field below is `@NotBlank` or `@NotNull` on its DTO, which SPQR publishes
 * as a non-null input field, so a form that omits one is rejected at variable
 * coercion before any message the DTO carries can be returned. The forms mirror
 * the DTOs exactly.
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

/**
 * A select over another table, all of which key on `id`. `labelKey` is the field
 * shown in the list — `name` for everything that has one, overridden where the
 * far side does not.
 */
const refSelect = (key: string, label: string, query: unknown, labelKey = 'name'): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey,
    valueKey: 'id',
    fetchParameter: { query },
  },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

const ALL_BIO_DATA = gql`
  query allBioData {
    allBioData {
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

const ALL_UNIT = gql`
  query allUnits {
    allUnits {
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

const ALL_SERVICE_CONNECTION = gql`
  query allServiceConnections {
    allServiceConnections {
      id
      name
    }
  }
`;

export const BOOKING = defineLookup({
  slug: 'bookings',
  entity: 'Booking',
  entityPlural: 'Bookings',
  permission: 'BOOKING',
  writtenName: true,
  label: 'Booking',
  pluralLabel: 'Bookings',
  subtitle: 'Holds placed on a unit before it is taken',
  icon: 'event_available',
  extraGqlFields: `
  value
  bookedAt
  bookedBy {
    id
    uid: id
    name
  }
`,
  extraFields: [
    numberField('value', 'Value'),
    {
      key: 'bookedAt',
      label: 'Booked at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('bookedByUid', 'Booked by', ALL_BIO_DATA),
  ],
  extraColumns: ['value', { field: 'bookedAt', header: 'Booked at' }, 'bookedBy.name as Booked by'],
  toModel: (data) => ({ bookedByUid: data?.bookedBy?.id }),
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Booking', record?.id),
});

export const ENTRY = defineLookup({
  slug: 'entries',
  entity: 'Entry',
  entityPlural: 'Entries',
  permission: 'ENTRY',
  writtenName: true,
  label: 'Entry',
  pluralLabel: 'Entries',
  subtitle: 'Move-ins recorded against a unit',
  icon: 'login',
  extraGqlFields: `
  enteredAt
`,
  extraFields: [
    {
      key: 'enteredAt',
      label: 'Entered at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [{ field: 'enteredAt', header: 'Entered at' }],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => [
    ...recordLinkPanels(comp, 'Entry', record?.id),
    ...entityLinkPanels(comp, [inventoryLink('InventoryEntry')], record?.id),
  ],
});

export const EVICTION = defineLookup({
  slug: 'evictions',
  entity: 'Eviction',
  entityPlural: 'Evictions',
  permission: 'EVICTION',
  writtenName: true,
  label: 'Eviction',
  pluralLabel: 'Evictions',
  subtitle: 'Evictions carried out, and what was owed',
  icon: 'gavel',
  extraGqlFields: `
  owed
  minimum
  maximum
  evictedAt
  evictedBy {
    id
    uid: id
    name
  }
`,
  extraFields: [
    numberField('owed', 'Owed'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
    {
      key: 'evictedAt',
      label: 'Evicted at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('evictedByUid', 'Evicted by', ALL_BIO_DATA),
  ],
  extraColumns: [
    'owed',
    'minimum',
    'maximum',
    { field: 'evictedAt', header: 'Evicted at' },
    'evictedBy.name as Evicted by',
  ],
  toModel: (data) => ({ evictedByUid: data?.evictedBy?.id }),
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Eviction', record?.id),
});

export const EXIT = defineLookup({
  slug: 'exits',
  entity: 'Exit',
  entityPlural: 'Exits',
  permission: 'EXIT',
  writtenName: true,
  label: 'Exit',
  pluralLabel: 'Exits',
  subtitle: 'Move-outs recorded against a unit',
  icon: 'logout',
  extraGqlFields: `
  exitedAt
`,
  extraFields: [
    {
      key: 'exitedAt',
      label: 'Exited at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [{ field: 'exitedAt', header: 'Exited at' }],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => [
    ...recordLinkPanels(comp, 'Exit', record?.id),
    ...entityLinkPanels(comp, [inventoryLink('InventoryExit')], record?.id),
  ],
});

export const HANDOVER = defineLookup({
  slug: 'handovers',
  entity: 'Handover',
  entityPlural: 'Handovers',
  permission: 'HANDOVER',
  writtenName: true,
  label: 'Handover',
  pluralLabel: 'Handovers',
  subtitle: 'Who handed a unit over, to whom, and where',
  icon: 'swap_horiz',
  extraGqlFields: `
  ${coordinateGqlFields}
  handovers
  actor {
    id
    uid: id
    name
  }
  handedOverAt
  handoverFrom {
    id
    uid: id
    name
  }
  handoverTo {
    id
    uid: id
    name
  }
`,
  extraFields: [
    ...coordinateFields(),
    numberField('handovers', 'Handovers'),
    refSelect('actorUid', 'Actor', ALL_BIO_DATA),
    {
      key: 'handedOverAt',
      label: 'Handed over at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('handoverFromUid', 'Handover from', ALL_BIO_DATA),
    refSelect('handoverToUid', 'Handover to', ALL_BIO_DATA),
  ],
  extraColumns: [
    'handovers',
    'actor.name as Actor',
    { field: 'handedOverAt', header: 'Handed over at' },
    'handoverFrom.name as Handover from',
    'handoverTo.name as Handover to',
  ],
  toModel: (data) => ({
    actorUid: data?.actor?.id,
    handoverFromUid: data?.handoverFrom?.id,
    handoverToUid: data?.handoverTo?.id,
  }),
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Handover', record?.id),
});

export const INSPECTION = defineLookup({
  slug: 'inspections',
  entity: 'Inspection',
  entityPlural: 'Inspections',
  permission: 'INSPECTION',
  writtenName: true,
  label: 'Inspection',
  pluralLabel: 'Inspections',
  subtitle: 'Inspections carried out on a unit',
  icon: 'assignment_turned_in',
  // No subcategory: the DBA's inspections table has no subcategories_id.
  extraGqlFields: `
  inspectionDate
  checklistType
`,
  extraFields: [
    {
      key: 'inspectionDate',
      label: 'Inspection date',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    checklistTypeField(),
  ],
  extraColumns: [{ field: 'inspectionDate', header: 'Inspection date' }, checklistTypeColumn],
  toModel: (data) => ({ checklistType: data?.checklistType ?? DEFAULT_CHECKLIST_TYPE }),
  // The officers on it, then the join read from this side — which units this
  // record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Inspection', record?.id),
});

export const LEASE = defineLookup({
  slug: 'leases',
  entity: 'Lease',
  entityPlural: 'Leases',
  permission: 'LEASE',
  writtenName: true,
  label: 'Lease',
  pluralLabel: 'Leases',
  subtitle: 'Leases granted over a unit',
  icon: 'description',
  extraGqlFields: `
  leasedAt
`,
  extraFields: [
    {
      key: 'leasedAt',
      label: 'Leased at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [{ field: 'leasedAt', header: 'Leased at' }],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Lease', record?.id),
});

export const LIABILITY = defineLookup({
  slug: 'liabilities',
  entity: 'Liability',
  entityPlural: 'Liabilities',
  permission: 'LIABILITY',
  writtenName: true,
  label: 'Liability',
  pluralLabel: 'Liabilities',
  subtitle: 'What is owed against a unit',
  icon: 'account_balance',
  extraGqlFields: `
  value
  liabilityDate
  liabilityType
`,
  extraFields: [
    numberField('value', 'Value'),
    {
      key: 'liabilityDate',
      label: 'Liability date',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'liabilityType',
      label: 'Liability type',
      type: FieldType.select,
      // The labels of the PostgreSQL enum `liability_types`, taken from the
      // DBA's CREATE TYPE. Two questions in one list: the first four say who
      // owes, the last two say how much of what they own is exposed — so a
      // jointly held debt that is also capped can only be recorded as one of
      // the two.
      options: [
        { value: 'PERSONAL', label: 'Personal' },
        { value: 'JOINT', label: 'Joint' },
        { value: 'SEVERAL', label: 'Several' },
        { value: 'JOINT_AND_SEVERAL', label: 'Joint and Several' },
        { value: 'LIMITED', label: 'Limited' },
        { value: 'UNLIMITED', label: 'Unlimited' },
      ],
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    'value',
    { field: 'liabilityDate', header: 'Liability date' },
    { field: 'liabilityType', header: 'Type' },
  ],
  // The joins read from this side — which units this record applies to, who
  // owes it, and what it is secured on.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Liability', record?.id),
});

export const LOAN = defineLookup({
  slug: 'loans',
  entity: 'Loan',
  entityPlural: 'Loans',
  permission: 'LOAN',
  writtenName: true,
  label: 'Loan',
  pluralLabel: 'Loans',
  subtitle: 'Borrowing recorded against a unit',
  icon: 'account_balance_wallet',
  extraGqlFields: `
  balance
  loanStartedAt
  loanEndedAt
  interest
  borrowAmount
  returnAmount
`,
  extraFields: [
    numberField('balance', 'Balance'),
    {
      key: 'loanStartedAt',
      label: 'Loan started at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'loanEndedAt',
      label: 'Loan ended at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    numberField('interest', 'Interest'),
    numberField('borrowAmount', 'Borrow amount'),
    numberField('returnAmount', 'Return amount'),
  ],
  extraColumns: [
    'balance',
    { field: 'loanStartedAt', header: 'Loan started at' },
    { field: 'loanEndedAt', header: 'Loan ended at' },
    'interest',
    'borrowAmount',
    'returnAmount',
  ],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Loan', record?.id),
});

export const MAINTENANCE = defineLookup({
  slug: 'maintenances',
  entity: 'Maintenance',
  entityPlural: 'Maintenances',
  permission: 'MAINTENANCE',
  writtenName: true,
  label: 'Maintenance',
  pluralLabel: 'Maintenance',
  subtitle: 'Work done on a unit, and what it cost',
  icon: 'build',
  extraGqlFields: `
  cost
  minimum
  maximum
  maintenanceFrom
  maintenanceTo
`,
  extraFields: [
    numberField('cost', 'Cost'),
    numberField('minimum', 'Minimum'),
    numberField('maximum', 'Maximum'),
    {
      key: 'maintenanceFrom',
      label: 'Maintenance from',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'maintenanceTo',
      label: 'Maintenance to',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    'cost',
    'minimum',
    'maximum',
    { field: 'maintenanceFrom', header: 'Maintenance from' },
    { field: 'maintenanceTo', header: 'Maintenance to' },
  ],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Maintenance', record?.id),
});

export const NOTICE = defineLookup({
  slug: 'notices',
  entity: 'Notice',
  entityPlural: 'Notices',
  permission: 'NOTICE',
  writtenName: true,
  label: 'Notice',
  pluralLabel: 'Notices',
  subtitle: 'Notices served in relation to a unit',
  icon: 'announcement',
  // Three days and nothing else: the table no longer carries the coordinates
  // or the figure named after it.
  extraGqlFields: `
  noticeDay
  fromDay
  deadline
`,
  extraFields: [
    {
      key: 'noticeDay',
      label: 'Notice Day',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    // CHECKed by the table and refused by the backend the wrong way round.
    {
      key: 'fromDay',
      label: 'From Day',
      hint: 'Before the deadline',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'deadline',
      label: 'Deadline',
      hint: 'After the from day',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    { field: 'noticeDay', header: 'Notice Day' },
    { field: 'fromDay', header: 'From Day' },
    { field: 'deadline', header: 'Deadline' },
  ],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Notice', record?.id),
});

export const PROBLEM = defineLookup({
  slug: 'problems',
  entity: 'Problem',
  entityPlural: 'Problems',
  permission: 'PROBLEM',
  writtenName: true,
  label: 'Problem',
  pluralLabel: 'Problems',
  subtitle: 'Faults raised against a unit',
  icon: 'report_problem',
  extraGqlFields: `
  problemDate
`,
  extraFields: [
    {
      key: 'problemDate',
      label: 'Problem date',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [{ field: 'problemDate', header: 'Problem date' }],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Problem', record?.id),
});

export const PURCHASE = defineLookup({
  slug: 'purchases',
  entity: 'Purchase',
  entityPlural: 'Purchases',
  permission: 'PURCHASE',
  writtenName: true,
  label: 'Purchase',
  pluralLabel: 'Purchases',
  subtitle: 'Units bought, and for how much',
  icon: 'shopping_cart',
  extraGqlFields: `
  purchasedAt
  purchasedAmount
`,
  extraFields: [
    {
      key: 'purchasedAt',
      label: 'Purchased at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    numberField('purchasedAmount', 'Purchased amount'),
  ],
  extraColumns: [{ field: 'purchasedAt', header: 'Purchased at' }, 'purchasedAmount'],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Purchase', record?.id),
});

export const READING = defineLookup({
  slug: 'readings',
  entity: 'Reading',
  entityPlural: 'Readings',
  permission: 'READING',
  writtenName: true,
  label: 'Reading',
  pluralLabel: 'Readings',
  subtitle: 'Meter readings taken on a connection',
  icon: 'shutter_speed',
  extraGqlFields: `
  connection {
    id
    uid: id
    name
    unit {
      id
      name
    }
    meter {
      id
      name
    }
  }
  readings
  readAt
  readBy {
    id
    uid: id
    name
  }
`,
  extraFields: [
    refSelect('connectionUid', 'Connection', ALL_SERVICE_CONNECTION),
    // `numeric(15,2)` in the database. A plain number control steps in whole
    // units and rejects a fractional entry, which loses the part of a meter
    // reading that moves between visits.
    {
      key: 'readings',
      label: 'Readings',
      type: FieldType.decimal,
      decimals: 2,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'readAt',
      label: 'Read at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('readByUid', 'Read by', ALL_BIO_DATA),
  ],
  extraColumns: [
    'connection.name as Connection',
    'readings',
    { field: 'readAt', header: 'Read at' },
    'readBy.name as Read by',
  ],
  toModel: (data) => ({ connectionUid: data?.connection?.id, readByUid: data?.readBy?.id }),
  // What this reading was read from, and what has been read against it.
  extraContents: (comp, record) => readingLinkPanels(comp, record?.id),
});

export const RESERVATION = defineLookup({
  slug: 'reservations',
  entity: 'Reservation',
  entityPlural: 'Reservations',
  permission: 'RESERVATION',
  writtenName: true,
  label: 'Reservation',
  pluralLabel: 'Reservations',
  subtitle: 'Reservations held over a unit',
  icon: 'event_available',
  extraGqlFields: `
  reservationAt
  reservationBy {
    id
    uid: id
    name
  }
`,
  extraFields: [
    {
      key: 'reservationAt',
      label: 'Reservation at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('reservationByUid', 'Reservation by', ALL_BIO_DATA),
  ],
  extraColumns: [
    { field: 'reservationAt', header: 'Reservation at' },
    'reservationBy.name as Reservation by',
  ],
  toModel: (data) => ({ reservationByUid: data?.reservationBy?.id }),
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Reservation', record?.id),
});

export const RETURN = defineLookup({
  slug: 'returns',
  entity: 'Return',
  entityPlural: 'Returns',
  permission: 'RETURN',
  writtenName: true,
  label: 'Return',
  pluralLabel: 'Returns',
  subtitle: 'Units handed back',
  icon: 'undo',
  extraGqlFields: `
  returnedDate
`,
  extraFields: [
    {
      key: 'returnedDate',
      label: 'Returned date',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [{ field: 'returnedDate', header: 'Returned date' }],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Return', record?.id),
});

export const SELL = defineLookup({
  slug: 'sells',
  entity: 'Sell',
  entityPlural: 'Sells',
  permission: 'SELL',
  writtenName: true,
  label: 'Sell',
  pluralLabel: 'Sales',
  subtitle: 'Units sold, and for how much',
  icon: 'local_offer',
  extraGqlFields: `
  sellAmount
`,
  extraFields: [numberField('sellAmount', 'Sell amount')],
  extraColumns: ['sellAmount'],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Sell', record?.id),
});

export const SERVICE_CONNECTION = defineLookup({
  slug: 'service-connections',
  entity: 'ServiceConnection',
  entityPlural: 'ServiceConnections',
  permission: 'SERVICE_CONNECTION',
  writtenName: true,
  label: 'Service Connection',
  pluralLabel: 'Connections',
  subtitle: 'Utility services connected to a unit',
  icon: 'power',
  extraGqlFields: `
  connectedAt
  service {
    ${lookupRefGqlFields}
  }
  meter {
    ${lookupRefGqlFields}
  }
  unit {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    {
      key: 'connectedAt',
      label: 'Connected at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('serviceUid', 'Service', ALL_SERVICE_OFFERING),
    // Service, meter and unit are unique together on the table, so a repeated
    // triple is rejected on save.
    refSelect('meterUid', 'Meter', ALL_METER),
    refSelect('unitUid', 'Unit', ALL_UNIT),
  ],
  extraColumns: [
    { field: 'connectedAt', header: 'Connected at' },
    'service.name as Service',
    'meter.name as Meter',
    'unit.name as Unit',
  ],
  toModel: (data) => ({
    serviceUid: data?.service?.id,
    meterUid: data?.meter?.id,
    unitUid: data?.unit?.id,
  }),
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'ServiceConnection', record?.id),
});

export const SERVICE_DISCONNECTION = defineLookup({
  slug: 'service-disconnections',
  entity: 'ServiceDisconnection',
  entityPlural: 'ServiceDisconnections',
  permission: 'SERVICE_DISCONNECTION',
  writtenName: true,
  label: 'Service Disconnection',
  pluralLabel: 'Disconnections',
  subtitle: 'Utility services disconnected from a unit',
  icon: 'power_off',
  extraGqlFields: `
  disconnectedAt
  connection {
    ${lookupRefGqlFields}
    service {
      ${lookupRefGqlFields}
    }
  }
`,
  extraFields: [
    {
      key: 'disconnectedAt',
      label: 'Disconnected at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    // The disconnection names the connection it ends; the service is read
    // through that rather than chosen again.
    refSelect('connectionUid', 'Connection', ALL_SERVICE_CONNECTION),
  ],
  extraColumns: [
    { field: 'disconnectedAt', header: 'Disconnected at' },
    'connection.name as Connection',
  ],
  toModel: (data) => ({ connectionUid: data?.connection?.id }),
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'ServiceDisconnection', record?.id),
});

export const TERMINATION = defineLookup({
  slug: 'terminations',
  entity: 'Termination',
  entityPlural: 'Terminations',
  permission: 'TERMINATION',
  writtenName: true,
  label: 'Termination',
  pluralLabel: 'Terminations',
  subtitle: 'Occupancies brought to an end',
  icon: 'cancel',
  extraGqlFields: `
  terminatedAt
`,
  extraFields: [
    {
      key: 'terminatedAt',
      label: 'Terminated at',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [{ field: 'terminatedAt', header: 'Terminated at' }],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Termination', record?.id),
});

export const TITLE_DEED = defineLookup({
  slug: 'title-deeds',
  entity: 'TitleDeed',
  entityPlural: 'TitleDeeds',
  permission: 'TITLE_DEED',
  writtenName: true,
  label: 'Title Deed',
  pluralLabel: 'Title Deeds',
  subtitle: 'Title deeds held over a unit',
  icon: 'verified_user',
  extraGqlFields: `
  ${coordinateGqlFields}
  titleDeeds
`,
  extraFields: [...coordinateFields(), numberField('titleDeeds', 'Title deeds')],
  extraColumns: ['titleDeeds'],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'TitleDeed', record?.id),
});

export const UNIT_STATUS_RECORD = defineLookup({
  slug: 'unit-status-records',
  entity: 'UnitStatusRecord',
  entityPlural: 'UnitStatusRecords',
  permission: 'UNIT_STATUS_RECORD',
  writtenName: true,
  label: 'Unit Status Record',
  pluralLabel: 'Unit Status Records',
  subtitle: "How a unit's status has changed over time",
  icon: 'history',
  extraGqlFields: `
  unit {
    ${lookupRefGqlFields}
  }
  status
`,
  extraFields: [
    refSelect('unitUid', 'Unit', ALL_UNIT),
    {
      key: 'status',
      label: 'Status',
      type: FieldType.select,
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
  extraColumns: ['unit.name as Unit', 'status'],
  toModel: (data) => ({ unitUid: data?.unit?.id }),
});

/**
 * The labels `units_flags` is offered, out of the nine the database enum
 * `flags` holds. The first four are a budget's, and say which version it is;
 * these five say how a unit is put on the market. The table itself would take
 * any of the nine.
 */
const UNIT_FLAG_OPTIONS = [
  { value: 'SELL', label: 'Sell' },
  { value: 'RENT', label: 'Rent' },
  { value: 'HIRE_PURCHASE', label: 'Hire Purchase' },
  { value: 'HIRE', label: 'Hire' },
  { value: 'PURCHASE', label: 'Purchase' },
  { value: 'LATEST', label: 'Latest' },
  { value: 'OLD', label: 'Old' },
  { value: 'MAIN', label: 'Main' },
  { value: 'ADDITIONAL', label: 'Additional' },
];

/** A flag put on a unit, under a subcategory (`units_flags`). */
export const UNIT_FLAG = defineLookup({
  slug: 'unit-flags',
  entity: 'UnitFlag',
  entityPlural: 'UnitFlags',
  permission: 'UNIT_FLAG',
  writtenName: true,
  label: 'Unit Flag',
  pluralLabel: 'Unit Flags',
  subtitle: 'How a unit is flagged: for sale, for rent, on hire purchase',
  icon: 'label',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
  unit {
    ${lookupRefGqlFields}
  }
  flag
`,
  extraFields: [
    refSelect('unitUid', 'Unit', ALL_UNIT),
    refSelect('subcategoryUid', 'Subcategory', ALL_SUBCATEGORIES),
    {
      key: 'flag',
      label: 'Flag',
      type: FieldType.select,
      options: UNIT_FLAG_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    'unit.name as Unit',
    'subcategory.name as Subcategory',
    {
      field: 'flag',
      header: 'Flag',
      valueFn: (row) =>
        UNIT_FLAG_OPTIONS.find((option) => option.value === row?.flag)?.label ?? row?.flag,
    },
  ],
  toModel: (data) => ({ unitUid: data?.unit?.id, subcategoryUid: data?.subcategory?.id }),
});

export const VISIT = defineLookup({
  slug: 'visits',
  entity: 'Visit',
  entityPlural: 'Visits',
  permission: 'VISIT',
  writtenName: true,
  label: 'Visit',
  pluralLabel: 'Visits',
  subtitle: 'Visits made to a unit',
  icon: 'place',
  extraGqlFields: `
  ${coordinateGqlFields}
  visits
`,
  extraFields: [...coordinateFields(), numberField('visits', 'Visits')],
  extraColumns: ['visits'],
  // The join read from this side — which units this record applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Visit', record?.id),
});

/** Ordered as a unit's life runs: taken, occupied, charged, maintained, given up. */
export const UNIT_LOOKUPS: LookupModule[] = [
  RESERVATION,
  BOOKING,
  PURCHASE,
  SELL,
  LEASE,
  ENTRY,
  EXIT,
  HANDOVER,
  RETURN,
  TERMINATION,
  EVICTION,
  INSPECTION,
  MAINTENANCE,
  PROBLEM,
  VISIT,
  SERVICE_CONNECTION,
  SERVICE_DISCONNECTION,
  READING,
  LIABILITY,
  LOAN,
  NOTICE,
  TITLE_DEED,
  UNIT_STATUS_RECORD,
  UNIT_FLAG,
];

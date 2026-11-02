import { take } from 'rxjs';
import { gql } from '@apollo/client/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import {
  entityLink$,
  Lookup,
  LookupModule,
  openEntityLinkForm,
  openLookupForm,
} from '@shared/lookup';

import {
  BOOKING,
  ENTRY,
  EVICTION,
  EXIT,
  HANDOVER,
  INSPECTION,
  LEASE,
  LIABILITY,
  LOAN,
  MAINTENANCE,
  NOTICE,
  PROBLEM,
  PURCHASE,
  READING,
  RESERVATION,
  RETURN,
  SELL,
  SERVICE_CONNECTION,
  SERVICE_DISCONNECTION,
  TERMINATION,
  TITLE_DEED,
  UNIT_FLAG,
  UNIT_STATUS_RECORD,
  VISIT,
} from './unit-lookups';
import { unitLinkConfigs } from './unit-links';

/**
 * What can be done to a unit, from its own page and its row menu, with the unit
 * already chosen — the unit counterpart of asset-actions. This is the only
 * place unit records are made, so every one of them belongs to a unit.
 *
 * Grouped by what the user is doing rather than by table: who has it
 * (Occupancy), keeping it up (Care), its utilities (Services), ending a tenancy
 * (Closing), who owns it and what it owes (Ownership), and how it is marked
 * (Status). Each item opens a short form: only what the user knows. The
 * backend names the record and ties it to the unit in the same save, and the
 * page reloads so the new record shows at once.
 *
 * "Link to…" ties the unit to anything else that already exists.
 */

/** One action: a verb on the menu, and the record it makes. */
interface UnitAction {
  verb: string;
  lookup: LookupModule;
  /**
   * The link entity the record joins the unit through — left out of "Link to…".
   * Empty where the record holds the unit itself or reaches it another way.
   */
  link: string;
  /** The record kind as the backend names it in a unit's stage and history ("Lease"). */
  kind: string;
  /**
   * Whether the save takes the unit. A reading does not: it belongs to a
   * connection, which the form offers from this unit's own.
   */
  takesUnit?: false;
}

const OCCUPANCY: UnitAction[] = [
  { verb: 'Reserve', lookup: RESERVATION, link: 'UnitReservation', kind: 'Reservation' },
  { verb: 'Book', lookup: BOOKING, link: 'UnitBooking', kind: 'Booking' },
  { verb: 'Lease', lookup: LEASE, link: 'UnitLease', kind: 'Lease' },
  { verb: 'Hand Over', lookup: HANDOVER, link: 'UnitHandover', kind: 'Handover' },
  { verb: 'Move In', lookup: ENTRY, link: 'UnitEntry', kind: 'Entry' },
  { verb: 'Move Out', lookup: EXIT, link: 'UnitExit', kind: 'Exit' },
  { verb: 'Return', lookup: RETURN, link: 'UnitReturn', kind: 'Return' },
  { verb: 'Record Visit', lookup: VISIT, link: 'UnitVisit', kind: 'Visit' },
];

const CARE: UnitAction[] = [
  { verb: 'Inspect', lookup: INSPECTION, link: 'UnitInspection', kind: 'Inspection' },
  { verb: 'Maintain', lookup: MAINTENANCE, link: 'UnitMaintenance', kind: 'Maintenance' },
  { verb: 'Report Problem', lookup: PROBLEM, link: 'UnitProblem', kind: 'Problem' },
];

const SERVICES: UnitAction[] = [
  { verb: 'Connect Service', lookup: SERVICE_CONNECTION, link: '', kind: 'ServiceConnection' },
  {
    verb: 'Disconnect Service',
    lookup: SERVICE_DISCONNECTION,
    link: 'UnitDisconnection',
    kind: 'ServiceDisconnection',
  },
  { verb: 'Record Reading', lookup: READING, link: '', kind: 'Reading', takesUnit: false },
];

const CLOSING: UnitAction[] = [
  { verb: 'Give Notice', lookup: NOTICE, link: 'UnitNotice', kind: 'Notice' },
  { verb: 'Terminate', lookup: TERMINATION, link: 'UnitTermination', kind: 'Termination' },
  { verb: 'Evict', lookup: EVICTION, link: 'UnitEviction', kind: 'Eviction' },
];

const OWNERSHIP: UnitAction[] = [
  { verb: 'Sell', lookup: SELL, link: 'UnitSell', kind: 'Sell' },
  { verb: 'Purchase', lookup: PURCHASE, link: 'UnitPurchase', kind: 'Purchase' },
  { verb: 'Add Title Deed', lookup: TITLE_DEED, link: 'UnitTitleDeed', kind: 'TitleDeed' },
  { verb: 'Add Liability', lookup: LIABILITY, link: 'UnitLiability', kind: 'Liability' },
  { verb: 'Add Loan', lookup: LOAN, link: 'UnitLoan', kind: 'Loan' },
];

const STATUS: UnitAction[] = [
  { verb: 'Set Status', lookup: UNIT_STATUS_RECORD, link: '', kind: 'UnitStatusRecord' },
  { verb: 'Flag', lookup: UNIT_FLAG, link: '', kind: 'UnitFlag' },
];

const ALL_ACTIONS = [...OCCUPANCY, ...CARE, ...SERVICES, ...CLOSING, ...OWNERSHIP, ...STATUS];

/** The link entities the actions above make, so "Link to…" does not offer them twice. */
const ACTION_LINKS = new Set(ALL_ACTIONS.map((a) => a.link).filter(Boolean));

/** A unit's own connections: what a reading or a disconnection on its page is offered. */
const SERVICE_CONNECTIONS_BY_UNIT = gql`
  query serviceConnectionsByUnit($unitUid: String) {
    serviceConnectionsByUnit(unitUid: $unitUid) {
      id
      name
    }
  }
`;

/** The record page each kind opens on, by the backend's kind name. */
export const UNIT_RECORD_SLUGS: Record<string, string> = Object.fromEntries(
  ALL_ACTIONS.map((a) => [a.kind, a.lookup.slug]),
);

/**
 * What the unit's stage says usually comes next, cut to what this user may
 * record. Empty on a list row, which does not carry the stage.
 */
function nextSteps(u?: Lookup): UnitAction[] {
  const next: string[] = u?.['stage']?.next ?? [];
  return next
    .map((kind) => ALL_ACTIONS.find((a) => a.kind === kind))
    .filter(
      (a): a is UnitAction =>
        !!a && HasPermissionDirective.hasPermission(a.lookup.upsertPermissions),
    );
}

/**
 * The next step as a button of its own, before the menus: a leased unit shows
 * "Hand Over", an occupied one "Inspect" and "Give Notice". The step the reader
 * most likely came to take is one click away rather than two.
 */
function nextStepButton(
  comp: BaseComponent,
  unit: LookupModule,
  index: number,
): ActionButton {
  const step = (u?: Lookup) => nextSteps(u)[index];
  return {
    icon: 'arrow_forward',
    class: index === 0 ? 'btn-add-primary' : undefined,
    toolTip: 'The usual next step for this unit',
    labelMapper: (u?: Lookup) => step(u)?.verb ?? '',
    iconMapper: (u?: Lookup) => step(u)?.lookup.icon ?? 'arrow_forward',
    hideFunction: (u?: Lookup) => !step(u),
    click: (u: Lookup) => {
      const action = step(u);
      if (action) openShortForm(comp, unit, action, u);
    },
  };
}

/**
 * Fields the short form leaves out: the descriptive three, which the backend
 * writes, and the unit itself, which is carried hidden. A handover, visit or
 * title deed still asks for its coordinates: the unit has none to lend it.
 */
const LEFT_OUT = new Set(['name', 'assignedNumber', 'description', 'unitUid']);

/** Offers a connection select only this unit's connections. */
function ofThisUnit(field: FieldConfig, unitUid?: string): FieldConfig {
  if (field.key !== 'connectionUid') return field;
  return {
    ...field,
    optionsVariables: {
      ...field.optionsVariables,
      fetchParameter: { query: SERVICE_CONNECTIONS_BY_UNIT, variables: { unitUid } },
    },
  } as FieldConfig;
}

export function unitActions(comp: BaseComponent, unit: LookupModule): ActionButton[] {
  const group = (
    label: string,
    icon: string,
    toolTip: string,
    actions: UnitAction[],
  ): ActionButton => ({
    icon,
    label,
    toolTip,
    hideFunction: (u?: Lookup) => !u,
    buttons: actions.map((action) => ({
      icon: action.lookup.icon,
      label: action.verb,
      permissions: action.lookup.upsertPermissions,
      click: (u: Lookup) => openShortForm(comp, unit, action, u),
    })),
  });

  return [
    nextStepButton(comp, unit, 0),
    nextStepButton(comp, unit, 1),
    group('Occupancy', 'key', 'Reserve, book, lease, hand over, move in or out', OCCUPANCY),
    group('Care', 'build', 'Inspect or maintain this unit', CARE),
    group('Services', 'power', 'Connect or disconnect a service, record a reading', SERVICES),
    group('Closing', 'gavel', 'Give notice, terminate or evict', CLOSING),
    group('Ownership', 'account_balance', 'Sale, title deeds, liabilities and loans', OWNERSHIP),
    group('Status', 'flag', 'Set the status or flag this unit', STATUS),
    {
      icon: 'link',
      label: 'Link to…',
      toolTip: 'Tie this unit to something that already exists',
      hideFunction: (u?: Lookup) => !u,
      buttons: unitLinkConfigs()
        .filter((config) => !ACTION_LINKS.has(config.entity))
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((config) => ({
          icon: config.icon,
          label: config.label,
          permissions: [`ROLE_CREATE_${config.permission}`],
          click: (u: Lookup) => {
            entityLink$.pipe(take(1)).subscribe(() => unit.changed$.next(undefined));
            openEntityLinkForm(comp, config, u?.id as string);
          },
        })),
    },
  ];
}

/**
 * The record's form cut to what the user knows, with the unit carried hidden.
 * Saving makes the record and its link to the unit in one go; the unit's page
 * then reloads.
 */
function openShortForm(comp: BaseComponent, unit: LookupModule, action: UnitAction, u: Lookup) {
  const lookup = action.lookup;
  const short: LookupModule = {
    ...lookup,
    label: `${action.verb} — ${u?.name ?? 'Unit'}`,
    baseFields: [
      { key: 'id', type: FieldType.input, visible: false },
      ...(action.takesUnit === false
        ? []
        : [{ key: 'unitUid', type: FieldType.input, visible: false }]),
    ],
    extraFields: (lookup.extraFields ?? [])
      .filter((field: FieldConfig) => !LEFT_OUT.has(field.key as string))
      .map((field: FieldConfig) => ofThisUnit(field, u?.id)),
    // A short form is never a stepper: its steps would name fields it no longer has.
    formSteppers: undefined,
  };
  lookup.changed$.pipe(take(1)).subscribe(() => unit.changed$.next(undefined));
  openLookupForm(comp, short, { unitUid: u?.id });
}

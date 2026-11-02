import { take } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
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
  MAINTENANCE,
  NOTICE,
  PURCHASE,
  RESERVATION,
  RETURN,
  SELL,
  TERMINATION,
} from './unit-lookups';
import { unitLinkConfigs } from './unit-links';

/**
 * What can be done to a unit, from its own page and its row menu, with the unit
 * already chosen — the unit counterpart of asset-actions.
 *
 * Grouped by what the user is doing rather than by table: who has it
 * (Occupancy), keeping it up (Care), ending a tenancy (Closing), and selling or
 * buying it (Sale). Each item opens a short form: only what the user knows. The
 * backend names the record and links it to the unit in the same save, and the
 * page reloads so the new record's tab and the activity list show it at once.
 *
 * "Link to…" ties the unit to anything else that already exists.
 */

/** One action: a verb on the menu, and the record it makes. */
interface UnitAction {
  verb: string;
  lookup: LookupModule;
  /** The link entity the record joins the unit through — left out of "Link to…". */
  link: string;
}

const OCCUPANCY: UnitAction[] = [
  { verb: 'Reserve', lookup: RESERVATION, link: 'UnitReservation' },
  { verb: 'Book', lookup: BOOKING, link: 'UnitBooking' },
  { verb: 'Lease', lookup: LEASE, link: 'UnitLease' },
  { verb: 'Hand Over', lookup: HANDOVER, link: 'UnitHandover' },
  { verb: 'Move In', lookup: ENTRY, link: 'UnitEntry' },
  { verb: 'Move Out', lookup: EXIT, link: 'UnitExit' },
  { verb: 'Return', lookup: RETURN, link: 'UnitReturn' },
];

const CARE: UnitAction[] = [
  { verb: 'Inspect', lookup: INSPECTION, link: 'UnitInspection' },
  { verb: 'Maintain', lookup: MAINTENANCE, link: 'UnitMaintenance' },
];

const CLOSING: UnitAction[] = [
  { verb: 'Give Notice', lookup: NOTICE, link: 'UnitNotice' },
  { verb: 'Terminate', lookup: TERMINATION, link: 'UnitTermination' },
  { verb: 'Evict', lookup: EVICTION, link: 'UnitEviction' },
];

const SALE: UnitAction[] = [
  { verb: 'Sell', lookup: SELL, link: 'UnitSell' },
  { verb: 'Purchase', lookup: PURCHASE, link: 'UnitPurchase' },
];

/** The link entities the actions above make, so "Link to…" does not offer them twice. */
const ACTION_LINKS = new Set([...OCCUPANCY, ...CARE, ...CLOSING, ...SALE].map((a) => a.link));

/**
 * Fields the short form leaves out: the descriptive three, which the backend
 * writes, and the coordinates, which a handover takes from the unit.
 */
const LEFT_OUT = new Set(['name', 'assignedNumber', 'description', 'latitude', 'longitude']);

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
    group('Occupancy', 'key', 'Reserve, book, lease, hand over, move in or out', OCCUPANCY),
    group('Care', 'build', 'Inspect or maintain this unit', CARE),
    group('Closing', 'gavel', 'Give notice, terminate or evict', CLOSING),
    group('Sale', 'local_offer', 'Sell or purchase this unit', SALE),
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
      { key: 'unitUid', type: FieldType.input, visible: false },
    ],
    extraFields: (lookup.extraFields ?? []).filter(
      (field: FieldConfig) => !LEFT_OUT.has(field.key as string),
    ),
    // A short form is never a stepper: its steps would name fields it no longer has.
    formSteppers: undefined,
  };
  lookup.changed$.pipe(take(1)).subscribe(() => unit.changed$.next(undefined));
  openLookupForm(comp, short, { unitUid: u?.id });
}

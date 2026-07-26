import {
  DetailGroup,
  FieldsProperties,
  KeyField,
} from '@shared/components/details/util/field/field.interface';
import { DetailsParameter } from '@shared/components/details/details.interface';

/** Shared label overrides for auto-rendered entity details in the pipeline module. */
export const PIPELINE_FIELD_LABELS: FieldsProperties = {
  isDeleted: { label: 'Deleted' },
  spatialLength: { label: 'Pipeline Length' },
};

export type NarrativeFlavor = 'entity' | 'event' | 'reference';

/**
 * Fields removed from every narrative detail view. Technical noise that
 * pollutes the story without informing the reader.
 *  - `id`/`uid`: surrogate keys; redundant with the URL.
 *  - `deletedId`/`migrated`/`createdById`: internal bookkeeping.
 *  - `active`/`isDeleted`: collapsed into the derived `recordStatus` field.
 *  - `createdBy`/`updatedBy`: replaced by flat `createdByName`/`updatedByName`.
 *  - `deletedAt`/`deletedBy`: hidden when empty via `hideUndefined`.
 */
const NARRATIVE_HIDDEN_KEYS = [
  'id',
  'uid',
  'deletedId',
  'migrated',
  'createdById',
  'active',
  'isDeleted',
  'createdBy',
  'updatedBy',
  'deletedBy',
];

const compoundName = (user: any): string | undefined => {
  if (!user) return undefined;
  const compound = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ').trim();
  return compound || user.username || user.email || undefined;
};

const recordStatusFor = (entity: any): string => {
  if (entity?.isDeleted) return 'Deleted';
  return entity?.active === false ? 'Inactive' : 'Active';
};

const recordStatusClassFor = (entity: any): string => {
  if (entity?.isDeleted) return 'text-red-600 font-semibold';
  if (entity?.active === false) return 'text-gray-500 font-semibold';
  return 'text-emerald-600 font-semibold';
};

const auditGroup: DetailGroup = {
  label: 'Audit Trail',
  icon: 'history',
  fields: [
    { key: 'createdByName', label: 'Created By' },
    { key: 'createdAt', label: 'Created On' },
    { key: 'updatedAt', label: 'Last Updated' },
  ],
};

export interface NarrativeConfig {
  flavor: NarrativeFlavor;
  entity: any;

  /**
   * Entity: Identity (name, code, type, domain status).
   * Event: When (occurrence date, scheduled dates).
   * Reference: Identity (name, code).
   */
  identity?: KeyField[];

  /**
   * Entity: Context (parent refs — pipeline / section / segment chain).
   * Event: Where (which station / tank / segment the event happened at).
   * Reference: (unused)
   */
  context?: KeyField[];

  /**
   * Entity: Specifications (technical numbers).
   * Event: Measurements (recorded values).
   * Reference: Description (long-form text).
   */
  specifications?: KeyField[];

  /**
   * Entity: Operational State (runtime indicators — extra fields beyond record status).
   * Event: Who (operator / recorder).
   * Reference: (unused)
   */
  operational?: KeyField[];

  /** Per-field overrides (label/valueClass/pipe/...) merged on top of module defaults. */
  fieldsProperties?: FieldsProperties;
}

/**
 * Build a story-shaped DetailsParameter slice for a `type: 'details'` ContentParameter.
 * Spread the returned object onto the content entry; it brings its own entity, groups,
 * hidden-keys policy, and field overrides.
 */
export function buildNarrative(cfg: NarrativeConfig): Partial<DetailsParameter> {
  const { flavor, entity } = cfg;

  const enriched = {
    ...(entity ?? {}),
    createdByName: compoundName(entity?.createdBy),
    recordStatus: recordStatusFor(entity),
  };

  const recordStatusField: KeyField = {
    key: 'recordStatus',
    label: 'Record Status',
    valueClass: recordStatusClassFor(entity),
  };

  // Drop a section entirely when every field in it resolves to undefined/null/''
  // on the enriched entity. The Operational State group is exempt — it always
  // carries the auto-derived status chip, which is meaningful baseline metadata.
  // NOTE: dotted-path keys (e.g. `foo.bar`) bypass this check and always render —
  // current call sites all pass flat keys, so this is intentional.
  const keyOf = (k: KeyField): string =>
    typeof k === 'string' ? k.split(' ')[0] : k.key.split(' ')[0];
  const hasAnyValue = (fields: KeyField[] | undefined, e: any): boolean =>
    !!fields?.some((k) => {
      const v = e?.[keyOf(k)];
      return v !== undefined && v !== null && v !== '';
    });
  const group = (
    fields: KeyField[] | undefined,
    label: string,
    icon: string,
  ): DetailGroup | false =>
    hasAnyValue(fields, enriched) ? { label, icon, fields: fields! } : false;

  let groups: DetailGroup[] = [];

  if (flavor === 'entity') {
    groups = [
      group(cfg.identity, 'Identity', 'id_card'),
      group(cfg.context, 'Context', 'location_alt'),
      group(cfg.specifications, 'Specifications', 'numbers'),
      {
        label: 'Operational State',
        icon: 'stamp',
        fields: [recordStatusField, ...(cfg.operational ?? [])],
      },
      hasAnyValue(auditGroup.fields, enriched) && auditGroup,
    ].filter(Boolean) as DetailGroup[];
  } else if (flavor === 'event') {
    groups = [
      group(cfg.identity, 'When', 'clock_alt'),
      group(cfg.context, 'Where', 'location'),
      group(cfg.operational, 'Who', 'user_tie'),
      group(cfg.specifications, 'Measurements', 'numbers'),
      hasAnyValue(auditGroup.fields, enriched) && auditGroup,
    ].filter(Boolean) as DetailGroup[];
  } else {
    groups = [
      group(cfg.identity, 'Identity', 'id_card'),
      group(cfg.specifications, 'Description', 'notes'),
      hasAnyValue(auditGroup.fields, enriched) && auditGroup,
    ].filter(Boolean) as DetailGroup[];
  }

  return {
    entity: enriched,
    detailsGroups: groups,
    hiddenKeys: NARRATIVE_HIDDEN_KEYS,
    fieldsProperties: {
      ...PIPELINE_FIELD_LABELS,
      ...(cfg.fieldsProperties ?? {}),
    },
    showUndefined: false,
    hideUndefined: true,
    showFirstGroupHeader: true,
  };
}

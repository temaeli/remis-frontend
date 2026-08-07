import { Subject } from 'rxjs';
import { DocumentNode } from '@apollo/client/core';
import { FieldConfig } from '@shared/components/generic-form/field.interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

/**
 * The shape every lookup table in the DBA-owned `remis_core_schema` repeats,
 * mirroring `CoreNamedEntity` on the backend: an audit block that records only
 * creation, plus the three descriptive columns on top of it.
 *
 * Keyed on a uuid, so `id` is a string and there is no `uid` column — the primary
 * key is the public identifier. There is no `updatedAt` or `deletedAt` either.
 */
export interface CoreLookup {
  id?: string;
  uid?: string;
  assignedNumber?: string;
  name?: string;
  description?: string;
  active?: boolean;
  isDeleted?: boolean;
  createdAt?: string;

  /**
   * The columns only some of these tables carry. Collected here rather than split
   * across twenty near-identical interfaces: one generic screen reads them all,
   * and which of them a given table has is already stated by its config.
   */
  issuer?: CoreLookup;
  country?: CoreLookup;
  currency?: CoreLookup;
  discounts?: number;
  days?: number;
  payLimAmounts?: number;
  spgrpcodes?: number;
  systemCodes?: number;
  rateAgainstTzs?: number;
  latitude?: number;
  longitude?: number;
  startedAt?: string;
  endedAt?: string;
}

/** The five operations every one of these controllers publishes. */
export interface CoreLookupOperations {
  all: DocumentNode;
  allPageable: DocumentNode;
  find: DocumentNode;
  save: DocumentNode;
  delete: DocumentNode;
}

/**
 * Everything that differs between one lookup screen and the next. The rest — the
 * queries, the form, the grid, the buttons, the two components — is shared.
 */
export interface CoreLookupConfig {
  /** URL segment, and the key the generic components resolve their config by. */
  slug: string;

  /** The entity name the backend builds `find…`/`save…`/`delete…` from. */
  entity: string;

  /** The plural the backend builds `all…`/`all…Pageable` from. */
  entityPlural: string;

  /** UPPER_SNAKE suffix of the permission set `PermissionSeeder` generates. */
  permission: string;

  /** Singular label, used on the detail page and in every button. */
  label: string;

  /** Plural label, used as the list page title. */
  pluralLabel: string;

  subtitle: string;
  icon: string;

  /** Selection appended to the shared core fields. */
  extraGqlFields?: string;

  /** Controls appended to the shared name/number/description block. */
  extraFields?: FieldConfig[];

  /** Columns inserted between `description` and `active` on the list. */
  extraColumns?: GridKeyColumn[];

  /**
   * Seeds the form model from the record being edited. Needed wherever a control
   * does not map onto the record one-to-one — a relation select holds an id while
   * the record holds the whole related row.
   */
  toModel?: (data?: CoreLookup) => Record<string, unknown>;
}

/** A config with everything derived from it — what the screens actually consume. */
export interface CoreLookupModule extends CoreLookupConfig {
  gql: CoreLookupOperations;

  /** Notifies the list and the detail page that a record changed. */
  changed$: Subject<CoreLookup | any>;

  viewPermissions: string[];
  upsertPermissions: string[];
  deletePermissions: string[];
}

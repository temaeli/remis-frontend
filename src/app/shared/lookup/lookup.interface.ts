import { Subject } from 'rxjs';
import { DocumentNode } from '@apollo/client/core';
import { FieldConfig } from '@shared/components/generic-form/field.interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';

/**
 * Which schema a lookup table lives in. It decides two things the screens cannot
 * guess: the audit columns the table actually has, and what the public
 * identifier is.
 *
 * `core` — the DBA-owned `remis_core_schema`. Records only creation, so there is
 * no `updatedAt` or `deletedAt`, and no `uid` column: the uuid primary key is the
 * identifier and `uid` is an alias onto it.
 *
 * `uaa` — the tables the application generated for itself. They carry a real
 * generated `uid` alongside the numeric `id`, and that `uid` is the identifier.
 */
export type LookupSchema = 'core' | 'uaa';

/**
 * A record from any lookup table.
 *
 * Only what every one of them has is named. The descriptive columns differ by
 * schema — the core tables repeat `assignedNumber`/`name`/`description`, the uaa
 * ones carry whatever they were built with — and the rest is a relation, an
 * amount or a date belonging to one table alone.
 *
 * The index signature is deliberately `any` rather than `unknown`: `toModel`
 * reads relations off these records to seed a select (`data?.costType?.id`), and
 * `unknown` would make every config cast. Enumerating each module's columns here
 * instead would put three modules' domain knowledge in a shared type.
 */
export interface Lookup {
  id?: string;
  uid?: string;
  active?: boolean;
  isDeleted?: boolean;
  createdAt?: string;

  assignedNumber?: string;
  name?: string;
  description?: string;
  code?: string;
  title?: string;

  [column: string]: any;
}

/** The five operations every one of these controllers publishes. */
export interface LookupOperations {
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
export interface LookupConfig {
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

  /** Defaults to `core`. */
  schema?: LookupSchema;

  /**
   * The audit block this table carries, selected on every query. Defaults to the
   * one its schema implies.
   *
   * Only worth setting where a table does not carry the block its schema is
   * supposed to: `workflow_definitions` has no `isDeleted` column at all, and
   * asking for it fails the whole query rather than omitting one field.
   */
  auditGqlFields?: string;

  /**
   * The name SPQR gave the save mutation's argument, which is the DTO parameter's
   * own name. The billing and reference controllers annotate it `input`; the uaa
   * ones leave it as `dto`. Defaults to `input`.
   */
  saveArg?: 'input' | 'dto';

  /** The field holding the record's display name. Defaults to `name`. */
  nameKey?: string;

  /**
   * The descriptive columns this table carries, selected on every query.
   * Defaults to the `assignedNumber`/`name`/`description` triple the core tables
   * repeat.
   */
  descriptiveGqlFields?: string;

  /** Controls for those columns. Defaults to match `descriptiveGqlFields`. */
  baseFields?: FieldConfig[];

  /** Columns for them, shown before `active`. Defaults to match. */
  baseColumns?: GridKeyColumn[];

  /** Selection appended to the descriptive columns. */
  extraGqlFields?: string;

  /** Controls appended to the base block. */
  extraFields?: FieldConfig[];

  /** Columns inserted between the base block and `active`. */
  extraColumns?: GridKeyColumn[];

  /**
   * Seeds the form model from the record being edited. Needed wherever a control
   * does not map onto the record one-to-one — a relation select holds an id while
   * the record holds the whole related row.
   */
  toModel?: (data?: Lookup) => Record<string, unknown>;

  /** Panels appended to the detail page, below the details block. */
  extraContents?: (comp: BaseComponent, record?: Lookup) => ContentParameter[];

  /**
   * Actions this table has beyond create, edit and delete — a status transition,
   * an approval. They appear both in the list's row menu and on the detail
   * page's header, which is where a reader looking at one record expects them.
   */
  extraActions?: (comp: BaseComponent, lookup: LookupModule) => ActionButton[];
}

/** A config with everything derived from it — what the screens actually consume. */
export interface LookupModule extends LookupConfig {
  gql: LookupOperations;

  /** Notifies the list and the detail page that a record changed. */
  changed$: Subject<Lookup | any>;

  /**
   * The field carrying the public identifier on records of this table: `id` for
   * the core schema, `uid` for uaa.
   */
  idKey: 'id' | 'uid';

  viewPermissions: string[];
  upsertPermissions: string[];
  deletePermissions: string[];
}

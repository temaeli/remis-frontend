import { Subject } from 'rxjs';
import { DocumentNode } from '@apollo/client/core';
import { FieldConfig, FormStepper } from '@shared/components/generic-form/field.interface';
import { StepperOrientation } from '@angular/cdk/stepper';
import { StepperAppearance } from '@shared/components/generic-form/form.interface';
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

  /**
   * Maps the form value onto the mutation input — the reverse of `toModel`.
   *
   * Needed wherever a control does not hand back what the API wants. An upload
   * field's value is the saved attachment, and the column behind it holds a
   * path, so the document register turns one into the other here.
   *
   * Runs before the identifier is renamed, so it sees and returns the form's own
   * shape.
   */
  toInput?: (value: Record<string, any>) => Record<string, any>;

  /**
   * Groups the form's fields into steps, by key.
   *
   * A flat form is right for a table of four columns and wrong for one of
   * twenty: the fields are the same either way, but a wall of them gives no
   * indication of what belongs with what. Supplying this turns the upsert modal
   * into a stepper without changing a single field config.
   *
   * A field whose key is in no step still submits — the form group holds every
   * control regardless — but it renders nowhere, so an omission is a field the
   * user can never fill in.
   */
  formSteppers?: FormStepper[];

  /** Defaults to horizontal. */
  stepperOrientation?: StepperOrientation;

  /** Defaults to 'fill', which replaces the modal's own title bar. */
  stepperAppearance?: StepperAppearance;

  /** Width of the upsert modal. Defaults to 60%; a stepper usually wants more. */
  modalWidth?: string;

  /**
   * Overrides MatDialog's own 80vw ceiling, which otherwise caps `modalWidth`
   * however large it is set. Only worth passing alongside a width above 80%.
   */
  modalMaxWidth?: string;

  /** Caps the modal's height so a long form scrolls inside it rather than off-screen. */
  modalMaxHeight?: string;

  /** Panels appended to the detail page, below the details block. */
  extraContents?: (comp: BaseComponent, record?: Lookup) => ContentParameter[];

  /**
   * Actions this table has beyond create, edit and delete — a status transition,
   * an approval. They appear both in the list's row menu and on the detail
   * page's header, which is where a reader looking at one record expects them.
   */
  extraActions?: (comp: BaseComponent, lookup: LookupModule) => ActionButton[];

  /**
   * Whether a record has reached a state that freezes it — an approved workflow,
   * a signed-off valuation. Something else in the system now depends on it
   * standing still.
   *
   * Disables both **Edit** and **Delete** for that record rather than hiding
   * them, so the reader can see the actions exist and are closed to them; the
   * tooltip says why. Nothing is disabled when the predicate is absent, and a
   * create is never disabled, since there is no record to judge.
   *
   * Mirrors a rule the backend already enforces — it does not replace it. The
   * point is to say so before the round trip rather than after.
   */
  lockedWhen?: (record: Lookup) => boolean;

  /** Tooltip shown on the disabled Edit and Delete. Defaults to a generic sentence. */
  lockedReason?: string;

  /**
   * The same, but confined to the row menu.
   *
   * Use where an action reads as a decision taken on one record picked out of a
   * list rather than a thing the screen itself does — approving a workflow, say.
   * On a header it sits beside Create with nothing saying which record it would
   * act on.
   */
  rowActions?: (comp: BaseComponent, lookup: LookupModule) => ActionButton[];

  /**
   * Buttons for the list page's header only, placed before Create — things the
   * screen does that are about no one record, such as a guided registration.
   * Not shown on a record's own page or in its row menu.
   */
  listActions?: (comp: BaseComponent, lookup: LookupModule) => ActionButton[];

  /**
   * The list page's header shows only {@link listActions}: they replace Create,
   * so there is one way to add a record. Edit is unaffected.
   */
  replaceCreate?: boolean;
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

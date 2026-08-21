import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import {
  getDeleteBtnProps,
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ContentParameter } from '@shared/components/view-component/view-interface';

import { Lookup, LookupModule } from './lookup.interface';

/**
 * The controls for the `assignedNumber`/`name`/`description` triple the core
 * tables repeat. A config whose table is a different shape supplies its own
 * through `baseFields`.
 *
 * `assignedNumber` is optional: leave it blank and the backend generates one, so
 * it is only worth filling in when the number comes from an existing record.
 *
 * The first control is a hidden carrier for the identifier, seeded when editing
 * and left blank when creating. Without it the backend cannot tell an update from
 * a create, and every edit would save as a new record.
 */
export const namedLookupFields = (idKey: 'id' | 'uid' = 'id'): FieldConfig[] => [
  { key: idKey, type: FieldType.input, visible: false },
  {
    key: 'name',
    label: 'Name',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'assignedNumber',
    label: 'Assigned Number',
    type: FieldType.input,
    hint: 'Leave blank to generate automatically',
    class: 'col-span-full',
  },
  {
    key: 'description',
    label: 'Description',
    type: FieldType.textarea,
    rows: 3,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

/** Columns matching {@link namedLookupFields}. */
export const namedLookupColumns: GridKeyColumn[] = [
  'index',
  'assignedNumber',
  'name',
  'description',
];

export const lookupFields = (lookup: LookupModule): FieldConfig[] => [
  ...(lookup.baseFields ?? namedLookupFields(lookup.idKey)),
  ...(lookup.extraFields ?? []),
];

/** The columns a list shows, with the config's own between the base block and `active`. */
export const lookupColumns = (lookup: LookupModule): GridKeyColumn[] => [
  ...(lookup.baseColumns ?? namedLookupColumns),
  ...(lookup.extraColumns ?? []),
  {
    field: 'active',
    valueFn: (row) => (row?.active ? 'Yes' : 'No'),
    valueClassMapper: (row) => (row?.active ? 'text-success' : 'text-danger'),
  },
  'actions',
];

/**
 * Maps a form value onto the mutation input.
 *
 * The input names the identifier `uid` on every one of these controllers — blank
 * creates, populated updates. A uaa record already carries one, so it passes
 * straight through; a core record's identifier is its `id`, which is renamed here,
 * at the single point where the form meets the API.
 */
export const toLookupInput = (lookup: LookupModule, value: Record<string, unknown>) => {
  const { id, ...rest } = value ?? {};
  if (lookup.idKey === 'uid') return rest;
  return id ? { ...rest, uid: id } : rest;
};

export function lookupUpsertBtn(comp: BaseComponent, lookup: LookupModule): ActionButton {
  return {
    click: (data?: Lookup) => {
      const formParameter: FormParameters = {
        model: { ...data, ...lookup.toModel?.(data) },
        title: lookup.label,
        fields: lookupFields(lookup),
        closeAction$: lookup.changed$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toLookupInput(lookup, value) },
            mutation: lookup.gql.save,
            successFn: (res) => lookup.changed$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: lookup.upsertPermissions,
    ...getUpsertBtnProps(lookup.label, lookup.idKey),
    // Only ever true for a record that exists: a create has nothing to judge, so
    // the header's Add stays enabled whatever the predicate says.
    disabledFunction: (data?: Lookup) => isLocked(lookup, data),
    toolTipMapper: (data?: Lookup) => lockedTooltip(lookup, data),
  };
}

/**
 * Whether {@link LookupConfig.lockedWhen} closes this record to change.
 *
 * Guarded on the identifier so it can only ever be true for a record that
 * exists — a create has nothing to judge.
 */
function isLocked(lookup: LookupModule, data?: Lookup): boolean {
  return !!data?.[lookup.idKey] && !!lookup.lockedWhen?.(data);
}

function lockedTooltip(lookup: LookupModule, data?: Lookup): string {
  if (!isLocked(lookup, data)) return '';
  return lookup.lockedReason ?? `This ${lookup.label.toLowerCase()} can no longer be changed`;
}

export function lookupViewBtn(comp: BaseComponent, lookup: LookupModule): ActionButton {
  return {
    icon: 'view',
    label: `View ${lookup.label}`,
    click: (data: Lookup) => navigateRelativeTo(comp, lookup.slug, data?.[lookup.idKey]),
    permissions: lookup.viewPermissions,
  };
}

export function lookupDeleteBtn(comp: BaseComponent, lookup: LookupModule): ActionButton {
  return {
    click: async (data: Lookup) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data?.[lookup.idKey] },
        mutation: lookup.gql.delete,
        successFn: (res) => lookup.changed$.next(res?.data),
      });
    },
    ...getDeleteBtnProps(lookup.label, lookup.nameKey ?? 'name'),
    permissions: lookup.deletePermissions,
    // A frozen record cannot be deleted either — whatever depends on it standing
    // still depends on it existing.
    disabledFunction: (data?: Lookup) => isLocked(lookup, data),
    toolTipMapper: (data?: Lookup) => lockedTooltip(lookup, data),
  };
}

/**
 * The row menu. Carries both kinds of extra action: the ones the header shows
 * too, and the ones confined to a row.
 */
export function lookupTableBtns(comp: BaseComponent, lookup: LookupModule): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        lookupViewBtn(comp, lookup),
        lookupUpsertBtn(comp, lookup),
        ...(lookup.extraActions?.(comp, lookup) ?? []),
        ...(lookup.rowActions?.(comp, lookup) ?? []),
        lookupDeleteBtn(comp, lookup),
      ],
    },
  ];
}

/**
 * The buttons on a page header — the list's and the detail's alike. Create or
 * edit, then whatever else the table can do.
 *
 * Deliberately without {@link LookupConfig.rowActions}: those act on a record
 * the reader picked out of a list, and a header has no record to act on.
 */
export function lookupHeaderBtns(comp: BaseComponent, lookup: LookupModule): ActionButton[] {
  return [lookupUpsertBtn(comp, lookup), ...(lookup.extraActions?.(comp, lookup) ?? [])];
}

/**
 * Enough of a child record to fill a drill-down grid. A panel lists a parent's
 * children, so it does not need the child's own relations back.
 */
export const lookupChildGqlFields = `
  id
  uid: id
  assignedNumber
  name
  description
  active
`;

/** The columns a drill-down grid shows. */
export const lookupChildColumns: GridKeyColumn[] = [
  'index',
  'assignedNumber',
  'name',
  'description',
  'actions',
];

/**
 * A panel listing the records of `child` that belong to the record on screen —
 * the currencies a country issues, the costs of a cost type.
 *
 * `child` is a thunk because the query it pairs with is usually declared below
 * the parent's config; reading it at render time lets a parent point at a child
 * defined after it.
 *
 * `keyColumns` overrides {@link lookupChildColumns} for the panels where the
 * generic code/name/description says too little — a workflow's steps read by
 * their order and the status each confers, not by their descriptions. Pass the
 * matching fields in the query too: a column selects from what was fetched.
 */
export const lookupChildPanel = (
  comp: BaseComponent,
  child: () => LookupModule,
  query: unknown,
  variables: Record<string, unknown>,
  options: { keyColumns?: GridKeyColumn[] } = {},
): ContentParameter => ({
  type: 'table',
  name: child().pluralLabel,
  label: child().pluralLabel,
  icon: child().icon,
  keyColumns: options.keyColumns ?? lookupChildColumns,
  actionButtons: lookupTableBtns(comp, child()),
  reloadActions$: [child().changed$],
  fetchParameter: { query, variables },
});

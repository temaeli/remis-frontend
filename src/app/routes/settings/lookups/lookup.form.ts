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
  };
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
  };
}

export function lookupTableBtns(comp: BaseComponent, lookup: LookupModule): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        lookupViewBtn(comp, lookup),
        lookupUpsertBtn(comp, lookup),
        lookupDeleteBtn(comp, lookup),
      ],
    },
  ];
}

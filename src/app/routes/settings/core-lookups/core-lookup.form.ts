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

import { CoreLookup, CoreLookupModule } from './core-lookup.interface';

/**
 * The controls every one of these tables shares. Each config appends its own —
 * a relation select, an amount, a date range.
 *
 * `assignedNumber` is optional: leave it blank and the backend generates one, so
 * it is only worth filling in when the number comes from an existing record.
 */
export const coreLookupBaseFields = (): FieldConfig[] => [
  // Hidden carrier for the identifier, seeded from `id` when editing and left
  // blank when creating. Without it the backend cannot tell an update from a
  // create, and every edit would save as a new record.
  { key: 'id', type: FieldType.input, visible: false },
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

/** The columns every one of these lists shows, with the config's own in between. */
export const coreLookupColumns = (lookup: CoreLookupModule): GridKeyColumn[] => [
  'index',
  'assignedNumber',
  'name',
  'description',
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
 * The form carries the identifier as `id`, matching the records these screens
 * read. The mutation input still names it `uid` — blank creates, populated
 * updates — so it is renamed here, at the single point where the two meet.
 */
export const toCoreLookupInput = (value: Record<string, unknown>) => {
  const { id, ...rest } = value ?? {};
  return id ? { ...rest, uid: id } : rest;
};

export function coreLookupUpsertBtn(comp: BaseComponent, lookup: CoreLookupModule): ActionButton {
  return {
    click: (data?: CoreLookup) => {
      const formParameter: FormParameters = {
        model: { ...data, ...lookup.toModel?.(data) },
        title: lookup.label,
        fields: [...coreLookupBaseFields(), ...(lookup.extraFields ?? [])],
        closeAction$: lookup.changed$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toCoreLookupInput(value) },
            mutation: lookup.gql.save,
            successFn: (res) => lookup.changed$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: lookup.upsertPermissions,
    ...getUpsertBtnProps(lookup.label),
  };
}

export function coreLookupViewBtn(comp: BaseComponent, lookup: CoreLookupModule): ActionButton {
  return {
    icon: 'view',
    label: `View ${lookup.label}`,
    click: (data: CoreLookup) => navigateRelativeTo(comp, lookup.slug, data?.id),
    permissions: lookup.viewPermissions,
  };
}

export function coreLookupDeleteBtn(comp: BaseComponent, lookup: CoreLookupModule): ActionButton {
  return {
    click: async (data: CoreLookup) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: lookup.gql.delete,
        successFn: (res) => lookup.changed$.next(res?.data),
      });
    },
    ...getDeleteBtnProps(lookup.label, 'name'),
    permissions: lookup.deletePermissions,
  };
}

export function coreLookupTableBtns(comp: BaseComponent, lookup: CoreLookupModule): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        coreLookupViewBtn(comp, lookup),
        coreLookupUpsertBtn(comp, lookup),
        coreLookupDeleteBtn(comp, lookup),
      ],
    },
  ];
}

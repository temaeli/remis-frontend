import { Subject } from 'rxjs';
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

import { SAVE_BUSINESS_NAME, DELETE_BUSINESS_NAME } from './business-name.graphql';
import { BusinessName } from './business-name.interface';

// Listener for all BusinessName actions
export const businessName$ = new Subject<BusinessName | any>();

/**
 * The mutation input still names the identifier `uid`, while these records carry
 * it as `id`. Renamed here, at the one point where the form meets the API.
 */
const toBusinessNameInput = (value: Record<string, unknown>) => {
  const { id, ...rest } = value ?? {};
  return id ? { ...rest, uid: id } : rest;
};

export const getBusinessNameFormFields = (): FieldConfig[] => [
  // Hidden carrier for the identifier: blank creates, populated updates.
  { key: 'id', type: FieldType.input, visible: false },
  {
    key: 'name',
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
    type: FieldType.textarea,
    rows: 3,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'identityTypesId',
    label: 'Identity Type',
    type: FieldType.input,
    hint: 'Identity type id — there is no lookup endpoint for these yet',
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'isPublic',
    label: 'Publicly Visible',
    type: FieldType.toggle,
    value: true,
    class: 'col-span-full',
  },
];

export function businessNameUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: BusinessName) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Business Name',
        fields: getBusinessNameFormFields(),
        closeAction$: businessName$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toBusinessNameInput(value) },
            mutation: SAVE_BUSINESS_NAME,
            successFn: (res) => businessName$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_CREATE_BUSINESS_NAME', 'ROLE_UPDATE_BUSINESS_NAME'],
    ...getUpsertBtnProps('Business Name'),
  };
}

export function businessNameViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Business Name',
    click: (data: BusinessName) => navigateRelativeTo(comp, 'business-names', data?.id),
    permissions: ['ROLE_VIEW_ALL_BUSINESS_NAME', 'ROLE_VIEW_BUSINESS_NAME'],
  };
}

export function businessNameDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: BusinessName) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_BUSINESS_NAME,
        successFn: (res) => businessName$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Business Name', 'name'),
    permissions: ['ROLE_DELETE_BUSINESS_NAME'],
  };
}

export function businessNameTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        businessNameViewBtn(comp),
        businessNameUpsertBtn(comp),
        businessNameDeleteBtn(comp),
      ],
    },
  ];
}

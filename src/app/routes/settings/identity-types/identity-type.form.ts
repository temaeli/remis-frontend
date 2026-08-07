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

import { SAVE_IDENTITY_TYPE, DELETE_IDENTITY_TYPE } from './identity-type.graphql';
import { IdentityType } from './identity-type.interface';

// Listener for all IdentityType actions
export const identityType$ = new Subject<IdentityType | any>();

/**
 * The mutation input still names the identifier `uid`, while these records carry
 * it as `id`. Renamed here, at the one point where the form meets the API.
 */
const toIdentityTypeInput = (value: Record<string, unknown>) => {
  const { id, ...rest } = value ?? {};
  return id ? { ...rest, uid: id } : rest;
};

export const getIdentityTypeFormFields = (): FieldConfig[] => [
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
];

export function identityTypeUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: IdentityType) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Identity Type',
        fields: getIdentityTypeFormFields(),
        closeAction$: identityType$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toIdentityTypeInput(value) },
            mutation: SAVE_IDENTITY_TYPE,
            successFn: (res) => identityType$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_CREATE_IDENTITY_TYPE', 'ROLE_UPDATE_IDENTITY_TYPE'],
    ...getUpsertBtnProps('Identity Type'),
  };
}

export function identityTypeViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Identity Type',
    click: (data: IdentityType) => navigateRelativeTo(comp, 'identity-types', data?.id),
    permissions: ['ROLE_VIEW_ALL_IDENTITY_TYPE', 'ROLE_VIEW_IDENTITY_TYPE'],
  };
}

export function identityTypeDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: IdentityType) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_IDENTITY_TYPE,
        successFn: (res) => identityType$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Identity Type', 'name'),
    permissions: ['ROLE_DELETE_IDENTITY_TYPE'],
  };
}

export function identityTypeTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        identityTypeViewBtn(comp),
        identityTypeUpsertBtn(comp),
        identityTypeDeleteBtn(comp),
      ],
    },
  ];
}

import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getDeleteBtnProps,
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';

import { LandRegistration } from '../asset-registry.interface';
import {
  toAssetRegistryInput,
  assetRegistryBaseFields,
  LAND_REGISTRATION_DELETE_PERMISSIONS,
  LAND_REGISTRATION_UPSERT_PERMISSIONS,
  LAND_REGISTRATION_VIEW_PERMISSIONS,
} from '../asset-registry.form';
import { ALL_ASSETS } from '../asset/asset.graphql';
import { DELETE_LAND_REGISTRATION, SAVE_LAND_REGISTRATION } from './land-registration.graphql';

// Listener for all LandRegistration actions
export const landRegistration$ = new Subject<LandRegistration | any>();

export const getLandRegistrationFormFields = (): FieldConfig[] => [
  ...assetRegistryBaseFields(),
  {
    key: 'assetUid',
    label: 'Asset',
    type: FieldType.select,
    // Every asset is listed, but the backend rejects any whose type is not
    // flagged forLand — the error comes back on submit.
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'id',
      fetchParameter: { query: ALL_ASSETS },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

export function landRegistrationUpsertBtn(comp: BaseComponent, assetUid?: string): ActionButton {
  return {
    click: (data?: LandRegistration) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { assetUid: data?.asset?.id ?? assetUid, ...data },
        title: 'Land Registration',
        fields: getLandRegistrationFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toAssetRegistryInput(value) },
            mutation: SAVE_LAND_REGISTRATION,
            successFn: (res) => {
              landRegistration$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: LAND_REGISTRATION_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Land Registration'),
  };
}

export function landRegistrationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Land Registration',
    click: (data: LandRegistration) => navigateRelativeTo(comp, 'land-registrations', data?.id),
    permissions: LAND_REGISTRATION_VIEW_PERMISSIONS,
  };
}

export function landRegistrationDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: LandRegistration) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_LAND_REGISTRATION,
        finalFn: (res) => landRegistration$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Land Registration', 'name'),
    permissions: LAND_REGISTRATION_DELETE_PERMISSIONS,
  };
}

export function landRegistrationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        landRegistrationViewBtn(comp),
        landRegistrationUpsertBtn(comp),
        landRegistrationDeleteBtn(comp),
      ],
    },
  ];
}

import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldConfig } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getDeleteBtnProps,
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';

import { AssetVerification } from '../asset-registry.interface';
import {
  toAssetRegistryInput,
  assetRegistryBaseFields,
  ASSET_VERIFICATION_DELETE_PERMISSIONS,
  ASSET_VERIFICATION_UPSERT_PERMISSIONS,
  ASSET_VERIFICATION_VIEW_PERMISSIONS,
} from '../asset-registry.form';
import { DELETE_ASSET_VERIFICATION, SAVE_ASSET_VERIFICATION } from './asset-verification.graphql';

// Listener for all AssetVerification actions
export const assetVerification$ = new Subject<AssetVerification | any>();

// No asset picker: the backing table cannot store which asset was verified.
export const getAssetVerificationFormFields = (): FieldConfig[] => [
  ...assetRegistryBaseFields(),
];

export function assetVerificationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: AssetVerification) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Asset Verification',
        fields: getAssetVerificationFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toAssetRegistryInput(value) },
            mutation: SAVE_ASSET_VERIFICATION,
            successFn: (res) => {
              assetVerification$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ASSET_VERIFICATION_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Asset Verification'),
  };
}

export function assetVerificationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Asset Verification',
    click: (data: AssetVerification) =>
      navigateRelativeTo(comp, 'asset-verifications', data?.id),
    permissions: ASSET_VERIFICATION_VIEW_PERMISSIONS,
  };
}

export function assetVerificationDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: AssetVerification) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_ASSET_VERIFICATION,
        finalFn: (res) => assetVerification$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Asset Verification', 'name'),
    permissions: ASSET_VERIFICATION_DELETE_PERMISSIONS,
  };
}

export function assetVerificationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        assetVerificationViewBtn(comp),
        assetVerificationUpsertBtn(comp),
        assetVerificationDeleteBtn(comp),
      ],
    },
  ];
}

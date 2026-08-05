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

import { Asset } from '../asset-registry.interface';
import {
  assetRegistryBaseFields,
  ASSET_DELETE_PERMISSIONS,
  ASSET_STATUS_OPTIONS,
  ASSET_UPSERT_PERMISSIONS,
  ASSET_VIEW_PERMISSIONS,
} from '../asset-registry.form';
import { ALL_ASSET_SUBCATEGORIES } from '../asset-subcategory/asset-subcategory.graphql';
import { DELETE_ASSET, SAVE_ASSET, UPDATE_ASSET_STATUS } from './asset.graphql';

// Listener for all Asset actions
export const asset$ = new Subject<Asset | any>();

export const getAssetFormFields = (): FieldConfig[] => [
  ...assetRegistryBaseFields(),
  {
    key: 'assetSubcategoryUid',
    label: 'Asset Subcategory',
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'uid',
      fetchParameter: { query: ALL_ASSET_SUBCATEGORIES },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'status',
    label: 'Status',
    type: FieldType.select,
    options: ASSET_STATUS_OPTIONS,
    class: 'col-span-full',
  },
  {
    key: 'reserved',
    label: 'Reserved',
    type: FieldType.toggle,
    class: 'col-span-full',
  },
];

export function assetUpsertBtn(comp: BaseComponent, assetSubcategoryUid?: string): ActionButton {
  return {
    click: (data?: Asset) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {
          assetSubcategoryUid: data?.assetSubcategory?.uid ?? assetSubcategoryUid,
          ...data,
        },
        title: 'Asset',
        fields: getAssetFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: SAVE_ASSET,
            successFn: (res) => {
              asset$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ASSET_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Asset'),
  };
}

/**
 * Status change on its own, matching the backend's dedicated `updateAssetStatus`
 * mutation: it keeps the reserved flag in step with the status and records the
 * revision as a status change rather than a full edit.
 */
export function assetStatusBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'sync',
    label: 'Change Status',
    click: (data: Asset) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { status: data?.status },
        title: `Change Status — ${data?.name ?? ''}`,
        fields: [
          {
            key: 'status',
            label: 'Status',
            type: FieldType.select,
            options: ASSET_STATUS_OPTIONS,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { uid: data?.uid, status: value?.status },
            mutation: UPDATE_ASSET_STATUS,
            successFn: (res) => {
              asset$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: ['ROLE_UPDATE_ASSET'],
  };
}

export function assetViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Asset',
    click: (data: Asset) => navigateRelativeTo(comp, 'assets', data?.uid),
    permissions: ASSET_VIEW_PERMISSIONS,
  };
}

export function assetDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: Asset) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_ASSET,
        finalFn: (res) => asset$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Asset', 'name'),
    permissions: ASSET_DELETE_PERMISSIONS,
  };
}

export function assetTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [assetViewBtn(comp), assetUpsertBtn(comp), assetStatusBtn(comp), assetDeleteBtn(comp)],
    },
  ];
}

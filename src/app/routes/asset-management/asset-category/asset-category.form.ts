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

import { AssetCategory } from '../asset-registry.interface';
import {
  assetRegistryBaseFields,
  ASSET_CATEGORY_DELETE_PERMISSIONS,
  ASSET_CATEGORY_UPSERT_PERMISSIONS,
  ASSET_CATEGORY_VIEW_PERMISSIONS,
} from '../asset-registry.form';
import { ALL_ASSET_TYPES } from '../asset-type/asset-type.graphql';
import { DELETE_ASSET_CATEGORY, SAVE_ASSET_CATEGORY } from './asset-category.graphql';

// Listener for all AssetCategory actions
export const assetCategory$ = new Subject<AssetCategory | any>();

export const getAssetCategoryFormFields = (): FieldConfig[] => [
  ...assetRegistryBaseFields(),
  {
    key: 'assetTypeUid',
    label: 'Asset Type',
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'uid',
      fetchParameter: { query: ALL_ASSET_TYPES },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

export function assetCategoryUpsertBtn(comp: BaseComponent, assetTypeUid?: string): ActionButton {
  return {
    click: (data?: AssetCategory) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        // Pre-selects the parent when opened from an asset type's detail page.
        model: { assetTypeUid: data?.assetType?.uid ?? assetTypeUid, ...data },
        title: 'Asset Category',
        fields: getAssetCategoryFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: SAVE_ASSET_CATEGORY,
            successFn: (res) => {
              assetCategory$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ASSET_CATEGORY_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Asset Category'),
  };
}

export function assetCategoryViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Asset Category',
    click: (data: AssetCategory) => navigateRelativeTo(comp, 'asset-categories', data?.uid),
    permissions: ASSET_CATEGORY_VIEW_PERMISSIONS,
  };
}

export function assetCategoryDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: AssetCategory) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_ASSET_CATEGORY,
        finalFn: (res) => assetCategory$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Asset Category', 'name'),
    permissions: ASSET_CATEGORY_DELETE_PERMISSIONS,
  };
}

export function assetCategoryTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        assetCategoryViewBtn(comp),
        assetCategoryUpsertBtn(comp),
        assetCategoryDeleteBtn(comp),
      ],
    },
  ];
}

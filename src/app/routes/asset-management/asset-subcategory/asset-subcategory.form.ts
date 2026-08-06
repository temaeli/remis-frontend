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

import { AssetSubcategory } from '../asset-registry.interface';
import {
  toAssetRegistryInput,
  assetRegistryBaseFields,
  ASSET_SUBCATEGORY_DELETE_PERMISSIONS,
  ASSET_SUBCATEGORY_UPSERT_PERMISSIONS,
  ASSET_SUBCATEGORY_VIEW_PERMISSIONS,
} from '../asset-registry.form';
import { ALL_ASSET_CATEGORIES } from '../asset-category/asset-category.graphql';
import { DELETE_ASSET_SUBCATEGORY, SAVE_ASSET_SUBCATEGORY } from './asset-subcategory.graphql';

// Listener for all AssetSubcategory actions
export const assetSubcategory$ = new Subject<AssetSubcategory | any>();

export const getAssetSubcategoryFormFields = (): FieldConfig[] => [
  ...assetRegistryBaseFields(),
  {
    key: 'assetCategoryUid',
    label: 'Asset Category',
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'id',
      fetchParameter: { query: ALL_ASSET_CATEGORIES },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

export function assetSubcategoryUpsertBtn(
  comp: BaseComponent,
  assetCategoryUid?: string,
): ActionButton {
  return {
    click: (data?: AssetSubcategory) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {
          assetCategoryUid: data?.assetCategory?.id ?? assetCategoryUid,
          ...data,
        },
        title: 'Asset Subcategory',
        fields: getAssetSubcategoryFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toAssetRegistryInput(value) },
            mutation: SAVE_ASSET_SUBCATEGORY,
            successFn: (res) => {
              assetSubcategory$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ASSET_SUBCATEGORY_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Asset Subcategory'),
  };
}

export function assetSubcategoryViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Asset Subcategory',
    click: (data: AssetSubcategory) => navigateRelativeTo(comp, 'asset-subcategories', data?.id),
    permissions: ASSET_SUBCATEGORY_VIEW_PERMISSIONS,
  };
}

export function assetSubcategoryDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: AssetSubcategory) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_ASSET_SUBCATEGORY,
        finalFn: (res) => assetSubcategory$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Asset Subcategory', 'name'),
    permissions: ASSET_SUBCATEGORY_DELETE_PERMISSIONS,
  };
}

export function assetSubcategoryTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        assetSubcategoryViewBtn(comp),
        assetSubcategoryUpsertBtn(comp),
        assetSubcategoryDeleteBtn(comp),
      ],
    },
  ];
}

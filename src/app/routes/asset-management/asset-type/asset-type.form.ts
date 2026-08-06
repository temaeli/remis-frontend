import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getDeleteBtnProps,
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';

import { AssetType } from '../asset-registry.interface';
import {
  toAssetRegistryInput,
  assetRegistryBaseFields,
  ASSET_TYPE_DELETE_PERMISSIONS,
  ASSET_TYPE_UPSERT_PERMISSIONS,
  ASSET_TYPE_VIEW_PERMISSIONS,
} from '../asset-registry.form';
import { DELETE_ASSET_TYPE, SAVE_ASSET_TYPE } from './asset-type.graphql';

// Listener for all AssetType actions
export const assetType$ = new Subject<AssetType | any>();

export const getAssetTypeFormFields = (): FieldConfig[] => [
  ...assetRegistryBaseFields(),
  {
    key: 'forLand',
    label: 'Land Asset Type',
    type: FieldType.toggle,
    value: true,
    hint: 'Only assets under a land type may hold a land registration',
    class: 'col-span-full',
  },
];

export function assetTypeUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: AssetType) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Asset Type',
        fields: getAssetTypeFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toAssetRegistryInput(value) },
            mutation: SAVE_ASSET_TYPE,
            successFn: (res) => {
              assetType$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ASSET_TYPE_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Asset Type'),
  };
}

export function assetTypeViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Asset Type',
    click: (data: AssetType) => navigateRelativeTo(comp, 'asset-types', data?.id),
    permissions: ASSET_TYPE_VIEW_PERMISSIONS,
  };
}

export function assetTypeDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: AssetType) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_ASSET_TYPE,
        finalFn: (res) => assetType$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Asset Type', 'name'),
    permissions: ASSET_TYPE_DELETE_PERMISSIONS,
  };
}

export function assetTypeTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [assetTypeViewBtn(comp), assetTypeUpsertBtn(comp), assetTypeDeleteBtn(comp)],
    },
  ];
}

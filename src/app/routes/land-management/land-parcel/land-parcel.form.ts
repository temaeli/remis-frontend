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

import { DELETE_LAND_PARCEL, REGISTER_LAND_PARCEL, UPDATE_LAND_PARCEL } from './land-parcel.graphql';
import { LandParcel } from './land-parcel.interface';

// Roles declared on LandParcelController @PreAuthorize
export const LAND_PARCEL_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_LAND_PARCEL',
  'ROLE_VIEW_LAND_PARCEL',
];
export const LAND_PARCEL_UPSERT_PERMISSIONS = ['ROLE_CREATE_LAND_PARCEL', 'ROLE_UPDATE_LAND_PARCEL'];
export const LAND_PARCEL_DELETE_PERMISSIONS = ['ROLE_DELETE_LAND_PARCEL'];

//Listener for all LandParcel actions
export const landParcel$ = new Subject<LandParcel | any>();

export const getLandParcelFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'id', type: FieldType.input, visible: false },
  {
    key: 'titleNumber',
    label: 'Title Number',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'location',
    type: FieldType.input,
    class: 'col-span-full',
  },
  {
    key: 'sizeSqm',
    label: 'Size (sqm)',
    type: FieldType.decimal,
    class: 'col-span-full',
  },
];

export function landParcelUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: LandParcel) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Land Parcel',
        fields: getLandParcelFormFields(comp),
        closeAction$: landParcel$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: value?.id ? UPDATE_LAND_PARCEL : REGISTER_LAND_PARCEL,
            successFn: (res) => landParcel$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: LAND_PARCEL_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Land Parcel', 'id'),
  };
}

export function landParcelViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Land Parcel',
    click: (data: LandParcel) => navigateRelativeTo(comp, 'land-parcels', data?.uid),
    permissions: LAND_PARCEL_VIEW_PERMISSIONS,
  };
}

export function landParcelDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: LandParcel) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { id: data.id },
        mutation: DELETE_LAND_PARCEL,
        successFn: (res) => landParcel$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Land Parcel', 'titleNumber'),
    permissions: LAND_PARCEL_DELETE_PERMISSIONS,
  };
}

export function landParcelTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [landParcelViewBtn(comp), landParcelUpsertBtn(comp), landParcelDeleteBtn(comp)],
    },
  ];
}

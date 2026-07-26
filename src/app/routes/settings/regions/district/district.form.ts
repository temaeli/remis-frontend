import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ACTIVATE_DISTRICT, SAVE_DISTRICT } from './district.graphql';
import {
  getUpsertBtnProps,
  navigateRelativeTo,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';

export interface District {
  uid?: string;
  name?: string;
  code?: string;
  region?: { uid?: string; name?: string };
}

// Listener for all District actions
export const district$ = new Subject<District | any>();

export const getDistrictFormFields = (_comp: BaseComponent): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'regionUid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'name',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'code',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

export function districtUpsertBtn(comp: BaseComponent, regionUid?: string): ActionButton {
  return {
    click: (data?: District) => {
      const formParameter: FormParameters = {
        model: { regionUid, ...data },
        title: 'District',
        fields: getDistrictFormFields(comp),
        closeAction$: district$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { districtDto: value },
            mutation: SAVE_DISTRICT,
            successFn: (res) => district$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('District'),
  };
}

export function districtViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View District',
    click: (data: District) => navigateRelativeTo(comp, 'districts', data?.uid),
    permissions: [],
  };
}

export function districtDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: District) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: ACTIVATE_DISTRICT,
        finalFn: (res) => district$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('District', 'name'),
    permissions: [],
  };
}

export function districtTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [districtViewBtn(comp), districtUpsertBtn(comp), districtDeleteBtn(comp)],
    },
  ];
}

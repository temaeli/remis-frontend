import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ACTIVATE_WARD, SAVE_WARD } from './ward.graphql';
import {
  getUpsertBtnProps,
  navigateRelativeTo,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';

export interface Ward {
  uid?: string;
  name?: string;
  code?: string;
}

// Listener for all Ward actions
export const ward$ = new Subject<Ward | any>();

export const getWardFormFields = (_comp: BaseComponent): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'districtUid',
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

export function wardUpsertBtn(comp: BaseComponent, districtUid?: string): ActionButton {
  return {
    click: (data?: Ward) => {
      const formParameter: FormParameters = {
        model: { districtUid, ...data },
        title: 'Ward',
        fields: getWardFormFields(comp),
        closeAction$: ward$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { wardDto: value },
            mutation: SAVE_WARD,
            successFn: (res) => ward$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('Ward'),
  };
}

export function wardViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Ward',
    click: (data: Ward) => navigateRelativeTo(comp, 'wards', data?.uid),
    permissions: [],
  };
}

export function wardDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: Ward) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: ACTIVATE_WARD,
        finalFn: (res) => ward$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Ward', 'name'),
    permissions: [],
  };
}

export function wardTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [wardViewBtn(comp), wardUpsertBtn(comp), wardDeleteBtn(comp)],
    },
  ];
}

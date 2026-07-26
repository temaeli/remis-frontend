import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ACTIVATE_SUB_WARD, SAVE_SUB_WARD } from './subward.graphql';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';

export interface SubWard {
  uid?: string;
  name?: string;
  code?: string;
  ward?: {
    uid?: string;
    name?: string;
    district: { uid?: string; name?: string; region: { uid?: string; name?: string } };
  };
}

// Listener for all Sub-Ward actions
export const subward$ = new Subject<SubWard | any>();

export const getSubwardFormFields = (_comp: BaseComponent): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'wardUid',
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

export function subwardUpsertBtn(comp: BaseComponent, wardUid?: string): ActionButton {
  return {
    click: (data?: SubWard) => {
      const formParameter: FormParameters = {
        model: { wardUid, ...data },
        title: 'Sub-Ward',
        fields: getSubwardFormFields(comp),
        closeAction$: subward$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { subWardDto: value },
            mutation: SAVE_SUB_WARD,
            successFn: (res) => subward$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('Sub-Ward'),
  };
}

export function subwardDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: SubWard) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: ACTIVATE_SUB_WARD,
        finalFn: (res) => subward$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Sub-Ward', 'name'),
    permissions: [],
  };
}

export function subwardTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [subwardUpsertBtn(comp), subwardDeleteBtn(comp)],
    },
  ];
}

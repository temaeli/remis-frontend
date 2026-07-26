import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';

import { SAVE_DEPARTMENT, DELETE_DEPARTMENT } from './department.graphql';
import { Department } from './department.interface';

//Listener for all Department actions
export const department$ = new Subject<Department | any>();

export const getDepartmentFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
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

export function departmentUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: Department) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Department',
        fields: getDepartmentFormFields(comp),
        closeAction$: department$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { dto: value },
            mutation: SAVE_DEPARTMENT,
            successFn: (res) => department$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('Department'),
  };
}

export function departmentViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Department',
    click: (data: Department) => navigateRelativeTo(comp, 'departments', data?.uid),
    permissions: [],
  };
}

export function departmentDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: Department) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_DEPARTMENT,
        successFn: (res) => department$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Department', 'name'),
    permissions: [],
  };
}

export function departmentTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [departmentViewBtn(comp), departmentUpsertBtn(comp), departmentDeleteBtn(comp)],
    },
  ];
}

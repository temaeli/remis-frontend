import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';
import { SAVE_DESIGNATION, DELETE_DESIGNATION } from './designations.graphql';
import { Designation } from './designations.interface';

// Listener for all Designation actions
export const designation$ = new Subject<Designation | any>();

export const getDesignationFormFields = (): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'code',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'title',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

export function designationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: Designation) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Designation',
        fields: getDesignationFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { dto: value },
            mutation: SAVE_DESIGNATION,
            successFn: (res) => {
              designation$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: [],
    ...getUpsertBtnProps('Designation'),
  };
}

export function designationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Designation',
    click: (data: Designation) => navigateRelativeTo(comp, 'designations', data?.uid),
    permissions: [],
  };
}

export function designationDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: Designation) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_DESIGNATION,
        finalFn: (res) => designation$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Designation', 'title'),
    permissions: [],
  };
}

export function designationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [designationViewBtn(comp), designationUpsertBtn(comp), designationDeleteBtn(comp)],
    },
  ];
}

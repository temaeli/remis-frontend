import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  ACTIVATE_OR_DEACTIVATE_PLANT_FORM_GROUP,
  SAVE_OR_UPDATE_PLANT_FORM_GROUP,
} from './plant-form-group.graphql';
import { PlantFormGroup, PlantInputType } from './plant-form-group.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

//Listener for all PlantFormGroup actions
export const plantFormGroup$ = new Subject<PlantFormGroup | any>();

export const getPlantFormGroupFormFields = (comp: BaseComponent): FieldConfig[] => [
  {
    key: 'uid',
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
    key: 'inputType',
    type: FieldType.select,
    options: Object.keys(PlantInputType),
    class: 'col-span-full',
  },
];

export function plantFormGroupUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: PlantFormGroup) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Plant Form Group',
        fields: getPlantFormGroupFormFields(comp),
        closeAction$: plantFormGroup$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { plantFormGroup: value },
            mutation: SAVE_OR_UPDATE_PLANT_FORM_GROUP,
            successFn: (res) => plantFormGroup$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('Plant Form Group'),
  };
}

export function plantFormGroupViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Plant Form Group',
    click: (data: PlantFormGroup) => navigateRelativeTo(comp, 'plant-form-groups', data?.uid),
    permissions: [],
  };
}

export function plantFormGroupDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: PlantFormGroup) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: ACTIVATE_OR_DEACTIVATE_PLANT_FORM_GROUP,
        finalFn: (res) => plantFormGroup$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Plant Form Group', 'name'),
    permissions: [],
  };
}

export function plantFormGroupTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        plantFormGroupViewBtn(comp),
        plantFormGroupUpsertBtn(comp),
        // plantFormGroupDeleteBtn(comp), // don't delege for now
      ],
    },
  ];
}

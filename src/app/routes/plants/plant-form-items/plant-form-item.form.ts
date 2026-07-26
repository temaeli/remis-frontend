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
import { ACTIVATE_OR_DEACTIVATE_PLANT_FORM_ITEM } from './plant-form-item.graphql';
import { SAVE_OR_UPDATE_PLANT_FORM_ITEM } from './plant-form-item.graphql';
import { PlantFormItem, SpecificationType, UnitOfMeasure } from './plant-form-item.interface';
import { GET_ALL_PLANT_FORM_GROUPS } from '../plant-form-groups/plant-form-group.graphql';

//Listener for all PlantFormItem actions
export const plantFormItem$ = new Subject<PlantFormItem | any>();

export const getPlantFormItemFormFields = (
  comp: BaseComponent,
  groupUid?: string,
): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'groupUid',
    type: FieldType.select,
    optionsVariables: { fetchParameter: { query: GET_ALL_PLANT_FORM_GROUPS } },
    visible: !groupUid,
    class: 'col-span-full',
  },
  {
    key: 'name',
    type: FieldType.input,
    validations: [],
    class: 'col-span-full',
  },
  {
    key: 'hasSpecification',
    type: FieldType.checkbox,
    class: 'col-span-full',
  },
  {
    key: 'specificationType',
    type: FieldType.select,
    options: Object.values(SpecificationType).map((value) => ({ label: value, value })),
    showWhen: [{ key: 'hasSpecification' }],
  },
  {
    key: 'minimumValue',
    type: FieldType.decimal,
    showWhen: [{ key: 'hasSpecification' }],
  },
  {
    key: 'maximumValue',
    type: FieldType.decimal,
    showWhen: [{ key: 'hasSpecification' }],
  },
  {
    key: 'unitOfMeasure',
    type: FieldType.select,
    options: Object.values(UnitOfMeasure).map((value) => ({ label: value, value })),
  },
];

export function plantFormItemUpsertBtn(comp: BaseComponent, groupUid?: string): ActionButton {
  return {
    click: (data?: PlantFormItem) => {
      const formParameter: FormParameters = {
        model: { ...data, groupUid },
        title: 'Plant Form Item',
        fields: getPlantFormItemFormFields(comp, groupUid),
        closeAction$: plantFormItem$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { plantFormItem: value },
            mutation: SAVE_OR_UPDATE_PLANT_FORM_ITEM,
            successFn: (res) => plantFormItem$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('Plant Form Item'),
  };
}

export function plantFormItemViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Plant Form Item',
    click: (data: PlantFormItem) => navigateRelativeTo(comp, 'plant-form-items', data?.uid),
    permissions: [],
  };
}

export function plantFormItemDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: PlantFormItem) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: ACTIVATE_OR_DEACTIVATE_PLANT_FORM_ITEM,
        finalFn: (res) => plantFormItem$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Plant Form Item', 'name'),
    permissions: [],
  };
}

export function plantFormItemTableBtns(comp: BaseComponent, groupUid?: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        plantFormItemViewBtn(comp),
        plantFormItemUpsertBtn(comp, groupUid),
        plantFormItemDeleteBtn(comp),
      ],
    },
  ];
}

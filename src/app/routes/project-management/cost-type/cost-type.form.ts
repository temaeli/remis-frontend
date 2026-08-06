import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  getDeleteBtnProps,
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';

import { CostType } from '../project-registry.interface';
import {
  toProjectRegistryInput,
  projectRegistryBaseFields,
  coordinateFields,
  COST_TYPE_DELETE_PERMISSIONS,
  COST_TYPE_UPSERT_PERMISSIONS,
  COST_TYPE_VIEW_PERMISSIONS,
} from '../project-registry.form';
import { DELETE_COST_TYPE, SAVE_COST_TYPE } from './cost-type.graphql';

// Listener for all CostType actions
export const costType$ = new Subject<CostType | any>();

export const getCostTypeFormFields = (): FieldConfig[] => [
  ...projectRegistryBaseFields(),
  {
    key: 'costTypes',
    label: 'Cost Types Value',
    type: FieldType.input,
    inputType: 'number',
    hint: 'Required by the schema, though its meaning is undocumented',
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  ...coordinateFields(),
];

export function costTypeUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: CostType) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Cost Type',
        fields: getCostTypeFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toProjectRegistryInput(value) },
            mutation: SAVE_COST_TYPE,
            successFn: (res) => {
              costType$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: COST_TYPE_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Cost Type'),
  };
}

export function costTypeViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Cost Type',
    click: (data: CostType) => navigateRelativeTo(comp, 'cost-types', data?.id),
    permissions: COST_TYPE_VIEW_PERMISSIONS,
  };
}

export function costTypeDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: CostType) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_COST_TYPE,
        finalFn: (res) => costType$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Cost Type', 'name'),
    permissions: COST_TYPE_DELETE_PERMISSIONS,
  };
}

export function costTypeTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [costTypeViewBtn(comp), costTypeUpsertBtn(comp), costTypeDeleteBtn(comp)],
    },
  ];
}

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

import { Cost } from '../project-registry.interface';
import {
  toProjectRegistryInput,
  projectRegistryBaseFields,
  COST_DELETE_PERMISSIONS,
  COST_UPSERT_PERMISSIONS,
  COST_VIEW_PERMISSIONS,
} from '../project-registry.form';
import { ALL_COST_TYPES } from '../cost-type/cost-type.graphql';
import { DELETE_COST, SAVE_COST } from './cost.graphql';

// Listener for all Cost actions
export const cost$ = new Subject<Cost | any>();

export const getCostFormFields = (): FieldConfig[] => [
  ...projectRegistryBaseFields(),
  {
    key: 'amount',
    label: 'Amount',
    type: FieldType.input,
    inputType: 'number',
    hint: 'The schema records no currency alongside this',
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'costTypeUid',
    label: 'Cost Type',
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'id',
      fetchParameter: { query: ALL_COST_TYPES },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

export function costUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: Cost) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...data, costTypeUid: data?.costType?.id },
        title: 'Cost',
        fields: getCostFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toProjectRegistryInput(value) },
            mutation: SAVE_COST,
            successFn: (res) => {
              cost$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: COST_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Cost'),
  };
}

export function costViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Cost',
    click: (data: Cost) => navigateRelativeTo(comp, 'costs', data?.id),
    permissions: COST_VIEW_PERMISSIONS,
  };
}

export function costDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: Cost) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_COST,
        finalFn: (res) => cost$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Cost', 'name'),
    permissions: COST_DELETE_PERMISSIONS,
  };
}

export function costTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [costViewBtn(comp), costUpsertBtn(comp), costDeleteBtn(comp)],
    },
  ];
}

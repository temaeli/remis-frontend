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

import { RegistryMasterPlan } from '../project-registry.interface';
import {
  toProjectRegistryInput,
  projectRegistryBaseFields,
  coordinateFields,
  MASTER_PLAN_DELETE_PERMISSIONS,
  MASTER_PLAN_UPSERT_PERMISSIONS,
  MASTER_PLAN_VIEW_PERMISSIONS,
} from '../project-registry.form';
import { DELETE_REGISTRY_MASTER_PLAN, SAVE_REGISTRY_MASTER_PLAN } from './master-plan.graphql';

// Listener for all RegistryMasterPlan actions
export const registryMasterPlan$ = new Subject<RegistryMasterPlan | any>();

export const getRegistryMasterPlanFormFields = (): FieldConfig[] => [
  ...projectRegistryBaseFields(),
  {
    key: 'area',
    label: 'Area',
    type: FieldType.input,
    inputType: 'number',
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  ...coordinateFields(),
];

export function registryMasterPlanUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: RegistryMasterPlan) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Master Plan',
        fields: getRegistryMasterPlanFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toProjectRegistryInput(value) },
            mutation: SAVE_REGISTRY_MASTER_PLAN,
            successFn: (res) => {
              registryMasterPlan$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: MASTER_PLAN_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Master Plan'),
  };
}

export function registryMasterPlanViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Master Plan',
    click: (data: RegistryMasterPlan) => navigateRelativeTo(comp, 'master-plans', data?.id),
    permissions: MASTER_PLAN_VIEW_PERMISSIONS,
  };
}

export function registryMasterPlanDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: RegistryMasterPlan) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_REGISTRY_MASTER_PLAN,
        finalFn: (res) => registryMasterPlan$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Master Plan', 'name'),
    permissions: MASTER_PLAN_DELETE_PERMISSIONS,
  };
}

export function registryMasterPlanTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
        buttons: [
        registryMasterPlanViewBtn(comp),
        registryMasterPlanUpsertBtn(comp),
        registryMasterPlanDeleteBtn(comp),
      ],
    },
  ];
}

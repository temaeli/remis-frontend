import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import { getActionPlanFormFields } from '../shared/action-plan.fields';
import {
  CREATE_OR_UPDATE_INSPECTION_ACTION_PLAN,
  DELETE_INSPECTION_ACTION_PLAN,
  GET_INSPECTION_ACTION_PLAN_BY_UID,
  MARK_INSPECTION_CORRECTIVE_ACTION_COMPLETED,
} from './inspection-action-plan.graphql';

export const inspectionActionPlan$ = new Subject<any>();

const MANAGE_PERMS = ['ROLE_EXECUTE_INSPECTION_PLAN'];

export function inspectionActionPlanUpsertBtn(
  comp: BaseComponent,
  inspectionPlanUid: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_INSPECTION_ACTION_PLAN_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Action Plan',
        fields: getActionPlanFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value, inspectionPlanUid },
            mutation: CREATE_OR_UPDATE_INSPECTION_ACTION_PLAN,
            successFn: (res) => {
              inspectionActionPlan$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Action Plan'),
  };
}

export function inspectionActionPlanDeleteBtn(
  comp: BaseComponent,
  inspectionUid: string,
): ActionButton {
  return {
    ...getDeleteBtnProps('Action Plan'),
    permissions: MANAGE_PERMS,
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_INSPECTION_ACTION_PLAN,
        variables: { uid: data.uid, inspectionUid },
        successFn: () => inspectionActionPlan$.next(null),
      });
    },
  };
}

export function inspectionActionPlanMarkCompletedBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Mark Completed',
    color: 'primary',
    toolTip: 'Mark Action Plan as Completed',
    permissions: MANAGE_PERMS,
    showFunction: (row: any) => !!row?.uid && !row?.completedAt,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Complete Action Plan',
        fields: [
          {
            key: 'comment',
            label: 'Completion Comment',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: MARK_INSPECTION_CORRECTIVE_ACTION_COMPLETED,
            variables: { uid: data.uid, comment: value?.comment },
            successFn: () => {
              inspectionActionPlan$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '40%');
    },
  };
}

export function inspectionActionPlanTableBtns(
  comp: BaseComponent,
  inspectionPlanUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        inspectionActionPlanUpsertBtn(comp, inspectionPlanUid),
        inspectionActionPlanMarkCompletedBtn(comp),
        inspectionActionPlanDeleteBtn(comp, inspectionPlanUid),
      ],
    },
  ];
}

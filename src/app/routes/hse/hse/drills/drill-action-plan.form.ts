import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import {
  CREATE_OR_UPDATE_DRILL_ACTION_PLAN,
  DELETE_DRILL_ACTION_PLAN,
  GET_DRILL_ACTION_PLAN_BY_UID,
  MARK_DRILL_CORRECTIVE_ACTION_COMPLETED,
} from './drill.graphql';

export const drillActionPlan$ = new Subject<any>();

function getFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'action',
      label: 'Action',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'assignedToAs',
      label: 'Assigned To As',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'durationInDays',
      label: 'Duration (days)',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      class: 'col-span-full',
      type: FieldType.textarea,
    },
  ];
}

export function drillActionPlanUpsertBtn(comp: BaseComponent, drillPlanUid: string): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_DRILL_ACTION_PLAN_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: { ...(seed ?? {}) },
        title: 'Drill Action Plan',
        fields: getFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_DRILL_ACTION_PLAN,
            variables: { input: value, drillPlanUid },
            successFn: () => {
              drillActionPlan$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '55%');
    },
    permissions: ['ROLE_ENTER_HSE_DRILL_DATA'],
    ...getUpsertBtnProps('Action Plan'),
  };
}

export function drillActionPlanDeleteBtn(comp: BaseComponent, drillUid: string): ActionButton {
  return {
    ...getDeleteBtnProps('Action Plan'),
    permissions: ['ROLE_ENTER_HSE_DRILL_DATA'],
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_DRILL_ACTION_PLAN,
        variables: { uid: data.uid, drillUid },
        successFn: () => drillActionPlan$.next(null),
      });
    },
  };
}

export function drillActionPlanMarkCompletedBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'task_alt',
    label: 'Mark Completed',
    color: 'primary',
    toolTip: 'Mark Corrective Action Completed',
    permissions: ['ROLE_ENTER_HSE_DRILL_DATA'],
    showFunction: (row: any) => !!row?.uid && !row?.completedAt,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Mark Action Completed',
        fields: [
          {
            key: 'comment',
            label: 'Completion Comment',
            class: 'col-span-full',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: MARK_DRILL_CORRECTIVE_ACTION_COMPLETED,
            variables: { uid: data.uid, comment: value?.comment },
            successFn: () => {
              drillActionPlan$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '45%');
    },
  };
}

export function drillActionPlanTableBtns(
  comp: BaseComponent,
  drillPlanUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        drillActionPlanUpsertBtn(comp, drillPlanUid),
        drillActionPlanMarkCompletedBtn(comp),
        drillActionPlanDeleteBtn(comp, drillPlanUid),
      ],
    },
  ];
}

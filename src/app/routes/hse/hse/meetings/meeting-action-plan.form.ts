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
  CREATE_OR_UPDATE_HSE_MEETING_ACTION_PLAN,
  DELETE_HSE_MEETING_ACTION_PLAN,
  GET_HSE_MEETING_ACTION_PLAN_BY_UID,
  MARK_HSE_MEETING_ACTION_PLAN_COMPLETED,
} from './meeting-action-plan.graphql';

export const hseMeetingActionPlan$ = new Subject<any>();

const meetingActive = (meeting: any) => !meeting?.actedBy;

export function hseMeetingActionPlanUpsertBtn(
  comp: BaseComponent,
  meetingUid: string,
  meeting: any,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_HSE_MEETING_ACTION_PLAN_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: { ...(seed ?? {}) },
        title: 'Meeting Action Plan',
        fields: getActionPlanFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_HSE_MEETING_ACTION_PLAN,
            variables: { input: value, meetingUid },
            successFn: () => {
              hseMeetingActionPlan$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '55%');
    },
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
    showFunction: () => meetingActive(meeting),
    ...getUpsertBtnProps('Action Plan'),
  };
}

export function hseMeetingActionPlanDeleteBtn(
  comp: BaseComponent,
  meetingUid: string,
  meeting: any,
): ActionButton {
  return {
    ...getDeleteBtnProps('Action Plan'),
    permissions: ['ROLE_DELETE_HSE_MEETING_ACTION_PLAN'],
    showFunction: () => meetingActive(meeting),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_HSE_MEETING_ACTION_PLAN,
        variables: { uid: data.uid, meetingUid },
        successFn: () => hseMeetingActionPlan$.next(null),
      });
    },
  };
}

export function hseMeetingActionPlanMarkCompletedBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'task_alt',
    label: 'Mark Completed',
    color: 'primary',
    toolTip: 'Mark Action Plan Completed',
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
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
            mutation: MARK_HSE_MEETING_ACTION_PLAN_COMPLETED,
            variables: { uid: data.uid, comment: value?.comment },
            successFn: () => {
              hseMeetingActionPlan$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '45%');
    },
  };
}

export function hseMeetingActionPlanTableBtns(
  comp: BaseComponent,
  meetingUid: string,
  meeting: any,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        hseMeetingActionPlanUpsertBtn(comp, meetingUid, meeting),
        hseMeetingActionPlanMarkCompletedBtn(comp),
        hseMeetingActionPlanDeleteBtn(comp, meetingUid, meeting),
      ],
    },
  ];
}

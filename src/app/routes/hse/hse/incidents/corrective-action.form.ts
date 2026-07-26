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
  CREATE_OR_UPDATE_INCIDENT_CORRECTIVE_ACTION,
  DELETE_INCIDENT_CORRECTIVE_ACTION,
  GET_INCIDENT_CORRECTIVE_ACTION_BY_UID,
  MARK_INCIDENT_CORRECTIVE_ACTION_COMPLETED,
} from './corrective-action.graphql';

export const correctiveAction$ = new Subject<any>();

export const getCorrectiveActionFormFields = getActionPlanFormFields;

export function correctiveActionUpsertBtn(
  comp: BaseComponent,
  incidentUid: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_INCIDENT_CORRECTIVE_ACTION_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Corrective Action',
        fields: getCorrectiveActionFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value, incidentUid },
            mutation: CREATE_OR_UPDATE_INCIDENT_CORRECTIVE_ACTION,
            successFn: (res) => {
              correctiveAction$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: ['ROLE_MANAGE_INCIDENT_CORRECTIVE_ACTION'],
    ...getUpsertBtnProps('Corrective Action'),
  };
}

export function correctiveActionDeleteBtn(comp: BaseComponent, incidentUid: string): ActionButton {
  return {
    ...getDeleteBtnProps('Corrective Action'),
    permissions: ['ROLE_DELETE_INCIDENT_CORRECTIVE_ACTION'],
    showFunction: (row: any) => !row?.completedAt,
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_INCIDENT_CORRECTIVE_ACTION,
        variables: { uid: data.uid, incidentUid },
        successFn: () => correctiveAction$.next(null),
      });
    },
  };
}

export function correctiveActionMarkCompletedBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Mark Completed',
    color: 'primary',
    toolTip: 'Mark Corrective Action as Completed',
    permissions: ['ROLE_MANAGE_INCIDENT_CORRECTIVE_ACTION'],
    showFunction: (row: any) => !!row?.uid && !row?.completedAt,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Complete Corrective Action',
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
            mutation: MARK_INCIDENT_CORRECTIVE_ACTION_COMPLETED,
            variables: { uid: data.uid, comment: value?.comment },
            successFn: () => {
              correctiveAction$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '40%');
    },
  };
}

export function correctiveActionTableBtns(
  comp: BaseComponent,
  incidentUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        correctiveActionUpsertBtn(comp, incidentUid),
        correctiveActionMarkCompletedBtn(comp),
        correctiveActionDeleteBtn(comp, incidentUid),
      ],
    },
  ];
}

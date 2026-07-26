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
import { GET_ALL_USERS_PAGEABLE } from 'app/routes/plants/plants/plant.graphql';
import { SearchOperationType } from '@shared/fetch/fetch.interface';
import {
  CREATE_OR_UPDATE_INSPECTION_ESCALATED_ISSUE,
  DELETE_INSPECTION_ESCALATED_ISSUE,
  GET_INSPECTION_ESCALATED_ISSUE_BY_UID,
  MARK_INSPECTION_ESCALATED_ISSUE_COMPLETED,
} from './inspection-escalated-issue.graphql';

export const inspectionEscalatedIssue$ = new Subject<any>();

const MANAGE_PERMS = ['ROLE_EXECUTE_INSPECTION_PLAN'];

export function getEscalatedIssueFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'escalatedToUid',
      label: 'Escalated To',
      type: FieldType.select,
      // Escalated to must be a staff member — filter `isStaff = true` via the
      // generic search (backend has no dedicated isStaff arg on getAllUsersPageable).
      optionsVariables: {
        fetchParameter: {
          query: GET_ALL_USERS_PAGEABLE,
          variables: {
            active: true,
            pageableParam: {
              size: 1000,
              searchFields: [
                {
                  fieldName: 'isStaff',
                  fieldValue: 'true',
                  searchType: SearchOperationType.Equals,
                },
              ],
            },
          },
        },
      },
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export function inspectionEscalatedIssueUpsertBtn(
  comp: BaseComponent,
  inspectionPlanUid: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_INSPECTION_ESCALATED_ISSUE_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const raw = fresh ?? data;
      const seed = raw
        ? { ...raw, escalatedToUid: raw?.escalatedTo?.uid }
        : {};
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Escalated Issue',
        fields: getEscalatedIssueFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value, inspectionPlanUid },
            mutation: CREATE_OR_UPDATE_INSPECTION_ESCALATED_ISSUE,
            successFn: (res) => {
              inspectionEscalatedIssue$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Escalated Issue'),
  };
}

export function inspectionEscalatedIssueDeleteBtn(
  comp: BaseComponent,
  inspectionUid: string,
): ActionButton {
  return {
    ...getDeleteBtnProps('Escalated Issue'),
    permissions: MANAGE_PERMS,
    showFunction: (row: any) => !row?.completedAt,
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_INSPECTION_ESCALATED_ISSUE,
        variables: { uid: data.uid, inspectionUid },
        successFn: () => inspectionEscalatedIssue$.next(null),
      });
    },
  };
}

export function inspectionEscalatedIssueMarkCompletedBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Mark Completed',
    color: 'primary',
    toolTip: 'Mark Escalated Issue as Completed',
    permissions: MANAGE_PERMS,
    showFunction: (row: any) => !!row?.uid && !row?.completedAt,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Complete Escalated Issue',
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
            mutation: MARK_INSPECTION_ESCALATED_ISSUE_COMPLETED,
            variables: { uid: data.uid, comment: value?.comment },
            successFn: () => {
              inspectionEscalatedIssue$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '40%');
    },
  };
}

export function inspectionEscalatedIssueTableBtns(
  comp: BaseComponent,
  inspectionPlanUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        inspectionEscalatedIssueUpsertBtn(comp, inspectionPlanUid),
        inspectionEscalatedIssueMarkCompletedBtn(comp),
        inspectionEscalatedIssueDeleteBtn(comp, inspectionPlanUid),
      ],
    },
  ];
}

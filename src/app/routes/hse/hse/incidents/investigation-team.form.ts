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
  CREATE_OR_UPDATE_INCIDENT_INVESTIGATION_TEAM_MEMBER,
  DELETE_INCIDENT_INVESTIGATION_TEAM_MEMBER,
  GET_INCIDENT_INVESTIGATION_TEAM_MEMBER_BY_UID,
} from './investigation-team.graphql';

export const investigationTeam$ = new Subject<any>();

export function getInvestigationTeamFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'incidentUid', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'role',
      label: 'Role',
      type: FieldType.select,
      options: [
        { value: 'CHAIRMAN', label: 'Chairman' },
        { value: 'SECRETARY', label: 'Secretary' },
        { value: 'MEMBER', label: 'Member' },
      ],
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

export function investigationTeamUpsertBtn(
  comp: BaseComponent,
  incidentUid: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_INCIDENT_INVESTIGATION_TEAM_MEMBER_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed, incidentUid },
        title: 'Investigation Team Member',
        fields: getInvestigationTeamFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: CREATE_OR_UPDATE_INCIDENT_INVESTIGATION_TEAM_MEMBER,
            successFn: (res) => {
              investigationTeam$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: ['ROLE_MANAGE_INCIDENT_INVESTIGATION_TEAM'],
    ...getUpsertBtnProps('Team Member'),
  };
}

export function investigationTeamDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Team Member'),
    permissions: ['ROLE_DELETE_INCIDENT_INVESTIGATION_TEAM_MEMBER'],
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_INCIDENT_INVESTIGATION_TEAM_MEMBER,
        variables: { uid: data.uid },
        successFn: () => investigationTeam$.next(null),
      });
    },
  };
}

export function investigationTeamTableBtns(
  comp: BaseComponent,
  incidentUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [investigationTeamUpsertBtn(comp, incidentUid), investigationTeamDeleteBtn(comp)],
    },
  ];
}

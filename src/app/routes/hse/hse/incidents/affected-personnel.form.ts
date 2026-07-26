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
  CREATE_OR_UPDATE_INCIDENT_AFFECTED_PERSONNEL,
  DELETE_INCIDENT_AFFECTED_PERSONNEL,
  GET_INCIDENT_AFFECTED_PERSONNEL_BY_UID,
} from './incident.graphql';
import { AffectationType } from './incident.interface';
import { enumToObjectArray } from '@core/helpers';
import { canActOnIncident } from './incident.form';

export const affectedPersonnel$ = new Subject<any>();

export function getAffectedPersonnelFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'incidentUid', type: FieldType.input, visible: false },
    {
      // Affected people are not necessarily system users (backend dropped the
      // personnel/User link), so this is a free-text name.
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'affectationType',
      label: 'Impact Level',
      type: FieldType.select,
      options: enumToObjectArray(AffectationType),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'description',
      label: 'Description / Details',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

export function affectedPersonnelUpsertBtn(
  comp: BaseComponent,
  incidentUid: string,
  getIncident?: () => any,
): ActionButton {
  return {
    ...(getIncident ? { showFunction: () => canActOnIncident(getIncident()) } : {}),
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_INCIDENT_AFFECTED_PERSONNEL_BY_UID,
            variables: { personnelUid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {
          ...seed,
          incidentUid,
        },
        title: 'Affected Personnel',
        fields: getAffectedPersonnelFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: CREATE_OR_UPDATE_INCIDENT_AFFECTED_PERSONNEL,
            successFn: (res) => {
              affectedPersonnel$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: ['ROLE_REPORT_INCIDENT', 'ROLE_UPDATE_INCIDENT'],
    ...getUpsertBtnProps('Personnel'),
  };
}

export function affectedPersonnelDeleteBtn(
  comp: BaseComponent,
  getIncident?: () => any,
): ActionButton {
  return {
    ...getDeleteBtnProps('Personnel'),
    permissions: ['ROLE_REPORT_INCIDENT'],
    ...(getIncident ? { showFunction: () => canActOnIncident(getIncident()) } : {}),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_INCIDENT_AFFECTED_PERSONNEL,
        variables: { uid: data.uid },
        successFn: () => affectedPersonnel$.next(null),
      });
    },
  };
}

export function affectedPersonnelTableBtns(
  comp: BaseComponent,
  incidentUid: string,
  getIncident?: () => any,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        affectedPersonnelUpsertBtn(comp, incidentUid, getIncident),
        affectedPersonnelDeleteBtn(comp, getIncident),
      ],
    },
  ];
}

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
  CREATE_OR_UPDATE_INCIDENT_AFFECTED_ASSET,
  DELETE_INCIDENT_AFFECTED_ASSET,
  GET_INCIDENT_AFFECTED_ASSET_BY_UID,
} from './incident.graphql';
import { AssetImpactLevel } from './incident.interface';
import { enumToObjectArray } from '@core/helpers';
import { canActOnIncident } from './incident.form';

export const affectedAsset$ = new Subject<any>();

export function getAffectedAssetFormFields(): FieldConfig[] {
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
      key: 'specification',
      label: 'Specification',
      type: FieldType.textarea,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'affectationType',
      label: 'Impact Level',
      type: FieldType.select,
      options: enumToObjectArray(AssetImpactLevel),
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

export function affectedAssetUpsertBtn(
  comp: BaseComponent,
  incidentUid: string,
  getIncident?: () => any,
): ActionButton {
  return {
    ...(getIncident ? { showFunction: () => canActOnIncident(getIncident()) } : {}),
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_INCIDENT_AFFECTED_ASSET_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {
          ...seed,
          incidentUid,
        },
        title: 'Affected Asset',
        fields: getAffectedAssetFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: CREATE_OR_UPDATE_INCIDENT_AFFECTED_ASSET,
            successFn: (res) => {
              affectedAsset$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: ['ROLE_REPORT_INCIDENT', 'ROLE_UPDATE_INCIDENT'],
    ...getUpsertBtnProps('Asset'),
  };
}

export function affectedAssetDeleteBtn(
  comp: BaseComponent,
  getIncident?: () => any,
): ActionButton {
  return {
    ...getDeleteBtnProps('Asset'),
    permissions: ['ROLE_REPORT_INCIDENT', 'ROLE_UPDATE_INCIDENT'],
    ...(getIncident ? { showFunction: () => canActOnIncident(getIncident()) } : {}),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_INCIDENT_AFFECTED_ASSET,
        variables: { uid: data.uid },
        successFn: () => affectedAsset$.next(null),
      });
    },
  };
}

export function affectedAssetTableBtns(
  comp: BaseComponent,
  incidentUid: string,
  getIncident?: () => any,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        affectedAssetUpsertBtn(comp, incidentUid, getIncident),
        affectedAssetDeleteBtn(comp, getIncident),
      ],
    },
  ];
}

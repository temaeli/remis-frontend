import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { getDeleteBtnProps, getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import {
  SAVE_CLIENT_INSTALLED_AREA,
  DELETE_CLIENT_INSTALLED_AREA,
} from './client-installed-area.graphql';
import { ClientInstalledArea, ClientInstalledAreaDtoInput } from './client-installed-area.interface';
import { ALL_GAS_INSTALLATIONS } from '../gas-installation/gas-installation.graphql';

export const clientInstalledArea$ = new Subject<ClientInstalledArea | any>();

export function getClientInstalledAreaFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'clientUid', type: FieldType.input, visible: false },
    {
      key: 'gasInstallationUid',
      label: 'Zone',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: { query: ALL_GAS_INSTALLATIONS },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
    {
      key: 'activeConnections',
      label: 'Active Connections',
      type: FieldType.number,
      value: 0,
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'notActiveConnections',
      label: 'Not Active Connections',
      type: FieldType.number,
      value: 0,
      min: 0,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'notes',
      label: 'Notes',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export function clientInstalledAreaUpsertBtn(comp: BaseComponent, clientUid: string): ActionButton {
  return {
    click: (data?: ClientInstalledArea) => {
      const close$ = new Subject<void>();
      const model = { ...(data as any), clientUid, gasInstallationUid: data?.gasInstallation?.uid };
      const formParameter: FormParameters = {
        title: 'Installed Area',
        model,
        fields: getClientInstalledAreaFormFields(),
        closeAction$: close$,
        onSubmit: async (value: ClientInstalledAreaDtoInput) => {
          await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CLIENT_INSTALLED_AREA,
            variables: { dto: { ...value, uid: data?.uid, clientUid } },
            successFn: (res) => {
              clientInstalledArea$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: ['ROLE_CREATE_CLIENT_INSTALLED_AREA', 'ROLE_UPDATE_CLIENT_INSTALLED_AREA'],
    ...getUpsertBtnProps('Installed Area'),
  };
}

export function clientInstalledAreaDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Installed Area'),
    permissions: ['ROLE_DELETE_CLIENT_INSTALLED_AREA'],
    click: async (data?: ClientInstalledArea) => {
      await comp.fs.fetch({
        notify: true,
        mutation: DELETE_CLIENT_INSTALLED_AREA,
        variables: { uid: data?.uid },
        successFn: (res) => clientInstalledArea$.next(res?.data),
      });
    },
  };
}

export function clientInstalledAreaTableBtns(
  comp: BaseComponent,
  clientUid: string,
): ActionButton[] {
  return [clientInstalledAreaUpsertBtn(comp, clientUid), clientInstalledAreaDeleteBtn(comp)];
}

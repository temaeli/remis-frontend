import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { DELETE_GAS_INSTALLATION, SAVE_GAS_INSTALLATION } from './gas-installation.graphql';
import { GasInstallation, GasInstallationDtoInput } from './gas-installation.interface';

// Listener for all Gas Installation actions
export const gasInstallation$ = new Subject<GasInstallation | any>();

export const getGasInstallationFormFields = (): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'name',
    label: 'Name',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'code',
    label: 'Code',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'description',
    label: 'Description',
    type: FieldType.textarea,
    validations: [],
    class: 'col-span-full',
  },
];

export function gasInstallationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'add',
    label: 'New Zone',
    click: () => {
      const formParameter: FormParameters = {
        title: 'Add Zone',
        fields: getGasInstallationFormFields(),
        closeAction$: gasInstallation$,
        onSubmit: async (model: GasInstallation) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_GAS_INSTALLATION,
            variables: { dto: model },
          });
          if (result) {
            gasInstallation$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: [],
  };
}

export function gasInstallationEditBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'edit',
    label: 'Edit Zone',
    click: (data?: GasInstallation) => {
      const formParameter: FormParameters = {
        title: `Edit Zone - ${data?.name}`,
        fields: getGasInstallationFormFields(),
        model: data,
        closeAction$: gasInstallation$,
        onSubmit: async (model: GasInstallationDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_GAS_INSTALLATION,
            variables: { dto: { ...model, uid: data?.uid } },
          });
          if (result) {
            gasInstallation$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: [],
  };
}

export function gasInstallationDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: GasInstallation) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_GAS_INSTALLATION,
        finalFn: (res) => gasInstallation$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Zone', 'name'),
    permissions: [],
  };
}

export function gasInstallationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [gasInstallationEditBtn(comp), gasInstallationDeleteBtn(comp)],
    },
  ];
}

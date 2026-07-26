import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import {
  CrudHost,
  buildApproveBtn,
  buildRejectBtn,
  canSubmit,
  crudHostFromBase,
  defineEntityCrud,
  lookupOptions,
  processStatusFromTimestamps,
} from '@shared/crud';
import { powerGeneratorLookupProvider } from '../power-generators/power-generator.provider';
import {
  APPROVE_POWER_GENERATOR_OPERATION,
  CREATE_POWER_GENERATOR_OPERATION,
  DELETE_POWER_GENERATOR_OPERATION,
  REJECT_POWER_GENERATOR_OPERATION,
  SUBMIT_POWER_GENERATOR_OPERATION,
  UPDATE_POWER_GENERATOR_OPERATION,
} from './operation.graphql';
import { PowerGeneratorOperation } from './operation.interface';

export function getPowerGeneratorOperationFormFields(
  data?: PowerGeneratorOperation | any,
): FieldConfig[] {
  const generatorPrefilled = !!data?.powerGeneratorUid;
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'powerGeneratorUid',
      label: 'Standby Generator',
      type: generatorPrefilled ? FieldType.input : FieldType.select,
      visible: !generatorPrefilled,
      validations: [VALIDATOR_REQUIRED],
      ...(generatorPrefilled
        ? {}
        : { optionsVariables: lookupOptions(powerGeneratorLookupProvider) }),
    },
    { key: 'date', label: 'Date', type: FieldType.date, validations: [], maxDate: new Date() },
    {
      key: 'fuelLevel',
      label: 'Fuel Level After Run (Litres)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'accumulatedRunHours',
      label: 'Total Running Hours (meter reading)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

const operationCrud = defineEntityCrud<PowerGeneratorOperation>({
  name: 'Operation',
  modalTitle: 'Standby Generator Operation',
  routeSlug: 'power-generator-operations',
  fields: (data) => getPowerGeneratorOperationFormFields(data),
  modalWidth: '50%',
  mutations: {
    create: CREATE_POWER_GENERATOR_OPERATION,
    update: UPDATE_POWER_GENERATOR_OPERATION,
    delete: DELETE_POWER_GENERATOR_OPERATION,
  },
  permissions: {
    manage: ['ROLE_MANAGE_POWER_GENERATOR_OPERATION'],
    delete: ['ROLE_DELETE_POWER_GENERATOR_OPERATION'],
    view: ['ROLE_VIEW_POWER_GENERATOR_OPERATION'],
  },
  statusGate: { edit: true, delete: true },
  statusResolver: processStatusFromTimestamps,
  modelMapper: (data: any) => {
    const model: any = { ...(data ?? {}) };
    if (model.powerGenerator && !model.powerGeneratorUid) {
      model.powerGeneratorUid = model.powerGenerator.uid;
    }
    return model;
  },
});

export const powerGeneratorOperation$ = operationCrud.reload$;

export const operationUpsertBtn = (comp: BaseComponent): ActionButton =>
  operationCrud.upsertBtn(crudHostFromBase(comp));

export const operationDeleteBtn = (comp: BaseComponent): ActionButton =>
  operationCrud.deleteBtn(crudHostFromBase(comp));

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Operation',
    permissions: ['ROLE_MANAGE_POWER_GENERATOR_OPERATION'],
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Operation',
      message: 'Are you sure you want to submit this operation?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_POWER_GENERATOR_OPERATION,
        variables: { uid: data.uid },
        successFn: () => powerGeneratorOperation$.next(null),
      });
    },
  };
}

export const operationSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));

export const operationApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_POWER_GENERATOR_OPERATION,
    entityLabel: 'Operation',
    permission: 'ROLE_APPROVE_POWER_GENERATOR_OPERATION',
    onSuccess: () => powerGeneratorOperation$.next(null),
    gateCreator: true,
  });

export const operationRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_POWER_GENERATOR_OPERATION,
    entityLabel: 'Standby Generator Operation',
    permission: 'ROLE_APPROVE_POWER_GENERATOR_OPERATION',
    onSuccess: () => powerGeneratorOperation$.next(null),
    gateCreator: true,
  });

export const operationTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return operationCrud.tableBtns(host, [
    operationSubmitBtn(comp),
    operationApproveBtn(comp),
    operationRejectBtn(comp),
  ]);
};

export const operationUpsertBtnForGenerator = (
  comp: BaseComponent,
  powerGeneratorUid: string,
): ActionButton => {
  const base = operationCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: (data?: any) => {
      const isCreate = !data?.uid;
      const seed = isCreate ? { ...(data ?? {}), powerGeneratorUid } : data;
      originalClick?.(seed);
    },
  };
};

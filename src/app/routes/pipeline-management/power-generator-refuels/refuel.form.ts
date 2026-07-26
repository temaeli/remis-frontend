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
import { GET_ALL_POWER_GENERATOR_TANKS } from '../fuel-tanks/tank.graphql';
import {
  APPROVE_EQUIPMENT_REFUEL,
  CREATE_EQUIPMENT_REFUEL,
  DELETE_EQUIPMENT_REFUEL,
  REJECT_EQUIPMENT_REFUEL,
  SUBMIT_EQUIPMENT_REFUEL,
  UPDATE_EQUIPMENT_REFUEL,
} from './refuel.graphql';
import { PowerGeneratorRefuel } from './refuel.interface';

const EQUIPMENT_TYPE_OPTIONS = [
  { label: 'Standby Generator', value: 'POWER_GENERATOR' },
  { label: 'Motor Vehicle', value: 'MOTOR_VEHICLE' },
  { label: 'Mobile Equipment', value: 'MOBILE_EQUIPMENT' },
  { label: 'Other', value: 'OTHER' },
];

export function getPowerGeneratorRefuelFormFields(data?: PowerGeneratorRefuel | any): FieldConfig[] {
  const lockedGeneratorUid: string | undefined = data?.powerGeneratorUid;
  const generatorPrefilled = !!lockedGeneratorUid;
  // When a generator is pre-seeded (from Standby Generator detail's Daily Tank Refuels
  // header button), lock equipmentType to POWER_GENERATOR too.
  const typePrefilled = generatorPrefilled;

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'equipmentType',
      label: 'Equipment Type',
      type: FieldType.select,
      visible: !typePrefilled,
      validations: [VALIDATOR_REQUIRED],
      options: EQUIPMENT_TYPE_OPTIONS,
    },
    {
      key: 'powerGeneratorUid',
      label: 'Standby Generator',
      type: generatorPrefilled ? FieldType.input : FieldType.select,
      visible: !generatorPrefilled,
      validations: [VALIDATOR_REQUIRED],
      showWhen: generatorPrefilled
        ? undefined
        : [{ key: 'equipmentType', checker: (v: any) => v === 'POWER_GENERATOR' }],
      ...(generatorPrefilled
        ? {}
        : { optionsVariables: lookupOptions(powerGeneratorLookupProvider) }),
    },
    {
      key: 'powerGeneratorTankUid',
      label: 'Tank',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      showWhen: typePrefilled
        ? undefined
        : [{ key: 'equipmentType', checker: (v: any) => !!v }],
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'uid',
        fetchParameter: { query: GET_ALL_POWER_GENERATOR_TANKS, variables: { active: true } },
      },
    },
    { key: 'date', label: 'Date', type: FieldType.date, validations: [], maxDate: new Date() },
    {
      key: 'quantityInLitres',
      label: 'Quantity (Litres)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      hint: 'For non-generator equipment, include vehicle registration or equipment identifier here.',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

const refuelCrud = defineEntityCrud<PowerGeneratorRefuel>({
  name: 'Refuel',
  modalTitle: 'Equipment Refuel',
  routeSlug: 'equipment-refuels',
  fields: (data) => getPowerGeneratorRefuelFormFields(data),
  modalWidth: '50%',
  mutations: {
    create: CREATE_EQUIPMENT_REFUEL,
    update: UPDATE_EQUIPMENT_REFUEL,
    delete: DELETE_EQUIPMENT_REFUEL,
  },
  permissions: {
    manage: ['ROLE_MANAGE_EQUIPMENT_REFUEL'],
    delete: ['ROLE_DELETE_EQUIPMENT_REFUEL'],
    view: ['ROLE_VIEW_EQUIPMENT_REFUEL'],
  },
  statusGate: { edit: true, delete: true },
  statusResolver: processStatusFromTimestamps,
  modelMapper: (data: any) => {
    const model: any = { ...(data ?? {}) };
    if (model.powerGenerator && !model.powerGeneratorUid) {
      model.powerGeneratorUid = model.powerGenerator.uid;
    }
    if (model.generatorTank && !model.powerGeneratorTankUid) {
      model.powerGeneratorTankUid = model.generatorTank.uid;
    }
    return model;
  },
});

export const powerGeneratorRefuel$ = refuelCrud.reload$;

export const refuelUpsertBtn = (comp: BaseComponent): ActionButton =>
  refuelCrud.upsertBtn(crudHostFromBase(comp));

export const refuelDeleteBtn = (comp: BaseComponent): ActionButton =>
  refuelCrud.deleteBtn(crudHostFromBase(comp));

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Refuel',
    permissions: ['ROLE_MANAGE_EQUIPMENT_REFUEL'],
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Refuel',
      message: 'Are you sure you want to submit this refuel?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_EQUIPMENT_REFUEL,
        variables: { uid: data.uid },
        successFn: () => powerGeneratorRefuel$.next(null),
      });
    },
  };
}

export const refuelSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));

export const refuelApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_EQUIPMENT_REFUEL,
    entityLabel: 'Refuel',
    permission: 'ROLE_APPROVE_EQUIPMENT_REFUEL',
    onSuccess: () => powerGeneratorRefuel$.next(null),
    gateCreator: true,
  });

export const refuelRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_EQUIPMENT_REFUEL,
    entityLabel: 'Equipment Refuel',
    permission: 'ROLE_APPROVE_EQUIPMENT_REFUEL',
    onSuccess: () => powerGeneratorRefuel$.next(null),
    gateCreator: true,
  });

export const refuelTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return refuelCrud.tableBtns(host, [
    refuelSubmitBtn(comp),
    refuelApproveBtn(comp),
    refuelRejectBtn(comp),
  ]);
};

/**
 * Refuel upsert button bound to a specific generator. Hides+seeds the
 * generator field; tank lookup runs in locked-generator mode.
 */
export const refuelUpsertBtnForGenerator = (
  comp: BaseComponent,
  powerGeneratorUid: string,
): ActionButton => {
  const base = refuelCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: (data?: any) => {
      const isCreate = !data?.uid;
      const seed = isCreate
        ? { ...(data ?? {}), powerGeneratorUid, equipmentType: 'POWER_GENERATOR' }
        : data;
      originalClick?.(seed);
    },
  };
};

/**
 * Refuel upsert button bound to a specific tank. Pre-seeds
 * powerGeneratorTankUid so the modal opens with the tank already chosen;
 * user still picks equipmentType and (for POWER_GENERATOR) the generator.
 */
export const refuelUpsertBtnForTank = (
  comp: BaseComponent,
  powerGeneratorTankUid: string,
): ActionButton => {
  const base = refuelCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: (data?: any) => {
      const isCreate = !data?.uid;
      const seed = isCreate ? { ...(data ?? {}), powerGeneratorTankUid } : data;
      originalClick?.(seed);
    },
  };
};

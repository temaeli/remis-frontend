import { BehaviorSubject, Subject } from 'rxjs';
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
import { workingStationLookupProvider } from '../working-stations/working-station.provider';
import { GET_FUEL_TANKS_BY_WORKSTATION } from '../fuel-tanks/tank.graphql';
import {
  APPROVE_GENERATOR_TANK_REFUEL,
  CREATE_GENERATOR_TANK_REFUEL,
  DELETE_GENERATOR_TANK_REFUEL,
  REJECT_GENERATOR_TANK_REFUEL,
  SUBMIT_GENERATOR_TANK_REFUEL,
  UPDATE_GENERATOR_TANK_REFUEL,
} from './tank-refuel.graphql';
import { GeneratorTankRefuel } from './tank-refuel.interface';

export function getGeneratorTankRefuelFormFields(
  data?: GeneratorTankRefuel | any,
): FieldConfig[] {
  const lockedTankUid: string | undefined = data?.powerGeneratorTankUid;
  const tankPrefilled = !!lockedTankUid;

  const workingStationUid$ = new BehaviorSubject<string | null>(
    data?.workingStationUid ?? data?.generatorTank?.workingStation?.uid ?? null,
  );

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'workingStationUid',
      label: 'Working Station',
      type: FieldType.select,
      ignoreOnSubmit: true,
      visible: !tankPrefilled,
      validations: tankPrefilled ? [] : [VALIDATOR_REQUIRED],
      optionsVariables: lookupOptions(workingStationLookupProvider),
      onChange: (value: string, form: any) => {
        workingStationUid$.next(value ?? null);
        form?.get('powerGeneratorTankUid')?.reset();
      },
    },
    {
      key: 'powerGeneratorTankUid',
      label: 'Tank',
      type: tankPrefilled ? FieldType.input : FieldType.select,
      visible: !tankPrefilled,
      validations: [VALIDATOR_REQUIRED],
      ...(tankPrefilled
        ? {}
        : {
            showWhen: [{ key: 'workingStationUid', checker: (v: any) => !!v }],
            optionsVariables: {
              labelKey: 'name',
              valueKey: 'uid',
              fetchParameter: {
                query: GET_FUEL_TANKS_BY_WORKSTATION,
                variables: { generatorUid: workingStationUid$, active: true },
              },
            },
          }),
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
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

const tankRefuelCrud = defineEntityCrud<GeneratorTankRefuel>({
  name: 'Main Tank Refuel',
  modalTitle: 'Generator Main Tank Refuel',
  routeSlug: 'generator-tank-refuels',
  fields: (data) => getGeneratorTankRefuelFormFields(data),
  modalWidth: '50%',
  mutations: {
    create: CREATE_GENERATOR_TANK_REFUEL,
    update: UPDATE_GENERATOR_TANK_REFUEL,
    delete: DELETE_GENERATOR_TANK_REFUEL,
  },
  permissions: {
    manage: ['ROLE_MANAGE_GENERATOR_TANK_REFUEL'],
    delete: ['ROLE_DELETE_GENERATOR_TANK_REFUEL'],
    view: ['ROLE_VIEW_GENERATOR_TANK_REFUEL'],
  },
  statusGate: { edit: true, delete: true },
  statusResolver: processStatusFromTimestamps,
  modelMapper: (data: any) => {
    const model: any = { ...(data ?? {}) };
    if (model.generatorTank && !model.powerGeneratorTankUid) {
      model.powerGeneratorTankUid = model.generatorTank.uid;
    }
    if (model.generatorTank?.workingStation && !model.workingStationUid) {
      model.workingStationUid = model.generatorTank.workingStation.uid;
    }
    return model;
  },
});

export const generatorTankRefuel$ = tankRefuelCrud.reload$;

export const tankRefuelUpsertBtn = (comp: BaseComponent): ActionButton =>
  tankRefuelCrud.upsertBtn(crudHostFromBase(comp));

export const tankRefuelDeleteBtn = (comp: BaseComponent): ActionButton =>
  tankRefuelCrud.deleteBtn(crudHostFromBase(comp));

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Main Tank Refuel',
    permissions: ['ROLE_MANAGE_GENERATOR_TANK_REFUEL'],
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Main Tank Refuel',
      message: 'Are you sure you want to submit this main tank refuel?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_GENERATOR_TANK_REFUEL,
        variables: { uid: data.uid },
        successFn: () => generatorTankRefuel$.next(null),
      });
    },
  };
}

export const tankRefuelSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));

export const tankRefuelApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_GENERATOR_TANK_REFUEL,
    entityLabel: 'Main Tank Refuel',
    permission: 'ROLE_APPROVE_GENERATOR_TANK_REFUEL',
    onSuccess: () => generatorTankRefuel$.next(null),
    gateCreator: true,
  });

export const tankRefuelRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_GENERATOR_TANK_REFUEL,
    entityLabel: 'Main Tank Refuel',
    permission: 'ROLE_APPROVE_GENERATOR_TANK_REFUEL',
    onSuccess: () => generatorTankRefuel$.next(null),
    gateCreator: true,
  });

export const tankRefuelTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return tankRefuelCrud.tableBtns(host, [
    tankRefuelSubmitBtn(comp),
    tankRefuelApproveBtn(comp),
    tankRefuelRejectBtn(comp),
  ]);
};

/**
 * Tank refuel upsert button bound to a specific tank. Hides+seeds the tank+generator
 * fields; useful from a tank-scoped tab.
 */
export const tankRefuelUpsertBtnForTank = (
  comp: BaseComponent,
  powerGeneratorTankUid: string,
): ActionButton => {
  const base = tankRefuelCrud.upsertBtn(crudHostFromBase(comp));
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

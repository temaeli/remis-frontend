import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { workingStationLookupProvider } from '../working-stations/working-station.provider';
import {
  CREATE_POWER_GENERATOR_TANK,
  DELETE_POWER_GENERATOR_TANK,
  UPDATE_POWER_GENERATOR_TANK,
} from './tank.graphql';
import { PowerGeneratorTank } from './tank.interface';

export function getPowerGeneratorTankFormFields(data?: PowerGeneratorTank | any): FieldConfig[] {
  const workingStationPrefilled = !!data?.workingStationUid;
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'workingStationUid',
      label: 'Working Station',
      type: workingStationPrefilled ? FieldType.input : FieldType.select,
      visible: !workingStationPrefilled,
      validations: [VALIDATOR_REQUIRED],
      ...(workingStationPrefilled
        ? {}
        : { optionsVariables: lookupOptions(workingStationLookupProvider) }),
    },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'capacityInLitres',
      label: 'Capacity (Litres)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'minimumVolume',
      label: 'Minimum Volume (L)',
      type: FieldType.decimal,
      hint: 'Must be less than capacity',
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

const tankCrud = defineEntityCrud<PowerGeneratorTank>({
  name: 'Fuel Tank',
  modalTitle: 'Fuel Tank',
  fields: (data) => getPowerGeneratorTankFormFields(data),
  modalWidth: '40%',
  mutations: {
    create: CREATE_POWER_GENERATOR_TANK,
    update: UPDATE_POWER_GENERATOR_TANK,
    delete: DELETE_POWER_GENERATOR_TANK,
  },
  permissions: {
    manage: ['ROLE_MANAGE_POWER_GENERATOR_TANK'],
    delete: ['ROLE_DELETE_POWER_GENERATOR_TANK'],
    view: ['ROLE_VIEW_POWER_GENERATOR_TANK'],
  },
  modelMapper: (data: any) => {
    const model: any = { ...(data ?? {}) };
    if (model.workingStation && !model.workingStationUid) {
      model.workingStationUid = model.workingStation.uid;
    }
    return model;
  },
});

export const powerGeneratorTank$ = tankCrud.reload$;

export const tankUpsertBtn = (comp: BaseComponent): ActionButton =>
  tankCrud.upsertBtn(crudHostFromBase(comp));

export const tankDeleteBtn = (comp: BaseComponent): ActionButton =>
  tankCrud.deleteBtn(crudHostFromBase(comp));

export const tankTableBtns = (comp: BaseComponent): ActionButton[] =>
  tankCrud.tableBtns(crudHostFromBase(comp));

/**
 * Tank upsert button bound to a specific working station. Used on the Working
 * Station detail Fuel Tanks tab — seeds workingStationUid so the field stays
 * hidden in the modal. Same button is also reused for row-click edits from
 * the same context.
 */
export const tankUpsertBtnForWorkingStation = (
  comp: BaseComponent,
  workingStationUid: string,
): ActionButton => {
  const base = tankCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: (data?: any) => {
      const isCreate = !data?.uid;
      const seed = isCreate ? { ...(data ?? {}), workingStationUid } : data;
      originalClick?.(seed);
    },
  };
};

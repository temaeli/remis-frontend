import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { UNIT_OF_MEASURE_OPTIONS } from '../shared/unit-of-measure';
import { CREATE_OR_UPDATE_ENERGY_USE, DELETE_ENERGY_USE } from './energy-use.graphql';
import { EnergyUse } from './energy-use.interface';

export function getEnergyUseFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'unitOfMeasure',
      label: 'Unit of Measure',
      type: FieldType.select,
      options: UNIT_OF_MEASURE_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'description',
      label: 'Description',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

const energyUseCrud = defineEntityCrud<EnergyUse>({
  name: 'Energy Use',
  routeSlug: 'energy-uses',
  fields: getEnergyUseFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_ENERGY_USE,
    update: CREATE_OR_UPDATE_ENERGY_USE,
    delete: DELETE_ENERGY_USE,
  },
  permissions: {
    manage: ['ROLE_MANAGE_ENERGY_USE'],
    delete: ['ROLE_DELETE_ENERGY_USE'],
    view: ['ROLE_VIEW_ENERGY_USE'],
  },
});

export const energyUse$ = energyUseCrud.reload$;

export const energyUseUpsertBtn = (comp: BaseComponent): ActionButton =>
  energyUseCrud.upsertBtn(crudHostFromBase(comp));

export const energyUseDeleteBtn = (comp: BaseComponent): ActionButton =>
  energyUseCrud.deleteBtn(crudHostFromBase(comp));

export const energyUseTableBtns = (comp: BaseComponent): ActionButton[] =>
  energyUseCrud.tableBtns(crudHostFromBase(comp));

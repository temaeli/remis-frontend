import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { UNIT_OF_MEASURE_OPTIONS } from '../shared/unit-of-measure';
import { energyUseLookupProvider } from '../energy-uses/energy-use.provider';
import {
  CREATE_OR_UPDATE_EMISSION_SUBSTANCE,
  DELETE_EMISSION_SUBSTANCE,
} from './emission-substance.graphql';
import { EmissionSubstance } from './emission-substance.interface';

export function getEmissionSubstanceFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'energyUseUid',
      label: 'Energy Use',
      type: FieldType.select,
      optionsVariables: lookupOptions(energyUseLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'unitOfMeasure',
      label: 'Unit of Measure',
      type: FieldType.select,
      options: UNIT_OF_MEASURE_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'conversionFactor',
      label: 'Conversion Factor',
      type: FieldType.decimal,
      decimals: 4,
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

const emissionSubstanceCrud = defineEntityCrud<EmissionSubstance>({
  name: 'Emission Substance',
  routeSlug: 'emission-substances',
  fields: getEmissionSubstanceFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_EMISSION_SUBSTANCE,
    update: CREATE_OR_UPDATE_EMISSION_SUBSTANCE,
    delete: DELETE_EMISSION_SUBSTANCE,
  },
  permissions: {
    manage: ['ROLE_MANAGE_EMISSION_SUBSTANCE'],
    delete: ['ROLE_DELETE_EMISSION_SUBSTANCE'],
    view: ['ROLE_VIEW_EMISSION_SUBSTANCE'],
  },
  modelMapper: (data?: EmissionSubstance) => ({
    ...(data ?? {}),
    energyUseUid: data?.energyUse?.uid,
  }),
});

export const emissionSubstance$ = emissionSubstanceCrud.reload$;

export const emissionSubstanceUpsertBtn = (comp: BaseComponent): ActionButton =>
  emissionSubstanceCrud.upsertBtn(crudHostFromBase(comp));

export const emissionSubstanceDeleteBtn = (comp: BaseComponent): ActionButton =>
  emissionSubstanceCrud.deleteBtn(crudHostFromBase(comp));

export const emissionSubstanceTableBtns = (comp: BaseComponent): ActionButton[] =>
  emissionSubstanceCrud.tableBtns(crudHostFromBase(comp));

export function emissionSubstanceUpsertBtnForEnergyUse(
  comp: BaseComponent,
  energyUseUid: string,
): ActionButton {
  const btn = emissionSubstanceCrud.upsertBtn(crudHostFromBase(comp));
  return {
    ...btn,
    click: () => (btn.click as any)?.({ energyUse: { uid: energyUseUid } }),
  };
}

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { SAVE_CNG_LOOKUP, DELETE_CNG_LOOKUP } from './cng-lookup.graphql';
import { CngLookup, CngLookupType } from './cng-station.interface';

function getCngLookupFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'symbol', label: 'Symbol', type: FieldType.input, validations: [] },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

function buildCngLookupCrud(lookupType: CngLookupType, name: string) {
  return defineEntityCrud<CngLookup>({
    name,
    fields: getCngLookupFormFields(),
    modalWidth: '50%',
    mutations: {
      create: SAVE_CNG_LOOKUP,
      update: SAVE_CNG_LOOKUP,
      delete: DELETE_CNG_LOOKUP,
    },
    upsertVariables: (value) => ({ dto: { ...value, lookupType } }),
    permissions: {
      manage: ['ROLE_CREATE_CNG_LOOKUP', 'ROLE_UPDATE_CNG_LOOKUP'],
      delete: ['ROLE_DELETE_CNG_LOOKUP'],
    },
  });
}

const cngEquipmentTypeCrud = buildCngLookupCrud(CngLookupType.EQUIPMENT_TYPE, 'Equipment Type');
const cngCapacityUnitCrud = buildCngLookupCrud(CngLookupType.CAPACITY_UNIT, 'Capacity Unit');

export const cngEquipmentType$ = cngEquipmentTypeCrud.reload$;
export const cngCapacityUnit$ = cngCapacityUnitCrud.reload$;

export const cngEquipmentTypeUpsertBtn = (comp: BaseComponent): ActionButton =>
  cngEquipmentTypeCrud.upsertBtn(crudHostFromBase(comp));
export const cngEquipmentTypeTableBtns = (comp: BaseComponent): ActionButton[] =>
  cngEquipmentTypeCrud.tableBtns(crudHostFromBase(comp));

export const cngCapacityUnitUpsertBtn = (comp: BaseComponent): ActionButton =>
  cngCapacityUnitCrud.upsertBtn(crudHostFromBase(comp));
export const cngCapacityUnitTableBtns = (comp: BaseComponent): ActionButton[] =>
  cngCapacityUnitCrud.tableBtns(crudHostFromBase(comp));

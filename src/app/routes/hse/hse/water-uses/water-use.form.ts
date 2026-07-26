import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { CREATE_OR_UPDATE_WATER_USE, DELETE_WATER_USE } from './water-use.graphql';
import { WaterUse } from './water-use.interface';

export function getWaterUseFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'description',
      label: 'Description',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

const waterUseCrud = defineEntityCrud<WaterUse>({
  name: 'Water Use',
  routeSlug: 'water-uses',
  fields: getWaterUseFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_WATER_USE,
    update: CREATE_OR_UPDATE_WATER_USE,
    delete: DELETE_WATER_USE,
  },
  permissions: {
    manage: ['ROLE_MANAGE_WATER_USE'],
    delete: ['ROLE_DELETE_WATER_USE'],
    view: ['ROLE_VIEW_WATER_USE'],
  },
});

export const waterUse$ = waterUseCrud.reload$;

export const waterUseUpsertBtn = (comp: BaseComponent): ActionButton =>
  waterUseCrud.upsertBtn(crudHostFromBase(comp));

export const waterUseDeleteBtn = (comp: BaseComponent): ActionButton =>
  waterUseCrud.deleteBtn(crudHostFromBase(comp));

export const waterUseTableBtns = (comp: BaseComponent): ActionButton[] =>
  waterUseCrud.tableBtns(crudHostFromBase(comp));

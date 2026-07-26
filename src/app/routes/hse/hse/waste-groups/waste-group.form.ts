import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import {
  CREATE_OR_UPDATE_WASTE_GROUP,
  DELETE_WASTE_GROUP,
} from './waste-group.graphql';
import { WasteGroup } from './waste-group.interface';

export function getWasteGroupFormFields(): FieldConfig[] {
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

const wasteGroupCrud = defineEntityCrud<WasteGroup>({
  name: 'Waste Group',
  routeSlug: 'waste-groups',
  fields: getWasteGroupFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_WASTE_GROUP,
    update: CREATE_OR_UPDATE_WASTE_GROUP,
    delete: DELETE_WASTE_GROUP,
  },
  permissions: {
    manage: ['ROLE_MANAGE_WASTE_GROUP'],
    delete: ['ROLE_DELETE_WASTE_GROUP'],
    view: ['ROLE_VIEW_WASTE_GROUP'],
  },
});

export const wasteGroup$ = wasteGroupCrud.reload$;

export const wasteGroupUpsertBtn = (comp: BaseComponent): ActionButton =>
  wasteGroupCrud.upsertBtn(crudHostFromBase(comp));

export const wasteGroupDeleteBtn = (comp: BaseComponent): ActionButton =>
  wasteGroupCrud.deleteBtn(crudHostFromBase(comp));

export const wasteGroupTableBtns = (comp: BaseComponent): ActionButton[] =>
  wasteGroupCrud.tableBtns(crudHostFromBase(comp));

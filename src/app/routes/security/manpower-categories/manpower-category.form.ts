import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import {
  CREATE_MANPOWER_CATEGORY,
  DELETE_MANPOWER_CATEGORY,
  UPDATE_MANPOWER_CATEGORY,
} from './manpower-category.graphql';
import { ManpowerCategory } from './manpower-category.interface';

export function getManpowerCategoryFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'description',
      label: 'Description',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

const manpowerCategoryCrud = defineEntityCrud<ManpowerCategory>({
  name: 'Manpower Category',
  routeSlug: 'manpower-categories',
  fields: getManpowerCategoryFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_MANPOWER_CATEGORY,
    update: UPDATE_MANPOWER_CATEGORY,
    delete: DELETE_MANPOWER_CATEGORY,
  },
  permissions: {
    manage: ['ROLE_MANAGE_MANPOWER_CATEGORY'],
    delete: ['ROLE_DELETE_MANPOWER_CATEGORY'],
    view: ['ROLE_VIEW_MANPOWER_CATEGORY'],
  },
});

export const manpowerCategory$ = manpowerCategoryCrud.reload$;

export const manpowerCategoryUpsertBtn = (comp: BaseComponent): ActionButton =>
  manpowerCategoryCrud.upsertBtn(crudHostFromBase(comp));

export const manpowerCategoryDeleteBtn = (comp: BaseComponent): ActionButton =>
  manpowerCategoryCrud.deleteBtn(crudHostFromBase(comp));

export const manpowerCategoryTableBtns = (comp: BaseComponent): ActionButton[] =>
  manpowerCategoryCrud.tableBtns(crudHostFromBase(comp));

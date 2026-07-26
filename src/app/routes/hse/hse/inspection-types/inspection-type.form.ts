import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import {
  CREATE_OR_UPDATE_INSPECTION_TYPE,
  DELETE_INSPECTION_TYPE,
} from './inspection-type.graphql';
import { InspectionType } from './inspection-type.interface';

export function getInspectionTypeFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [] },
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

const inspectionTypeCrud = defineEntityCrud<InspectionType>({
  name: 'Inspection Type',
  routeSlug: 'inspection-types',
  fields: getInspectionTypeFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_INSPECTION_TYPE,
    update: CREATE_OR_UPDATE_INSPECTION_TYPE,
    delete: DELETE_INSPECTION_TYPE,
  },
  permissions: {
    manage: ['ROLE_MANAGE_INSPECTION_TYPE'],
    delete: ['ROLE_DELETE_INSPECTION_TYPE'],
    view: ['ROLE_VIEW_INSPECTION_TYPE'],
  },
});

export const inspectionType$ = inspectionTypeCrud.reload$;

export const inspectionTypeUpsertBtn = (comp: BaseComponent): ActionButton =>
  inspectionTypeCrud.upsertBtn(crudHostFromBase(comp));

export const inspectionTypeDeleteBtn = (comp: BaseComponent): ActionButton =>
  inspectionTypeCrud.deleteBtn(crudHostFromBase(comp));

export const inspectionTypeTableBtns = (comp: BaseComponent): ActionButton[] =>
  inspectionTypeCrud.tableBtns(crudHostFromBase(comp));

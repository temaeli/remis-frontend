import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import {
  CREATE_OR_UPDATE_MAIN_FACILITY_TYPE,
  DELETE_MAIN_FACILITY_TYPE,
} from './main-facility-type.graphql';
import { MainFacilityType } from './main-facility-type.interface';

export function getMainFacilityTypeFormFields(_data?: MainFacilityType | any): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
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

const facilityTypeCrud = defineEntityCrud<MainFacilityType>({
  name: 'Facility Type',
  modalTitle: 'Main Facility Type',
  fields: (data) => getMainFacilityTypeFormFields(data),
  modalWidth: '40%',
  mutations: {
    create: CREATE_OR_UPDATE_MAIN_FACILITY_TYPE,
    update: CREATE_OR_UPDATE_MAIN_FACILITY_TYPE,
    delete: DELETE_MAIN_FACILITY_TYPE,
  },
  permissions: {
    manage: ['ROLE_MANAGE_FACILITY_TYPE'],
    delete: ['ROLE_DELETE_FACILITY_TYPE'],
    view: ['ROLE_VIEW_FACILITY_TYPE'],
  },
});

export const mainFacilityType$ = facilityTypeCrud.reload$;

export const mainFacilityTypeUpsertBtn = (comp: BaseComponent): ActionButton =>
  facilityTypeCrud.upsertBtn(crudHostFromBase(comp));

export const mainFacilityTypeDeleteBtn = (comp: BaseComponent): ActionButton =>
  facilityTypeCrud.deleteBtn(crudHostFromBase(comp));

export const mainFacilityTypeTableBtns = (comp: BaseComponent): ActionButton[] =>
  facilityTypeCrud.tableBtns(crudHostFromBase(comp));

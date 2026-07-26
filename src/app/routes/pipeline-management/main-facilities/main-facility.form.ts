import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { mainFacilityTypeLookupProvider } from '../main-facility-types/main-facility-type.provider';
import {
  CREATE_OR_UPDATE_MAIN_FACILITY,
  DELETE_MAIN_FACILITY,
} from './main-facility.graphql';
import { MainFacility } from './main-facility.interface';

export function getMainFacilityFormFields(_data?: MainFacility | any): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'facilityTypeUid',
      label: 'Facility Type',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: lookupOptions(mainFacilityTypeLookupProvider),
    },
  ];
}

const facilityCrud = defineEntityCrud<MainFacility>({
  name: 'Facility',
  modalTitle: 'Main Facility',
  routeSlug: 'main-facilities',
  fields: (data) => getMainFacilityFormFields(data),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_MAIN_FACILITY,
    update: CREATE_OR_UPDATE_MAIN_FACILITY,
    delete: DELETE_MAIN_FACILITY,
  },
  permissions: {
    manage: ['ROLE_MANAGE_FACILITY'],
    delete: ['ROLE_DELETE_FACILITY'],
    view: ['ROLE_VIEW_FACILITY'],
  },
  modelMapper: (data: any) => {
    const model: any = { ...(data ?? {}) };
    if (model.type && !model.facilityTypeUid) {
      model.facilityTypeUid = model.type.uid;
    }
    return model;
  },
});

export const mainFacility$ = facilityCrud.reload$;

export const mainFacilityUpsertBtn = (comp: BaseComponent): ActionButton =>
  facilityCrud.upsertBtn(crudHostFromBase(comp));

export const mainFacilityDeleteBtn = (comp: BaseComponent): ActionButton =>
  facilityCrud.deleteBtn(crudHostFromBase(comp));

export const mainFacilityTableBtns = (comp: BaseComponent): ActionButton[] =>
  facilityCrud.tableBtns(crudHostFromBase(comp));

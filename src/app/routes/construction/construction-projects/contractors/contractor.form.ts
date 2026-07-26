import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_EMAIL, VALIDATOR_REQUIRED, VALIDATOR_TANZINIA_PHONE } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { Contractor } from '../construction-projects.interface';
import { SAVE_CONTRACTOR, DELETE_CONTRACTOR } from '../construction-projects.graphql';

export function getContractorFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    // { key: 'code', label: 'Code', type: FieldType.input, validations: [] },
    { key: 'name', label: 'Contractor Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'registrationNumber', label: 'Registration Number', type: FieldType.input, validations: [] },
    { key: 'tin', label: 'TIN', type: FieldType.input, validations: [] },
    { key: 'contactPerson', label: 'Contact Person', type: FieldType.input, validations: [] },
    { key: 'phone', label: 'Phone', type: FieldType.input, validations: [VALIDATOR_TANZINIA_PHONE] },
    { key: 'email', label: 'Email', type: FieldType.input, validations: [VALIDATOR_EMAIL] },
    { key: 'address', label: 'Address', type: FieldType.input, validations: [] },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

const contractorCrud = defineEntityCrud<Contractor>({
  name: 'Contractor',
  fields: getContractorFormFields(),
  modalWidth: '55%',
  mutations: {
    create: SAVE_CONTRACTOR,
    update: SAVE_CONTRACTOR,
    delete: DELETE_CONTRACTOR,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_CONTRACTOR', 'ROLE_UPDATE_CONSTRUCTION_CONTRACTOR'],
    delete: ['ROLE_DELETE_CONSTRUCTION_CONTRACTOR'],
    view: ['ROLE_VIEW_ALL_CONSTRUCTION_CONTRACTOR', 'ROLE_VIEW_CONSTRUCTION_CONTRACTOR'],
  },
});

export const contractor$ = contractorCrud.reload$;

export const contractorUpsertBtn = (comp: BaseComponent): ActionButton =>
  contractorCrud.upsertBtn(crudHostFromBase(comp));

export const contractorDeleteBtn = (comp: BaseComponent): ActionButton =>
  contractorCrud.deleteBtn(crudHostFromBase(comp));

export const contractorTableBtns = (comp: BaseComponent): ActionButton[] =>
  contractorCrud.tableBtns(crudHostFromBase(comp));

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import {
  SAVE_SECURITY_CONTRACTOR,
  DELETE_SECURITY_CONTRACTOR,
} from './security-contractor.graphql';
import { SecurityContractor } from './security-contractor.interface';

export function getSecurityContractorFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [] },
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

const securityContractorCrud = defineEntityCrud<SecurityContractor>({
  name: 'Security Contractor',
  routeSlug: 'security-contractors',
  fields: getSecurityContractorFormFields(),
  modalWidth: '50%',
  mutations: {
    create: SAVE_SECURITY_CONTRACTOR,
    update: SAVE_SECURITY_CONTRACTOR,
    delete: DELETE_SECURITY_CONTRACTOR,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_CONTRACTOR', 'ROLE_UPDATE_SECURITY_CONTRACTOR'],
    delete: ['ROLE_DELETE_SECURITY_CONTRACTOR'],
  },
});

export const securityContractor$ = securityContractorCrud.reload$;

export const securityContractorUpsertBtn = (comp: BaseComponent): ActionButton =>
  securityContractorCrud.upsertBtn(crudHostFromBase(comp));

export const securityContractorDeleteBtn = (comp: BaseComponent): ActionButton =>
  securityContractorCrud.deleteBtn(crudHostFromBase(comp));

export const securityContractorTableBtns = (comp: BaseComponent): ActionButton[] =>
  securityContractorCrud.tableBtns(crudHostFromBase(comp));

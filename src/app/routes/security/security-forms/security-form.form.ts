import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { SAVE_SECURITY_FORM, DELETE_SECURITY_FORM } from './security-form.graphql';
import {
  SecurityForm,
  SecurityFormCategory,
  SecurityFormPeriodicity,
} from './security-form.interface';

export function getSecurityFormFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'category',
      label: 'Category',
      type: FieldType.select,
      validations: [],
      options: enumToObjectArray(SecurityFormCategory),
    },
    {
      key: 'periodicity',
      label: 'Periodicity',
      type: FieldType.select,
      validations: [],
      options: enumToObjectArray(SecurityFormPeriodicity),
    },
    { key: 'docRef', label: 'Document Reference', type: FieldType.input, validations: [] },
    { key: 'versionLabel', label: 'Version Label', type: FieldType.input, validations: [] },
    {
      key: 'workflowEnabled',
      label: 'Workflow Enabled',
      type: FieldType.toggle,
      validations: [],
    },
    {
      key: 'requiresApproval',
      label: 'Requires Final Approval (3-tier)',
      hint: 'When on: submit → review (endorse) → approve, e.g. CCTV daily logbook. When off, a single review is final.',
      type: FieldType.toggle,
      validations: [],
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

const securityFormCrud = defineEntityCrud<SecurityForm>({
  name: 'Security Form',
  routeSlug: 'security-forms',
  fields: getSecurityFormFormFields(),
  modalWidth: '50%',
  mutations: {
    create: SAVE_SECURITY_FORM,
    update: SAVE_SECURITY_FORM,
    delete: DELETE_SECURITY_FORM,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_FORM', 'ROLE_UPDATE_SECURITY_FORM'],
    delete: ['ROLE_DELETE_SECURITY_FORM'],
  },
});

export const securityForm$ = securityFormCrud.reload$;

export const securityFormUpsertBtn = (comp: BaseComponent): ActionButton =>
  securityFormCrud.upsertBtn(crudHostFromBase(comp));

export const securityFormDeleteBtn = (comp: BaseComponent): ActionButton =>
  securityFormCrud.deleteBtn(crudHostFromBase(comp));

export const securityFormTableBtns = (comp: BaseComponent): ActionButton[] =>
  securityFormCrud.tableBtns(crudHostFromBase(comp));

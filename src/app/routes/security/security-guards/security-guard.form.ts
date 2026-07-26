import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  VALIDATOR_PHONE_NUMBER_MAX_LENGTH,
  VALIDATOR_REQUIRED,
  VALIDATOR_TANZINIA_PHONE,
} from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { stationOptions, contractorOptions } from '../shared/security-lookups';
import { SAVE_SECURITY_GUARD, DELETE_SECURITY_GUARD } from './security-guard.graphql';
import { SecurityGuard } from './security-guard.interface';

export function getSecurityGuardFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'firstName',
      label: 'First Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    { key: 'middleName', label: 'Middle Name', type: FieldType.input, validations: [] },
    { key: 'surname', label: 'Surname', type: FieldType.input, validations: [] },
    {
      key: 'contact',
      label: 'Phone Number',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_TANZINIA_PHONE],
    },
    { key: 'rank', label: 'Rank', type: FieldType.input, validations: [] },
    { key: 'serviceNumber', label: 'Service Number', type: FieldType.input, validations: [] },
    {
      key: 'stationUid',
      label: 'Station',
      type: FieldType.select,
      optionsVariables: stationOptions(),
      validations: [],
    },
    {
      key: 'contractorUid',
      label: 'Contractor',
      type: FieldType.select,
      optionsVariables: contractorOptions(),
      validations: [],
    },
  ];
}

const securityGuardCrud = defineEntityCrud<SecurityGuard>({
  name: 'Security Guard',
  routeSlug: 'security-guards',
  fields: getSecurityGuardFormFields(),
  modalWidth: '55%',
  modelMapper: (data?: SecurityGuard) => ({
    ...(data ?? {}),
    stationUid: data?.station?.uid,
    contractorUid: data?.contractor?.uid,
  }),
  mutations: {
    create: SAVE_SECURITY_GUARD,
    update: SAVE_SECURITY_GUARD,
    delete: DELETE_SECURITY_GUARD,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_GUARD', 'ROLE_UPDATE_SECURITY_GUARD'],
    delete: ['ROLE_DELETE_SECURITY_GUARD'],
  },
});

export const securityGuard$ = securityGuardCrud.reload$;

export const securityGuardUpsertBtn = (comp: BaseComponent): ActionButton =>
  securityGuardCrud.upsertBtn(crudHostFromBase(comp));

export const securityGuardDeleteBtn = (comp: BaseComponent): ActionButton =>
  securityGuardCrud.deleteBtn(crudHostFromBase(comp));

export const securityGuardTableBtns = (comp: BaseComponent): ActionButton[] =>
  securityGuardCrud.tableBtns(crudHostFromBase(comp));

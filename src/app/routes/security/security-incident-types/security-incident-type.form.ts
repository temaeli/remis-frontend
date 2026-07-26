import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import {
  SAVE_SECURITY_INCIDENT_TYPE,
  DELETE_SECURITY_INCIDENT_TYPE,
} from './security-incident-type.graphql';
import { SecurityIncidentType } from './security-incident-type.interface';

export function getSecurityIncidentTypeFormFields(): FieldConfig[] {
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

const securityIncidentTypeCrud = defineEntityCrud<SecurityIncidentType>({
  name: 'Security Incident Type',
  routeSlug: 'security-incident-types',
  fields: getSecurityIncidentTypeFormFields(),
  modalWidth: '50%',
  mutations: {
    create: SAVE_SECURITY_INCIDENT_TYPE,
    update: SAVE_SECURITY_INCIDENT_TYPE,
    delete: DELETE_SECURITY_INCIDENT_TYPE,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_INCIDENT_TYPE', 'ROLE_UPDATE_SECURITY_INCIDENT_TYPE'],
    delete: ['ROLE_DELETE_SECURITY_INCIDENT_TYPE'],
  },
});

export const securityIncidentType$ = securityIncidentTypeCrud.reload$;

export const securityIncidentTypeUpsertBtn = (comp: BaseComponent): ActionButton =>
  securityIncidentTypeCrud.upsertBtn(crudHostFromBase(comp));

export const securityIncidentTypeDeleteBtn = (comp: BaseComponent): ActionButton =>
  securityIncidentTypeCrud.deleteBtn(crudHostFromBase(comp));

export const securityIncidentTypeTableBtns = (comp: BaseComponent): ActionButton[] =>
  securityIncidentTypeCrud.tableBtns(crudHostFromBase(comp));

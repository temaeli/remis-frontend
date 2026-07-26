import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import {
  CREATE_INCIDENT_TYPE,
  DELETE_INCIDENT_TYPE,
  UPDATE_INCIDENT_TYPE,
} from './incident-type.graphql';
import { IncidentType } from './incident-type.interface';

export function getIncidentTypeFormFields(): FieldConfig[] {
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

const incidentTypeCrud = defineEntityCrud<IncidentType>({
  name: 'Incident Type',
  routeSlug: 'incident-types',
  fields: getIncidentTypeFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_INCIDENT_TYPE,
    update: UPDATE_INCIDENT_TYPE,
    delete: DELETE_INCIDENT_TYPE,
  },
  permissions: {
    manage: ['ROLE_MANAGE_INCIDENT_TYPE'],
    delete: ['ROLE_DELETE_INCIDENT_TYPE'],
  },
});

export const incidentType$ = incidentTypeCrud.reload$;

export const incidentTypeUpsertBtn = (comp: BaseComponent): ActionButton =>
  incidentTypeCrud.upsertBtn(crudHostFromBase(comp));

export const incidentTypeDeleteBtn = (comp: BaseComponent): ActionButton =>
  incidentTypeCrud.deleteBtn(crudHostFromBase(comp));

export const incidentTypeTableBtns = (comp: BaseComponent): ActionButton[] =>
  incidentTypeCrud.tableBtns(crudHostFromBase(comp));

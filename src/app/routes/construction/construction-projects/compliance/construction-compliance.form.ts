import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { defineEntityCrud, EntityCrudContext } from '@shared/crud';
import { ConstructionCompliance } from '../construction-projects.interface';
import {
  ALL_CONSTRUCTION_PROJECTS,
  SAVE_CONSTRUCTION_COMPLIANCE,
  DELETE_CONSTRUCTION_COMPLIANCE,
} from '../construction-projects.graphql';

export function getConstructionComplianceFormFields(ctx?: EntityCrudContext): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'projectUid',
      label: 'Project',
      type: FieldType.select,
      visible: !ctx?.fixedProjectUid,
      validations: ctx?.fixedProjectUid ? [] : [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: { query: ALL_CONSTRUCTION_PROJECTS },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
    {
      key: 'authorityName',
      label: 'Authority Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'complianceStatus',
      label: 'Compliance Status',
      type: FieldType.input,
      // hint: 'e.g. Complied, Notified, N/A, Covered for 365 days',
      validations: [],
    },
    // { key: 'orderIndex', label: 'Order Index', type: FieldType.number, min: 0, validations: [] },
    {
      key: 'remarks',
      label: 'Remarks',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export const constructionComplianceCrud = defineEntityCrud<ConstructionCompliance>({
  name: 'Compliance',
  fields: (_data?: ConstructionCompliance, ctx?: EntityCrudContext) =>
    getConstructionComplianceFormFields(ctx),
  modalWidth: '55%',
  mutations: {
    create: SAVE_CONSTRUCTION_COMPLIANCE,
    update: SAVE_CONSTRUCTION_COMPLIANCE,
    delete: DELETE_CONSTRUCTION_COMPLIANCE,
  },
  modelMapper: (data?: ConstructionCompliance) =>
    data ? { ...data, projectUid: data.project?.uid } : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_COMPLIANCE', 'ROLE_UPDATE_CONSTRUCTION_COMPLIANCE'],
    delete: ['ROLE_DELETE_CONSTRUCTION_COMPLIANCE'],
  },
});

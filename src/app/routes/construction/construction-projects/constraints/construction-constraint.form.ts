import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { defineEntityCrud, EntityCrudContext } from '@shared/crud';
import {
  ConstructionConstraint,
  ConstructionConstraintStatus,
  ConstructionImpactLevel,
} from '../construction-projects.interface';
import {
  ALL_CONSTRUCTION_PROJECTS,
  SAVE_CONSTRUCTION_CONSTRAINT,
  DELETE_CONSTRUCTION_CONSTRAINT,
} from '../construction-projects.graphql';

export function getConstructionConstraintFormFields(ctx?: EntityCrudContext): FieldConfig[] {
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
    { key: 'title', label: 'Title', type: FieldType.input, validations: [] },
    {
      key: 'constraintType',
      label: 'Type',
      type: FieldType.select,
      options: ['Risk', 'Constraint'],
      validations: [],
    },
    {
      key: 'impactLevel',
      label: 'Impact Level',
      type: FieldType.select,
      options: Object.values(ConstructionImpactLevel),
      validations: [],
    },
    {
      key: 'status',
      label: 'Status',
      type: FieldType.select,
      options: Object.values(ConstructionConstraintStatus),
      validations: [],
    },
    { key: 'responsiblePerson', label: 'Responsible Person', type: FieldType.input, validations: [] },
    { key: 'raisedDate', label: 'Raised Date', type: FieldType.date, validations: [] },
    { key: 'targetResolutionDate', label: 'Target Resolution Date', type: FieldType.date, validations: [] },
    { key: 'resolvedDate', label: 'Resolved Date', type: FieldType.date, validations: [] },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'mitigationAction',
      label: 'Mitigation Action',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export const constructionConstraintCrud = defineEntityCrud<ConstructionConstraint>({
  name: 'Constraint',
  fields: (_data?: ConstructionConstraint, ctx?: EntityCrudContext) =>
    getConstructionConstraintFormFields(ctx),
  modalWidth: '60%',
  mutations: {
    create: SAVE_CONSTRUCTION_CONSTRAINT,
    update: SAVE_CONSTRUCTION_CONSTRAINT,
    delete: DELETE_CONSTRUCTION_CONSTRAINT,
  },
  modelMapper: (data?: ConstructionConstraint) =>
    data ? { ...data, projectUid: data.project?.uid } : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_CONSTRAINT', 'ROLE_UPDATE_CONSTRUCTION_CONSTRAINT'],
    delete: ['ROLE_DELETE_CONSTRUCTION_CONSTRAINT'],
  },
});

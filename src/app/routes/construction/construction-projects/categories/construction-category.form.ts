import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { defineEntityCrud, EntityCrudContext } from '@shared/crud';
import { ConstructionCategory } from '../construction-projects.interface';
import {
  ALL_CONSTRUCTION_PROJECTS,
  SAVE_CONSTRUCTION_CATEGORY,
  DELETE_CONSTRUCTION_CATEGORY,
} from '../construction-projects.graphql';

const VALIDATOR_END_DATE_NOT_BEFORE_START = {
  name: 'dateRange',
  message: 'End date must not be before the start date',
  validator: (control: any) => {
    if (!control.value) return null;
    const form = control.parent;
    const startDate = form?.get('startDate')?.value;
    if (!startDate) return null;
    return new Date(startDate) > new Date(control.value)
      ? { dateRange: { message: 'End date must not be before the start date' } }
      : null;
  },
};

export function getConstructionCategoryFormFields(
  data?: ConstructionCategory,
  ctx?: EntityCrudContext,
): FieldConfig[] {
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
      key: 'name', label: 'Main Activity',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      options: [
        'Contract Signing',
        'Engineering Design',
        'Permits Acquisition',
        'Procurement',
        'Construction-Civil Works',
        'Construction-Mechanical Works',
        'Testing and Commissioning Works',
        'Project Handover'
      ],

    },
    { key: 'startDate', label: 'Start Date', type: FieldType.date, validations: [] },
    {
      key: 'endDate',
      label: 'End Date',
      type: FieldType.date,
      validations: [VALIDATOR_END_DATE_NOT_BEFORE_START],
    },
    {
      key: 'weight',
      label: 'Weight (% of project)',
      type: FieldType.number,
      min: 0,
      max: 100,
      validations: [],
    },
    // { key: 'orderIndex', label: 'Order', type: FieldType.number, validations: [] },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export const constructionCategoryCrud = defineEntityCrud<ConstructionCategory>({
  name: 'Main Activity',
  fields: (data?: ConstructionCategory, ctx?: EntityCrudContext) =>
    getConstructionCategoryFormFields(data, ctx),
  modalWidth: '55%',
  mutations: {
    create: SAVE_CONSTRUCTION_CATEGORY,
    update: SAVE_CONSTRUCTION_CATEGORY,
    delete: DELETE_CONSTRUCTION_CATEGORY,
  },
  modelMapper: (data?: ConstructionCategory) =>
    data ? { ...data, projectUid: data.project?.uid } : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_CATEGORY', 'ROLE_UPDATE_CONSTRUCTION_CATEGORY'],
    delete: ['ROLE_DELETE_CONSTRUCTION_CATEGORY'],
  },
});

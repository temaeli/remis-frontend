import { BehaviorSubject } from 'rxjs';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { defineEntityCrud, EntityCrudContext } from '@shared/crud';
import { ConstructionActivity, ConstructionActivityStatus } from '../construction-projects.interface';
import {
  SAVE_CONSTRUCTION_ACTIVITY,
  DELETE_CONSTRUCTION_ACTIVITY,
  ALL_CONSTRUCTION_PROJECTS,
  CONSTRUCTION_CATEGORIES,
  CONSTRUCTION_ACTIVITIES_FOR_PROJECT,
} from '../construction-projects.graphql';

export function getConstructionActivityFormFields(
  data?: ConstructionActivity,
  ctx?: EntityCrudContext,
): FieldConfig[] {
  const projectUid$ = new BehaviorSubject<string | null>(data?.category?.project?.uid ?? null);

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'projectUid',
      label: 'Project',
      type: FieldType.select,
      visible: !ctx?.fixedProjectUid,
      ignoreOnSubmit: true,
      validations: ctx?.fixedProjectUid ? [] : [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: { query: ALL_CONSTRUCTION_PROJECTS },
        labelKey: 'name',
        valueKey: 'uid',
      },
      onChange: (value: string, form: any) => {
        projectUid$.next(value ?? null);
        form?.get('categoryUid')?.reset();
        form?.get('parentActivityUid')?.reset();
      },
    },
    {
      key: 'categoryUid',
      label: 'Main Activity',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: { query: CONSTRUCTION_CATEGORIES, variables: { projectUid: projectUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
    { key: 'name', label: 'Sub Activity', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    // {
    //   key: 'parentActivityUid',
    //   label: 'Parent Activity (leave blank for a top-level activity)',
    //   type: FieldType.select,
    //   validations: [],
    //   optionsVariables: {
    //     fetchParameter: { query: CONSTRUCTION_ACTIVITIES_FOR_PROJECT, variables: { projectUid: projectUid$ } },
    //     labelKey: 'name',
    //     valueKey: 'uid',
    //     filterFunction: (op: any) => op?.uid !== data?.uid && !op?.parentActivity,
    //   },
    // },
    {
      key: 'unitOfMeasure',
      label: 'Unit of Measure',
      type: FieldType.select,
      options: ['Meter', 'Joint', 'Number', 'Item'],
      validations: [],
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: FieldType.date,
      // hint: 'Required if the project has "Require Activity Dates" on; must fall within the project (or parent activity) window.',
      validations: [],
    },
    { key: 'endDate', label: 'End Date', type: FieldType.date, validations: [] },
    { key: 'plannedQuantity', label: 'Planned Quantity', type: FieldType.number, min: 0, validations: [] },
    // { key: 'completedQuantity', label: 'Completed Quantity', type: FieldType.number, min: 0, validations: [] },
    { key: 'weight', label: 'Weight (% of category)', type: FieldType.number, min: 0, max: 100, validations: [] },
    // {
    //   key: 'status',
    //   label: 'Status',
    //   type: FieldType.select,
    //   options: Object.values(ConstructionActivityStatus),
    //   validations: [],
    // },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export const constructionActivityCrud = defineEntityCrud<ConstructionActivity>({
  name: 'Sub Activity',
  fields: (data?: ConstructionActivity, ctx?: EntityCrudContext) =>
    getConstructionActivityFormFields(data, ctx),
  modalWidth: '65%',
  mutations: {
    create: SAVE_CONSTRUCTION_ACTIVITY,
    update: SAVE_CONSTRUCTION_ACTIVITY,
    delete: DELETE_CONSTRUCTION_ACTIVITY,
  },
  modelMapper: (data?: ConstructionActivity) =>
    data
      ? {
          ...data,
          projectUid: data.category?.project?.uid,
          categoryUid: data.category?.uid,
          parentActivityUid: data.parentActivity?.uid,
        }
      : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_ACTIVITY', 'ROLE_UPDATE_CONSTRUCTION_ACTIVITY'],
    delete: ['ROLE_DELETE_CONSTRUCTION_ACTIVITY'],
  },
});

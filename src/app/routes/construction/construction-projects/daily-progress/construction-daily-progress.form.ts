import { BehaviorSubject } from 'rxjs';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { defineEntityCrud, EntityCrudContext } from '@shared/crud';
import { ConstructionDailyProgress } from '../construction-projects.interface';
import {
  SAVE_CONSTRUCTION_DAILY_PROGRESS,
  DELETE_CONSTRUCTION_DAILY_PROGRESS,
  ALL_CONSTRUCTION_PROJECTS,
  CONSTRUCTION_ACTIVITIES_FOR_PROJECT,
} from '../construction-projects.graphql';

export function getConstructionDailyProgressFormFields(
  data?: ConstructionDailyProgress,
  ctx?: EntityCrudContext,
): FieldConfig[] {
  const projectUid$ = new BehaviorSubject<string | null>(data?.project?.uid ?? null);

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
        form?.get('activityUid')?.reset();
      },
    },
    {
      key: 'activityUid',
      label: 'Activity',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: { query: CONSTRUCTION_ACTIVITIES_FOR_PROJECT, variables: { projectUid: projectUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
    { key: 'reportDate', label: 'Report Date', type: FieldType.date, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'cumulativeQuantity',
      label: 'Quantity Completed to Date (Cumulative)',
      type: FieldType.number,
      min: 0,
      validations: [],
    },
    // {
    //   key: 'previousCumulativeQuantity',
    //   label: 'Previous Cumulative (optional override)',
    //   type: FieldType.number,
    //   min: 0,
    //   hint: 'Leave blank to auto-carry from the last entry',
    //   validations: [],
    // },
    {
      key: 'note',
      label: 'Note',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export const constructionDailyProgressCrud = defineEntityCrud<ConstructionDailyProgress>({
  name: 'Daily Progress Entry',
  fields: (data?: ConstructionDailyProgress, ctx?: EntityCrudContext) =>
    getConstructionDailyProgressFormFields(data, ctx),
  modalWidth: '55%',
  mutations: {
    create: SAVE_CONSTRUCTION_DAILY_PROGRESS,
    update: SAVE_CONSTRUCTION_DAILY_PROGRESS,
    delete: DELETE_CONSTRUCTION_DAILY_PROGRESS,
  },
  modelMapper: (data?: ConstructionDailyProgress) =>
    data ? { ...data, projectUid: data.project?.uid, activityUid: data.activity?.uid } : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_DAILY_PROGRESS', 'ROLE_UPDATE_CONSTRUCTION_DAILY_PROGRESS'],
    delete: ['ROLE_DELETE_CONSTRUCTION_DAILY_PROGRESS'],
  },
});

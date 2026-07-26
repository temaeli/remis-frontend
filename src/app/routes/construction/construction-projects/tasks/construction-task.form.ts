import { BehaviorSubject } from 'rxjs';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { defineEntityCrud, EntityCrudContext } from '@shared/crud';
import { ConstructionTask } from '../construction-projects.interface';
import {
  ALL_CONSTRUCTION_PROJECTS,
  SAVE_CONSTRUCTION_TASK,
  DELETE_CONSTRUCTION_TASK,
  CONSTRUCTION_TASKS,
} from '../construction-projects.graphql';

export function getConstructionTaskFormFields(
  data?: ConstructionTask,
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
      validations: ctx?.fixedProjectUid ? [] : [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: { query: ALL_CONSTRUCTION_PROJECTS },
        labelKey: 'name',
        valueKey: 'uid',
      },
      onChange: (value: string, form: any) => {
        projectUid$.next(value ?? null);
        form?.get('parentTaskUid')?.reset();
      },
    },
    { key: 'wbsCode', label: 'WBS Code', type: FieldType.input, validations: [] },
    { key: 'name', label: 'Task Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'parentTaskUid',
      label: 'Parent Task (leave blank for a top-level task)',
      type: FieldType.select,
      validations: [],
      optionsVariables: {
        fetchParameter: { query: CONSTRUCTION_TASKS, variables: { projectUid: projectUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
        filterFunction: (op: any) => op?.uid !== data?.uid,
      },
    },
    { key: 'taskMode', label: 'Task Mode', type: FieldType.input, validations: [] },
    { key: 'startDate', label: 'Start Date', type: FieldType.date, validations: [] },
    { key: 'finishDate', label: 'Finish Date', type: FieldType.date, validations: [] },
    {
      key: 'durationDays',
      label: 'Duration (Days)',
      type: FieldType.number,
      hint: 'Auto-derived from start/finish date if left blank',
      validations: [],
    },
    { key: 'orderIndex', label: 'Order', type: FieldType.number, validations: [] },
    {
      key: 'notes',
      label: 'Notes',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export const constructionTaskCrud = defineEntityCrud<ConstructionTask>({
  name: 'Schedule Task',
  fields: (data?: ConstructionTask, ctx?: EntityCrudContext) => getConstructionTaskFormFields(data, ctx),
  modalWidth: '60%',
  mutations: {
    create: SAVE_CONSTRUCTION_TASK,
    update: SAVE_CONSTRUCTION_TASK,
    delete: DELETE_CONSTRUCTION_TASK,
  },
  modelMapper: (data?: ConstructionTask) =>
    data ? { ...data, projectUid: data.project?.uid, parentTaskUid: data.parentTask?.uid } : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_TASK', 'ROLE_UPDATE_CONSTRUCTION_TASK'],
    delete: ['ROLE_DELETE_CONSTRUCTION_TASK'],
  },
});

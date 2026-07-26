import { BehaviorSubject } from 'rxjs';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { defineEntityCrud, EntityCrudContext } from '@shared/crud';
import { ConstructionMilestone, ConstructionMilestoneStatus } from '../construction-projects.interface';
import {
  ALL_CONSTRUCTION_PROJECTS,
  CONSTRUCTION_ACTIVITIES_FOR_PROJECT,
  SAVE_CONSTRUCTION_MILESTONE,
  DELETE_CONSTRUCTION_MILESTONE,
  CONSTRUCTION_CATEGORIES,
} from '../construction-projects.graphql';

export function getConstructionMilestoneFormFields(
  data?: ConstructionMilestone,
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
      label: 'Sub-activity',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: { query: CONSTRUCTION_CATEGORIES, variables: { projectUid: projectUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
    // { key: 'name', label: 'Milestone Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'targetDate', label: 'Target Date', type: FieldType.date, validations: [] },
    // {
    //   key: 'status',
    //   label: 'Status',
    //   type: FieldType.select,
    //   options: Object.values(ConstructionMilestoneStatus),
    //   validations: [],
    // },
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

export const constructionMilestoneCrud = defineEntityCrud<ConstructionMilestone>({
  name: 'Milestone',
  fields: (data?: ConstructionMilestone, ctx?: EntityCrudContext) =>
    getConstructionMilestoneFormFields(data, ctx),
  modalWidth: '55%',
  mutations: {
    create: SAVE_CONSTRUCTION_MILESTONE,
    update: SAVE_CONSTRUCTION_MILESTONE,
    delete: DELETE_CONSTRUCTION_MILESTONE,
  },
  modelMapper: (data?: ConstructionMilestone) =>
    data ? { ...data, projectUid: data.project?.uid, activityUid: data.activity?.uid } : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_MILESTONE', 'ROLE_UPDATE_CONSTRUCTION_MILESTONE'],
    delete: ['ROLE_DELETE_CONSTRUCTION_MILESTONE'],
  },
});

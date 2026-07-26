import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { defineEntityCrud, EntityCrudContext } from '@shared/crud';
import { ConstructionManpowerEntry } from '../construction-projects.interface';
import {
  ALL_CONSTRUCTION_PROJECTS,
  SAVE_CONSTRUCTION_MANPOWER_ENTRY,
  DELETE_CONSTRUCTION_MANPOWER_ENTRY,
} from '../construction-projects.graphql';

const WORKFORCE_CATEGORY_OPTIONS: Option[] = [
  { label: 'Casual Labour', value: 'Casual Labour' },
  { label: 'Gasco Staff', value: 'Gasco Staff' },
  { label: 'Tpdc Staff', value: 'Tpdc' },
  { label: 'Visitors', value: 'Visitors' },
  { label: 'Client', value: 'Client' },
];

export function getConstructionManpowerEntryFormFields(ctx?: EntityCrudContext): FieldConfig[] {
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
    { key: 'entryDate', label: 'Report Date', type: FieldType.date, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'workforceCategory',
      label: 'Workforce Category',
      type: FieldType.select,
      options: WORKFORCE_CATEGORY_OPTIONS,
      validations: [],
    },
    { key: 'personnelCount', label: 'Number of Personnel', type: FieldType.number, min: 0, validations: [] },
    { key: 'hoursPerDay', label: 'Hours Worked Per Day', type: FieldType.number, min: 0, validations: [] },
    {
      key: 'note',
      label: 'Note',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export const constructionManpowerCrud = defineEntityCrud<ConstructionManpowerEntry>({
  name: 'Manpower Entry',
  fields: (_data?: ConstructionManpowerEntry, ctx?: EntityCrudContext) =>
    getConstructionManpowerEntryFormFields(ctx),
  modalWidth: '55%',
  mutations: {
    create: SAVE_CONSTRUCTION_MANPOWER_ENTRY,
    update: SAVE_CONSTRUCTION_MANPOWER_ENTRY,
    delete: DELETE_CONSTRUCTION_MANPOWER_ENTRY,
  },
  modelMapper: (data?: ConstructionManpowerEntry) =>
    data ? { ...data, projectUid: data.project?.uid } : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_MANPOWER', 'ROLE_UPDATE_CONSTRUCTION_MANPOWER'],
    delete: ['ROLE_DELETE_CONSTRUCTION_MANPOWER'],
  },
});

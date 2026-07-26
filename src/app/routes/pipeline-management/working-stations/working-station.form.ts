import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { obs } from '@shared/components/generic-form/field-helpers';
import { enumToObjectArray } from '@core/helpers';
import { GET_ALL_PIPELINES } from '@routes/pipeline-management/pipelines/pipeline.graphql';
import { ALL_PLANT } from '@routes/plants/plants/plant.graphql';
import {
  CREATE_WORKING_STATION,
  DELETE_WORKING_STATION,
  UPDATE_WORKING_STATION,
} from './working-station.graphql';
import { SectionEnum, WorkingStation } from './working-station.interface';

const SECTIONS_WITH_FACILITY = [SectionEnum.PIPELINE, SectionEnum.PLANT];

export function getWorkingStationFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [] },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'section',
      label: 'Section',
      type: FieldType.select,
      options: enumToObjectArray(SectionEnum),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'facilityUid',
      label: 'Facility',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      showWhen: [{ key: 'section', checker: (v) => SECTIONS_WITH_FACILITY.includes(v) }],
      optionsVariables: obs('section', (sectionVal) => {
        if (sectionVal === SectionEnum.PLANT) {
          return {
            fetchParameter: { query: ALL_PLANT, defaultRes: [] },
            labelKey: 'name',
            valueKey: 'uid',
          };
        }
        return {
          fetchParameter: {
            query: GET_ALL_PIPELINES,
            defaultRes: [],
            variables: { active: true },
          },
          labelKey: 'name',
          valueKey: 'uid',
        };
      }),
    },
    {
      key: 'description',
      label: 'Description',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

const workingStationCrud = defineEntityCrud<WorkingStation>({
  name: 'Working Station',
  routeSlug: 'working-stations',
  fields: getWorkingStationFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_WORKING_STATION,
    update: UPDATE_WORKING_STATION,
    delete: DELETE_WORKING_STATION,
  },
  permissions: {
    manage: ['ROLE_MANAGE_WORKING_STATION'],
    delete: ['ROLE_DELETE_WORKING_STATION'],
  },
  modelMapper: (data: any) => ({
    ...data,
    facilityUid: data?.facilityUid ?? data?.sourceId,
  }),
});

export const workingStation$ = workingStationCrud.reload$;

export const workingStationUpsertBtn = (comp: BaseComponent): ActionButton =>
  workingStationCrud.upsertBtn(crudHostFromBase(comp));

export const workingStationDeleteBtn = (comp: BaseComponent): ActionButton =>
  workingStationCrud.deleteBtn(crudHostFromBase(comp));

export const workingStationTableBtns = (comp: BaseComponent): ActionButton[] =>
  workingStationCrud.tableBtns(crudHostFromBase(comp));

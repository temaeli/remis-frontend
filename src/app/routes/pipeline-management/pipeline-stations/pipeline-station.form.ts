import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { segmentLookupProvider } from '../segments/segment.provider';
import {
  CREATE_PIPELINE_STATION,
  DELETE_PIPELINE_STATION,
  UPDATE_PIPELINE_STATION,
} from './pipeline-station.graphql';
import { PipelineStation, PipelineStationTypeEnum } from './pipeline-station.interface';
import { enumToObjectArray } from '@core/helpers';

export function getPipelineStationFormFields(data?: PipelineStation | any): FieldConfig[] {
  const lockedSegmentUid: string | undefined = data?.pipelineSegmentUid;
  const segmentPrefilled = !!lockedSegmentUid;

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'pipelineSegmentUid',
      label: 'Pipeline Segment',
      type: segmentPrefilled ? FieldType.input : FieldType.select,
      visible: !segmentPrefilled,
      validations: [VALIDATOR_REQUIRED],
      ...(segmentPrefilled
        ? {}
        : { optionsVariables: lookupOptions(segmentLookupProvider) }),
    },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'stationType',
      label: 'Station Type',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      options: enumToObjectArray(PipelineStationTypeEnum),
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

const pipelineStationCrud = defineEntityCrud<PipelineStation>({
  name: 'Pipeline Station',
  routeSlug: 'pipeline-stations',
  fields: (data) => getPipelineStationFormFields(data),
  modalWidth: '50%',
  mutations: {
    create: CREATE_PIPELINE_STATION,
    update: UPDATE_PIPELINE_STATION,
    delete: DELETE_PIPELINE_STATION,
  },
  permissions: {
    manage: ['ROLE_MANAGE_PIPELINE_STATION'],
    delete: ['ROLE_DELETE_PIPELINE_STATION'],
    view: ['ROLE_VIEW_PIPELINE_STATION'],
  },
  modelMapper: (data: any) => ({
    ...data,
    pipelineSegmentUid: data?.pipelineSegmentUid ?? data?.pipelineSegment?.uid,
  }),
});

export const pipelineStation$ = pipelineStationCrud.reload$;

export const pipelineStationUpsertBtn = (comp: BaseComponent): ActionButton =>
  pipelineStationCrud.upsertBtn(crudHostFromBase(comp));

export const pipelineStationDeleteBtn = (comp: BaseComponent): ActionButton =>
  pipelineStationCrud.deleteBtn(crudHostFromBase(comp));

export const pipelineStationTableBtns = (comp: BaseComponent): ActionButton[] =>
  pipelineStationCrud.tableBtns(crudHostFromBase(comp));

export const pipelineStationUpsertBtnForSegment = (
  comp: BaseComponent,
  pipelineSegmentUid: string,
): ActionButton => {
  const base = pipelineStationCrud.upsertBtn(crudHostFromBase(comp));
  return {
    ...base,
    click: (data?: any) => base.click?.({ ...(data ?? {}), pipelineSegmentUid }),
  };
};

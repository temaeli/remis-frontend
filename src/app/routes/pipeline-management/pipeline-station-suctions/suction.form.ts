import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { pipelineStationLookupProvider } from '../pipeline-stations/pipeline-station.provider';
import {
  CREATE_PIPELINE_STATION_SUCTION,
  DELETE_PIPELINE_STATION_SUCTION,
  UPDATE_PIPELINE_STATION_SUCTION,
} from './suction.graphql';
import { PipelineStationSuction } from './suction.interface';

export function getPipelineStationSuctionFormFields(
  data?: PipelineStationSuction | any,
): FieldConfig[] {
  const lockedStationUid: string | undefined = data?.pipelineStationUid;
  const stationPrefilled = !!lockedStationUid;

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'pipelineStationUid',
      label: 'Pipeline Station',
      type: stationPrefilled ? FieldType.input : FieldType.select,
      visible: !stationPrefilled,
      validations: [VALIDATOR_REQUIRED],
      ...(stationPrefilled
        ? {}
        : { optionsVariables: lookupOptions(pipelineStationLookupProvider) }),
    },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'description',
      label: 'Description',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

const suctionCrud = defineEntityCrud<PipelineStationSuction>({
  name: 'Suction',
  modalTitle: 'Pipeline Station Suction',
  fields: (data) => getPipelineStationSuctionFormFields(data),
  modalWidth: '50%',
  mutations: {
    create: CREATE_PIPELINE_STATION_SUCTION,
    update: UPDATE_PIPELINE_STATION_SUCTION,
    delete: DELETE_PIPELINE_STATION_SUCTION,
  },
  permissions: {
    manage: ['ROLE_MANAGE_PIPELINE_STATION_SUCTION'],
    delete: ['ROLE_DELETE_PIPELINE_STATION_SUCTION'],
    view: ['ROLE_VIEW_PIPELINE_STATION_SUCTION'],
  },
  modelMapper: (data: any) => {
    const model: any = { ...(data ?? {}) };
    if (model.station && !model.pipelineStationUid) {
      model.pipelineStationUid = model.station.uid;
    }
    return model;
  },
});

export const pipelineStationSuction$ = suctionCrud.reload$;

export const suctionUpsertBtn = (comp: BaseComponent): ActionButton =>
  suctionCrud.upsertBtn(crudHostFromBase(comp));

export const suctionDeleteBtn = (comp: BaseComponent): ActionButton =>
  suctionCrud.deleteBtn(crudHostFromBase(comp));

export const suctionTableBtns = (comp: BaseComponent): ActionButton[] =>
  suctionCrud.tableBtns(crudHostFromBase(comp));

/**
 * Suction upsert button bound to a specific pipeline station. Hides+seeds the
 * station field; useful from the Pipeline Station detail page.
 */
export const suctionUpsertBtnForStation = (
  comp: BaseComponent,
  pipelineStationUid: string,
): ActionButton => {
  const base = suctionCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: (data?: any) => {
      const isCreate = !data?.uid;
      const seed = isCreate ? { ...(data ?? {}), pipelineStationUid } : data;
      originalClick?.(seed);
    },
  };
};

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { pipelineStationLookupProvider } from '../pipeline-stations/pipeline-station.provider';
import {
  CREATE_PIPELINE_STATION_DISCHARGE,
  DELETE_PIPELINE_STATION_DISCHARGE,
  UPDATE_PIPELINE_STATION_DISCHARGE,
} from './discharge.graphql';
import { PipelineStationDischarge } from './discharge.interface';

export function getPipelineStationDischargeFormFields(
  data?: PipelineStationDischarge | any,
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

const dischargeCrud = defineEntityCrud<PipelineStationDischarge>({
  name: 'Discharge',
  modalTitle: 'Pipeline Station Discharge',
  fields: (data) => getPipelineStationDischargeFormFields(data),
  modalWidth: '50%',
  mutations: {
    create: CREATE_PIPELINE_STATION_DISCHARGE,
    update: UPDATE_PIPELINE_STATION_DISCHARGE,
    delete: DELETE_PIPELINE_STATION_DISCHARGE,
  },
  permissions: {
    manage: ['ROLE_MANAGE_PIPELINE_STATION_DISCHARGE'],
    delete: ['ROLE_DELETE_PIPELINE_STATION_DISCHARGE'],
    view: ['ROLE_VIEW_PIPELINE_STATION_DISCHARGE'],
  },
  modelMapper: (data: any) => {
    const model: any = { ...(data ?? {}) };
    if (model.station && !model.pipelineStationUid) {
      model.pipelineStationUid = model.station.uid;
    }
    return model;
  },
});

export const pipelineStationDischarge$ = dischargeCrud.reload$;

export const dischargeUpsertBtn = (comp: BaseComponent): ActionButton =>
  dischargeCrud.upsertBtn(crudHostFromBase(comp));

export const dischargeDeleteBtn = (comp: BaseComponent): ActionButton =>
  dischargeCrud.deleteBtn(crudHostFromBase(comp));

export const dischargeTableBtns = (comp: BaseComponent): ActionButton[] =>
  dischargeCrud.tableBtns(crudHostFromBase(comp));

/**
 * Discharge upsert button bound to a specific pipeline station. Hides+seeds the
 * station field; useful from the Pipeline Station detail page.
 */
export const dischargeUpsertBtnForStation = (
  comp: BaseComponent,
  pipelineStationUid: string,
): ActionButton => {
  const base = dischargeCrud.upsertBtn(crudHostFromBase(comp));
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

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  CrudHost,
  canSubmit,
  crudHostFromBase,
  defineEntityCrud,
  fetchWithWarningConfirm,
  lookupOptions,
} from '@shared/crud';
import { segmentLookupProvider } from '../segments/segment.provider';
import {
  CREATE_PIPELINE_READING,
  DELETE_PIPELINE_READING,
  SUBMIT_PIPELINE_READING,
  UPDATE_PIPELINE_READING,
} from './reading.graphql';
import { PipelineReading } from './reading.interface';

export function getPipelineReadingFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'pipelineSegmentUid',
      label: 'Pipeline Segment',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: lookupOptions(segmentLookupProvider),
    },
    {
      key: 'temperatureIn',
      label: 'Temperature In (°C)',
      type: FieldType.decimal,
      decimals: 1,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'pressureIn',
      label: 'Pressure In (bar)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'temperatureOut',
      label: 'Temperature Out (°C)',
      type: FieldType.decimal,
      decimals: 1,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'pressureOut',
      label: 'Pressure Out (bar)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

const readingCrud = defineEntityCrud<PipelineReading>({
  name: 'Reading',
  routeSlug: 'readings',
  modalTitle: 'Pipeline Reading',
  fields: getPipelineReadingFormFields(),
  modalWidth: '40%',
  mutations: {
    create: CREATE_PIPELINE_READING,
    update: UPDATE_PIPELINE_READING,
    delete: DELETE_PIPELINE_READING,
  },
  permissions: {
    manage: ['ROLE_ADD_PIPELINE_READING', 'ROLE_UPDATE_PIPELINE_READING'],
    delete: ['ROLE_DELETE_PIPELINE_READING'],
    view: ['ROLE_VIEW_PIPELINE_READING'],
  },
  modelMapper: (data: any) => ({
    ...data,
    pipelineSegmentUid: data?.pipelineSegmentUid ?? data?.pipelineSegment?.uid,
  }),
  statusGate: { edit: true, delete: true },
});

export const pipelineReading$ = readingCrud.reload$;

export const pipelineReadingUpsertBtn = (comp: BaseComponent): ActionButton =>
  readingCrud.upsertBtn(crudHostFromBase(comp));

export const pipelineReadingDeleteBtn = (comp: BaseComponent): ActionButton =>
  readingCrud.deleteBtn(crudHostFromBase(comp));

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Reading',
    showFunction: (row: any) => canSubmit(row),
    confirmDataMapper: () => ({
      title: 'Submit Reading',
      message: 'Are you sure you want to submit this reading?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      fetchWithWarningConfirm(host, {
        notify: true,
        mutation: SUBMIT_PIPELINE_READING,
        variables: {
          input: {
            uid: data.uid,
            readingTime: data.readingTime,
            temperatureIn: data.temperatureIn,
            pressureIn: data.pressureIn,
            temperatureOut: data.temperatureOut,
            pressureOut: data.pressureOut,
            pipelineSegmentUid: data.pipelineSegment?.uid,
          },
        },
        successFn: () => pipelineReading$.next(null),
      });
    },
  };
}

export const pipelineReadingSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));

export const pipelineReadingTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return readingCrud.tableBtns(host);
};

import { Subject } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  FieldConfig,
  FieldType,
  FormStepper,
} from '@shared/components/generic-form/field.interface';
import {
  CrudHost,
  buildApproveBtn,
  buildRejectBtn,
  canSubmit,
  crudHostFromBase,
  defineEntityCrud,
  lookupOptions,
  processStatusFromTimestamps,
} from '@shared/crud';
import { pipelineStationLookupProvider } from '../pipeline-stations/pipeline-station.provider';
import { GET_PIPELINE_SUCTIONS_BY_STATION } from '../pipeline-station-suctions/suction.graphql';
import { GET_PIPELINE_DISCHARGES_BY_STATION } from '../pipeline-station-discharges/discharge.graphql';
import {
  APPROVE_PIPELINE_STATION_READING,
  CREATE_PIPELINE_STATION_READING,
  DELETE_PIPELINE_STATION_READING,
  REJECT_PIPELINE_STATION_READING,
  SUBMIT_PIPELINE_STATION_READING,
  UPDATE_PIPELINE_STATION_READING,
} from './pipeline-station-reading.graphql';
import { PipelineStationReading } from './pipeline-station-reading.interface';

export function getPipelineStationReadingFormFields(
  data?: PipelineStationReading | any,
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
    { key: 'readingTime', label: 'Reading Time', type: FieldType.dateTime, validations: [], maxDate: new Date() },
    {
      key: 'remarks',
      label: 'Remarks',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'suctionReadings',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      label: 'Suction Readings',
      labelClass: 'p-0 pb-3',
      fieldsClass: 'grid grid-cols-3 gap-4',
      canAddFormGroup: false,
      expandable: false,
      showGroupLabel: false,
      fields: [
        { key: 'uid', type: FieldType.input, visible: false },
        {
          key: 'suctionPointUid',
          type: FieldType.input,
          visible: false,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'suctionPointName',
          label: 'Suction Point',
          type: FieldType.label,
          valueAsLabel: true,
          innerClass: 'bg-gray-400/10 rounded-lg p-3',
          disabled: true,
          ignoreOnSubmit: true,
        },
        { key: 'temperature', label: 'Temperature (°C)', type: FieldType.decimal, decimals: 1, validations: [VALIDATOR_REQUIRED] },
        { key: 'pressure', label: 'Pressure (bar)', type: FieldType.decimal, validations: [VALIDATOR_REQUIRED] },
      ],
    },
    {
      key: 'dischargeReadings',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      label: 'Discharge Readings',
      labelClass: 'p-0 pb-3',
      fieldsClass: 'grid grid-cols-3 gap-4',
      canAddFormGroup: false,
      expandable: false,
      showGroupLabel: false,
      fields: [
        { key: 'uid', type: FieldType.input, visible: false },
        {
          key: 'dischargePointUid',
          type: FieldType.input,
          visible: false,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'dischargePointName',
          label: 'Discharge Point',
          type: FieldType.label,
          valueAsLabel: true,
          innerClass: 'bg-gray-400/10 rounded-lg p-3',
          disabled: true,
          ignoreOnSubmit: true,
        },
        { key: 'temperature', label: 'Temperature (°C)', type: FieldType.decimal, decimals: 1, validations: [VALIDATOR_REQUIRED] },
        { key: 'pressure', label: 'Pressure (bar)', type: FieldType.decimal, validations: [VALIDATOR_REQUIRED] },
      ],
    },
  ];
}

function getPipelineStationReadingFormSteppers(): FormStepper[] {
  return [
    {
      name: 'Station',
      icon: 'factory',
      keys: ['uid', 'pipelineStationUid', 'readingTime', 'remarks'],
    },
    { name: 'Suctions', icon: 'workflow', keys: ['suctionReadings'] },
    { name: 'Discharges', icon: 'workflow', keys: ['dischargeReadings'] },
  ];
}

const hasNumericValue = (v: any) => v !== null && v !== undefined && v !== '' && !Number.isNaN(+v);

const pruneRowsByUidKey = (rows: any[] | undefined, uidKey: string) =>
  (rows ?? []).filter(
    (r) => !!r?.[uidKey] && hasNumericValue(r?.temperature) && hasNumericValue(r?.pressure),
  );

const stripDisplayKeys = (rows: any[] | undefined) =>
  (rows ?? []).map(({ suctionPointName, dischargePointName, ...rest }: any) => rest);

const toLocalDateTime = (v: any): string | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const buildCreateInput = (value: any) => ({
  pipelineStationUid: value?.pipelineStationUid,
  readingTime: toLocalDateTime(value?.readingTime) ?? toLocalDateTime(new Date()),
  remarks: value?.remarks,
  suctionReadings: stripDisplayKeys(pruneRowsByUidKey(value?.suctionReadings, 'suctionPointUid')),
  dischargeReadings: stripDisplayKeys(
    pruneRowsByUidKey(value?.dischargeReadings, 'dischargePointUid'),
  ),
});

function buildSuctionRowGroup(point: { uid: string; name?: string }): FormGroup {
  return new FormGroup({
    uid: new FormControl(null),
    suctionPointUid: new FormControl(point.uid, Validators.required),
    suctionPointName: new FormControl({ value: point.name ?? '', disabled: true }),
    temperature: new FormControl(null, Validators.required),
    pressure: new FormControl(null, Validators.required),
  });
}

function buildDischargeRowGroup(point: { uid: string; name?: string }): FormGroup {
  return new FormGroup({
    uid: new FormControl(null),
    dischargePointUid: new FormControl(point.uid, Validators.required),
    dischargePointName: new FormControl({ value: point.name ?? '', disabled: true }),
    temperature: new FormControl(null, Validators.required),
    pressure: new FormControl(null, Validators.required),
  });
}

async function loadStationPoints(
  comp: BaseComponent,
  stationUid: string,
): Promise<{ suctions: any[]; discharges: any[] }> {
  const [suctionPage, dischargePage] = await Promise.all([
    comp.fs.fetch({
      query: GET_PIPELINE_SUCTIONS_BY_STATION,
      variables: { stationUid, active: true },
    }),
    comp.fs.fetch({
      query: GET_PIPELINE_DISCHARGES_BY_STATION,
      variables: { stationUid, active: true },
    }),
  ]);
  return { suctions: suctionPage?.content ?? [], discharges: dischargePage?.content ?? [] };
}

async function seedSubReadingsInto(
  comp: BaseComponent,
  stationUid: string,
  form: FormGroup,
): Promise<void> {
  const { suctions, discharges } = await loadStationPoints(comp, stationUid);

  if (suctions.length === 0 && discharges.length === 0) {
    comp.notify.error(
      'Configure suction or discharge points on this station before recording readings.',
    );
    return;
  }

  // Mutate the existing FormArrays in place (clear + push). setControl would
  // detach the arrays from the per-stepper FormGroups that were built in
  // generic-form.setFormSteps at init, so the Suctions/Discharges steps would
  // keep validating against the original empty auto-added row and Proceed
  // would stay disabled forever.
  const suctionArr = form.get('suctionReadings') as FormArray;
  suctionArr.clear();
  suctions.forEach((s: any) => suctionArr.push(buildSuctionRowGroup(s)));

  const dischargeArr = form.get('dischargeReadings') as FormArray;
  dischargeArr.clear();
  discharges.forEach((d: any) => dischargeArr.push(buildDischargeRowGroup(d)));
}

async function openReadingStepperForm(
  comp: BaseComponent,
  options: { lockedStationUid?: string } = {},
): Promise<void> {
  const stationLocked = !!options.lockedStationUid;
  const host = crudHostFromBase(comp);
  const close$ = new Subject<void>();
  const model: any = {};

  if (stationLocked) {
    const { suctions, discharges } = await loadStationPoints(comp, options.lockedStationUid!);
    if (suctions.length === 0 && discharges.length === 0) {
      comp.notify.error(
        'Configure suction or discharge points on this station before recording readings.',
      );
      return;
    }
    model.pipelineStationUid = options.lockedStationUid;
    model.suctionReadings = suctions.map((s: any) => ({
      suctionPointUid: s.uid,
      suctionPointName: s.name,
      temperature: null,
      pressure: null,
    }));
    model.dischargeReadings = discharges.map((d: any) => ({
      dischargePointUid: d.uid,
      dischargePointName: d.name,
      temperature: null,
      pressure: null,
    }));
  }

  const params: FormParameters = {
    title: 'Pipeline Station Reading',
    model,
    fields: getPipelineStationReadingFormFields({
      pipelineStationUid: options.lockedStationUid,
    }),
    formSteppers: getPipelineStationReadingFormSteppers(),
    linearSteppers: true,
    closeAction$: close$,
    onValueChanged: async (field, _control, form) => {
      if (field?.key !== 'pipelineStationUid') return;
      const value = form?.get('pipelineStationUid')?.value;
      if (!value || !form) return;
      await seedSubReadingsInto(comp, value, form);
    },
    onSubmit: async (value: any) => {
      await host.fetch({
        notify: true,
        mutation: CREATE_PIPELINE_STATION_READING,
        variables: { input: buildCreateInput(value) },
        successFn: () => {
          pipelineStationReading$.next(null);
          close$.next();
        },
      });
    },
  };

  comp.vs.openModal(FormComponent, params, '70%');
}

const pipelineStationReadingCrud = defineEntityCrud<PipelineStationReading>({
  name: 'Station Reading',
  modalTitle: 'Pipeline Station Reading',
  routeSlug: 'pipeline-station-readings',
  fields: (data) => getPipelineStationReadingFormFields(data),
  modalWidth: '70%',
  mutations: {
    create: CREATE_PIPELINE_STATION_READING,
    update: UPDATE_PIPELINE_STATION_READING,
    delete: DELETE_PIPELINE_STATION_READING,
  },
  permissions: {
    manage: ['ROLE_MANAGE_PIPELINE_STATION_READING'],
    delete: ['ROLE_DELETE_PIPELINE_STATION_READING'],
    view: ['ROLE_VIEW_PIPELINE_STATION_READING'],
  },
  statusGate: { edit: true, delete: true },
  statusResolver: processStatusFromTimestamps,
});

export const pipelineStationReading$ = pipelineStationReadingCrud.reload$;

export const pipelineStationReadingUpsertBtn = (comp: BaseComponent): ActionButton => {
  const base = pipelineStationReadingCrud.upsertBtn(crudHostFromBase(comp));
  return {
    ...base,
    disabledFunction: (row: any) => !!row?.uid,
    click: async (data?: any) => {
      if (data?.uid) return;
      await openReadingStepperForm(comp);
    },
  };
};

export const pipelineStationReadingDeleteBtn = (comp: BaseComponent): ActionButton =>
  pipelineStationReadingCrud.deleteBtn(crudHostFromBase(comp));

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Station Reading',
    permissions: ['ROLE_MANAGE_PIPELINE_STATION_READING'],
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Station Reading',
      message: 'Are you sure you want to submit this reading?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_PIPELINE_STATION_READING,
        variables: { uid: data.uid },
        successFn: () => pipelineStationReading$.next(null),
      });
    },
  };
}

export const pipelineStationReadingSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));

export const pipelineStationReadingApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_PIPELINE_STATION_READING,
    entityLabel: 'Station Reading',
    permission: 'ROLE_APPROVE_PIPELINE_STATION_READING',
    onSuccess: () => pipelineStationReading$.next(null),
    gateCreator: true,
  });

export const pipelineStationReadingRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_PIPELINE_STATION_READING,
    entityLabel: 'Pipeline Station Reading',
    permission: 'ROLE_APPROVE_PIPELINE_STATION_READING',
    onSuccess: () => pipelineStationReading$.next(null),
    gateCreator: true,
  });

export const pipelineStationReadingTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return pipelineStationReadingCrud.tableBtns(host, [
    pipelineStationReadingSubmitBtn(comp),
    pipelineStationReadingApproveBtn(comp),
    pipelineStationReadingRejectBtn(comp),
  ]);
};

/**
 * Pipeline Station Reading upsert bound to a specific station. Pre-fetches
 * suctions+discharges synchronously and opens the stepper form with rows
 * pre-seeded. Station picker step shows the station as read-only.
 */
export const pipelineStationReadingUpsertBtnForStation = (
  comp: BaseComponent,
  pipelineStationUid: string,
): ActionButton => {
  const base = pipelineStationReadingCrud.upsertBtn(crudHostFromBase(comp));
  return {
    ...base,
    disabledFunction: (row: any) => !!row?.uid,
    click: async (data?: any) => {
      if (data?.uid) return;
      await openReadingStepperForm(comp, { lockedStationUid: pipelineStationUid });
    },
  };
};

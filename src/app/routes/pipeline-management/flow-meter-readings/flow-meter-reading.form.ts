import { Subject } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
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
  canDelete,
  canEdit,
  canSubmit,
  crudHostFromBase,
  lookupOptions,
  processStatusFromTimestamps,
} from '@shared/crud';
import { pipelineLookupProvider } from '../pipelines/pipeline.provider';
import {
  APPROVE_FLOW_METER_READING,
  DELETE_FLOW_METER_READING,
  GET_DOWNSTREAMER_CLIENTS_BY_PIPELINE,
  REJECT_FLOW_METER_READING,
  SAVE_FLOW_METER_READING,
  SUBMIT_FLOW_METER_READING,
  UPDATE_FLOW_METER_READING,
} from './flow-meter-reading.graphql';
import {
  DownstreamerClient,
  FlowMeterReading,
  displayClient,
} from './flow-meter-reading.interface';

export const flowMeterReading$ = new Subject<unknown>();

export function getFlowMeterReadingFormFields(data?: any): FieldConfig[] {
  const lockedPipelineUid: string | undefined = data?.pipelineUid;
  const pipelinePrefilled = !!lockedPipelineUid;

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'pipelineUid',
      label: 'Pipeline',
      type: pipelinePrefilled ? FieldType.input : FieldType.select,
      visible: !pipelinePrefilled,
      validations: [VALIDATOR_REQUIRED],
      ...(pipelinePrefilled ? {} : { optionsVariables: lookupOptions(pipelineLookupProvider) }),
    },
    {
      key: 'readingTime',
      label: 'Reading Time',
      type: FieldType.dateTime,
      validations: [],
      maxDate: new Date(),
    },
    {
      key: 'readings',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      label: 'Client Readings',
      labelClass: 'p-0 pb-3',
      fieldsClass: 'grid grid-cols-3 gap-4',
      canAddFormGroup: false,
      expandable: false,
      showGroupLabel: false,
      fields: [
        { key: 'uid', type: FieldType.input, visible: false },
        {
          key: 'clientUid',
          type: FieldType.input,
          visible: false,
        },
        {
          key: 'clientName',
          label: 'Client Name',
          type: FieldType.input,
          ignoreOnSubmit: true,
        },
        {
          key: 'amount',
          label: 'Flow (Sm³/h)',
          type: FieldType.decimal,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'remarks',
          label: 'Remarks',
          type: FieldType.textarea,
          validations: [],
        },
      ],
    },
  ];
}

function getFlowMeterReadingFormSteppers(): FormStepper[] {
  return [
    { name: 'Pipeline', icon: 'workflow', keys: ['uid', 'pipelineUid', 'readingTime'] },
    { name: 'Readings', icon: 'dashboard', keys: ['readings'] },
  ];
}

const toLocalDateTime = (v: any): string | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const hasNumericValue = (v: any) => v !== null && v !== undefined && v !== '' && !Number.isNaN(+v);

const stripDisplayKeys = (rows: any[] | undefined) =>
  (rows ?? []).map(({ clientName, ...rest }: any) => rest);

const pruneEmptyReadings = (rows: any[] | undefined) =>
  (rows ?? []).filter((r) => !!r?.clientUid && hasNumericValue(r?.amount));

const buildCreateInput = (value: any) => ({
  pipelineUid: value?.pipelineUid,
  readingTime: toLocalDateTime(value?.readingTime) ?? toLocalDateTime(new Date()),
  readings: stripDisplayKeys(pruneEmptyReadings(value?.readings)),
});

function buildClientRowGroup(client: DownstreamerClient): FormGroup {
  return new FormGroup({
    uid: new FormControl(null),
    clientUid: new FormControl(client.uid ?? ''),
    clientName: new FormControl(displayClient(client)),
    amount: new FormControl(null, Validators.required),
    remarks: new FormControl(null),
  });
}

async function loadDownstreamerClients(
  comp: BaseComponent,
  pipelineUid: string,
): Promise<DownstreamerClient[]> {
  const page: any = await comp.fs.fetch({
    query: GET_DOWNSTREAMER_CLIENTS_BY_PIPELINE,
    variables: { pipelineUid },
  });
  const clients: DownstreamerClient[] = page?.content ?? [];
  return clients.filter((c) => !!c?.uid);
}

async function seedClientRowsInto(
  comp: BaseComponent,
  pipelineUid: string,
  form: FormGroup,
): Promise<void> {
  const clients = await loadDownstreamerClients(comp, pipelineUid);
  // Replace the FormArray entirely so the form-group-array picks up new controls
  // and re-renders inner rows (clear+push in place leaves stale inner components).
  form.setControl('readings', new FormArray<any>(clients.map((c) => buildClientRowGroup(c))));
}

async function openCreateStepperForm(
  comp: BaseComponent,
  options: { lockedPipelineUid?: string } = {},
): Promise<void> {
  const host = crudHostFromBase(comp);
  const close$ = new Subject<void>();
  const pipelineLocked = !!options.lockedPipelineUid;
  const model: any = {};

  if (pipelineLocked) {
    const clients = await loadDownstreamerClients(comp, options.lockedPipelineUid!);
    if (clients.length === 0) {
      comp.notify.error(
        'This pipeline has no downstreamer clients. Assign plants on the Pipeline page first.',
      );
      return;
    }
    model.pipelineUid = options.lockedPipelineUid;
    model.readings = clients.map((c) => ({
      clientUid: c.uid,
      clientName: displayClient(c),
      amount: null,
      remarks: null,
    }));
  }

  const params: FormParameters = {
    title: 'Flow Meter Reading',
    model,
    fields: getFlowMeterReadingFormFields({
      pipelineUid: options.lockedPipelineUid,
    }),
    formSteppers: getFlowMeterReadingFormSteppers(),
    linearSteppers: true,
    closeAction$: close$,
    onValueChanged: async (field, _control, form) => {
      if (field?.key !== 'pipelineUid') return;
      const value = form?.get('pipelineUid')?.value;
      if (!value || !form) return;
      await seedClientRowsInto(comp, value, form);
    },
    onSubmit: async (value: any) => {
      const readings = pruneEmptyReadings(value?.readings);
      if (readings.length === 0) {
        comp.notify.error('Enter an amount for at least one client before saving.');
        return;
      }
      await host.fetch({
        notify: true,
        mutation: SAVE_FLOW_METER_READING,
        variables: { input: buildCreateInput(value) },
        successFn: () => {
          flowMeterReading$.next(null);
          close$.next();
        },
      });
    },
  };

  comp.vs.openModal(FormComponent, params, '70%');
}

export const flowMeterReadingUpsertBtn = (comp: BaseComponent): ActionButton => ({
  icon: 'add',
  label: 'Take Reading',
  color: 'primary',
  class: 'btn-add-primary',
  permissions: ['ROLE_MANAGE_FLOW_METER_READING'],
  disabledFunction: (row: any) => !!row?.uid,
  click: async (data?: any) => {
    if (data?.uid) return;
    await openCreateStepperForm(comp);
  },
});

export const flowMeterReadingUpsertBtnForPipeline = (
  comp: BaseComponent,
  pipelineUid: string,
): ActionButton => ({
  icon: 'add',
  label: 'Take Reading',
  color: 'primary',
  class: 'btn-add-primary',
  permissions: ['ROLE_MANAGE_FLOW_METER_READING'],
  click: async () => {
    await openCreateStepperForm(comp, { lockedPipelineUid: pipelineUid });
  },
});

function buildDeleteBtn(host: CrudHost): ActionButton {
  return {
    icon: 'delete',
    label: 'Delete',
    class: 'text-danger',
    color: 'warn',
    permissions: ['ROLE_DELETE_FLOW_METER_READING'],
    showFunction: (row: any) => canDelete({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: (row: FlowMeterReading) => ({
      title: 'DELETE',
      confirmButtonColor: 'red',
      confirmText: 'DELETE',
      message: `Are you sure you want to delete the reading for <b class='text-danger'>${displayClient(row?.client) || 'this client'}</b>?`,
    }),
    click: (row: FlowMeterReading) => {
      host.fetch({
        notify: true,
        mutation: DELETE_FLOW_METER_READING,
        variables: { uid: row?.uid },
        successFn: () => flowMeterReading$.next(null),
      });
    },
  };
}

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Flow Meter Reading',
    permissions: ['ROLE_MANAGE_FLOW_METER_READING'],
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Flow Meter Reading',
      message: 'Are you sure you want to submit this reading?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_FLOW_METER_READING,
        variables: { uid: data.uid },
        successFn: () => flowMeterReading$.next(null),
      });
    },
  };
}

export const flowMeterReadingDeleteBtn = (comp: BaseComponent): ActionButton =>
  buildDeleteBtn(crudHostFromBase(comp));

export const flowMeterReadingSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));

export const flowMeterReadingApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_FLOW_METER_READING,
    entityLabel: 'Flow Meter Reading',
    permission: 'ROLE_APPROVE_FLOW_METER_READING',
    onSuccess: () => flowMeterReading$.next(null),
    gateCreator: true,
  });

export const flowMeterReadingRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_FLOW_METER_READING,
    entityLabel: 'Flow Meter Reading',
    permission: 'ROLE_APPROVE_FLOW_METER_READING',
    onSuccess: () => flowMeterReading$.next(null),
    gateCreator: true,
  });

function buildEditBtn(host: CrudHost): ActionButton {
  return {
    icon: 'edit',
    label: 'Edit',
    class: 'btn-edit-secondary',
    permissions: ['ROLE_MANAGE_FLOW_METER_READING'],
    showFunction: (row: any) => canEdit({ status: processStatusFromTimestamps(row) }),
    click: (row: FlowMeterReading) => {
      const close$ = new Subject<void>();
      const readingTimeDisplay = row?.readingTime ? new Date(row.readingTime).toLocaleString() : '';
      const params: FormParameters = {
        title: 'Edit Flow Meter Reading',
        model: {
          pipelineName: row?.pipeline?.name,
          clientName: displayClient(row?.client),
          readingTimeDisplay,
          amount: row?.amount,
          remarks: row?.remarks,
        },
        fields: [
          {
            key: 'pipelineName',
            label: 'Pipeline',
            type: FieldType.input,
            disabled: true,
            ignoreOnSubmit: true,
          },
          {
            key: 'clientName',
            label: 'Client',
            type: FieldType.input,
            disabled: true,
            ignoreOnSubmit: true,
          },
          {
            key: 'readingTimeDisplay',
            label: 'Reading Time',
            type: FieldType.input,
            disabled: true,
            ignoreOnSubmit: true,
          },
          {
            key: 'amount',
            label: 'Flow (Sm³/h)',
            type: FieldType.decimal,
            validations: [VALIDATOR_REQUIRED],
          },
          {
            key: 'remarks',
            label: 'Remarks',
            class: 'col-span-full',
            type: FieldType.textarea,
            validations: [],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: UPDATE_FLOW_METER_READING,
            variables: {
              input: {
                pipelineUid: row?.pipeline?.uid,
                readingTime: row?.readingTime,
                readings: [
                  {
                    uid: row?.uid,
                    amount: value?.amount,
                    remarks: value?.remarks,
                    clientUid: row?.client?.uid,
                  },
                ],
              },
            },
            successFn: () => {
              flowMeterReading$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '50%');
    },
  };
}

export const flowMeterReadingEditBtn = (comp: BaseComponent): ActionButton =>
  buildEditBtn(crudHostFromBase(comp));

function buildViewBtn(host: CrudHost): ActionButton {
  return {
    icon: 'view',
    label: 'View Flow Meter Reading',
    permissions: ['ROLE_VIEW_FLOW_METER_READING', 'ROLE_MANAGE_FLOW_METER_READING'],
    click: (row: FlowMeterReading) => host.navigate('flow-meter-readings', row?.uid),
  };
}

export const flowMeterReadingViewBtn = (comp: BaseComponent): ActionButton =>
  buildViewBtn(crudHostFromBase(comp));

export const flowMeterReadingTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return [
    {
      ...MORE_BTN,
      buttons: [
        buildViewBtn(host),
        buildEditBtn(host),
        flowMeterReadingSubmitBtn(comp),
        flowMeterReadingApproveBtn(comp),
        flowMeterReadingRejectBtn(comp),
        buildDeleteBtn(host),
      ],
    },
  ];
};

import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import {
  buildApproveBtn,
  buildRejectBtn,
  canSubmit,
  crudHostFromBase,
  lookupOptions,
  processStatusFromTimestamps,
} from '@shared/crud';
import { workingStationLookupProvider } from '../../../pipeline-management/working-stations/working-station.provider';
import { emissionSubstanceLookupProvider } from '../emission-substances/emission-substance.provider';
import {
  APPROVE_EMISSION_LOG,
  CREATE_OR_UPDATE_EMISSION_LOG,
  DELETE_EMISSION_LOG,
  GET_EMISSION_LOG_BY_UID,
  REJECT_EMISSION_LOG,
  SUBMIT_EMISSION_LOG,
} from './emission-log.graphql';

export const emissionLog$ = new Subject<any>();

const MANAGE_PERMS = ['ROLE_MANAGE_EMISSION_LOG'];
const DELETE_PERMS = ['ROLE_DELETE_EMISSION_LOG'];
const APPROVE_PERMS = ['ROLE_APPROVE_EMISSION_LOG'];

const toDateStr = (d: any): string | undefined => {
  if (!d) return undefined;
  const s = typeof d === 'string' ? d : new Date(d).toISOString();
  return s.split('T')[0];
};

export function getEmissionLogFormFields(data?: any, unitLabel?: string): FieldConfig[] {
  const substanceLocked = !!data?.emissionSubstanceUid;
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'emissionSubstanceUid',
      label: 'Emission Substance',
      type: substanceLocked ? FieldType.input : FieldType.select,
      visible: !substanceLocked,
      optionsVariables: substanceLocked ? undefined : lookupOptions(emissionSubstanceLookupProvider),
      validations: substanceLocked ? [] : [VALIDATOR_REQUIRED],
    },
    {
      key: 'workingStationUid',
      label: 'Working Station',
      type: FieldType.select,
      optionsVariables: lookupOptions(workingStationLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'date',
      label: 'Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
    },
    {
      key: 'amountEmitted',
      label: 'Amount Emitted',
      type: FieldType.decimal,
      decimals: 2,
      hint: unitLabel ? `Measured in ${unitLabel} (set by the emission substance)` : undefined,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

export function emissionLogUpsertBtnForSubstance(
  comp: BaseComponent,
  emissionSubstanceUid: string,
  unitLabel?: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_EMISSION_LOG_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const raw = fresh ?? data;
      const seed = {
        ...(raw ?? {}),
        emissionSubstanceUid,
        workingStationUid: raw?.workingStationUid ?? raw?.workingStation?.uid,
      };
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Emission Log',
        fields: getEmissionLogFormFields(seed, unitLabel),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_EMISSION_LOG,
            variables: {
              input: {
                uid: value?.uid,
                emissionSubstanceUid: value?.emissionSubstanceUid,
                workingStationUid: value?.workingStationUid,
                date: toDateStr(value?.date),
                amountEmitted: value?.amountEmitted,
                remarks: value?.remarks,
              },
            },
            successFn: (res) => {
              emissionLog$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Emission Log'),
  };
}

export function emissionLogDeleteBtn(
  comp: BaseComponent,
  onAfterSuccess?: () => void,
): ActionButton {
  return {
    ...getDeleteBtnProps('Emission Log'),
    permissions: DELETE_PERMS,
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_EMISSION_LOG,
        variables: { uid: data.uid },
        successFn: () => {
          emissionLog$.next(null);
          onAfterSuccess?.();
        },
      });
    },
  };
}

export function emissionLogViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'visibility',
    label: 'View',
    color: 'primary',
    toolTip: 'View Emission Log',
    permissions: ['ROLE_VIEW_EMISSION_LOG'],
    click: (row: any) => {
      if (!row?.uid) return;
      comp.router.navigate(['/hse/emission-logs', row.uid]);
    },
  };
}

export function emissionLogSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Emission Log',
    permissions: MANAGE_PERMS,
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Emission Log',
      message: 'Are you sure you want to submit this log?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: SUBMIT_EMISSION_LOG,
        variables: { uid: data.uid },
        successFn: () => emissionLog$.next(null),
      });
    },
  };
}

export function emissionLogApproveBtn(comp: BaseComponent): ActionButton {
  return buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_EMISSION_LOG,
    entityLabel: 'Emission Log',
    permission: APPROVE_PERMS[0],
    onSuccess: () => emissionLog$.next(null),
    gateCreator: true,
  });
}

export function emissionLogRejectBtn(comp: BaseComponent): ActionButton {
  return buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_EMISSION_LOG,
    entityLabel: 'Emission Log',
    permission: APPROVE_PERMS[0],
    onSuccess: () => emissionLog$.next(null),
    gateCreator: true,
  });
}

export function emissionLogTableBtnsForSubstance(
  comp: BaseComponent,
  emissionSubstanceUid: string,
  unitLabel?: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        emissionLogUpsertBtnForSubstance(comp, emissionSubstanceUid, unitLabel),
        emissionLogSubmitBtn(comp),
        emissionLogApproveBtn(comp),
        emissionLogRejectBtn(comp),
        emissionLogDeleteBtn(comp),
      ],
    },
  ];
}

export function emissionLogUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_EMISSION_LOG_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const raw = fresh ?? data;
      const seed = {
        ...(raw ?? {}),
        emissionSubstanceUid: raw?.emissionSubstanceUid ?? raw?.emissionSubstance?.uid,
        workingStationUid: raw?.workingStationUid ?? raw?.workingStation?.uid,
      };
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Emission Log',
        fields: getEmissionLogFormFields(seed, raw?.emissionSubstance?.unitOfMeasure),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_EMISSION_LOG,
            variables: {
              input: {
                uid: value?.uid,
                emissionSubstanceUid: value?.emissionSubstanceUid,
                workingStationUid: value?.workingStationUid,
                date: toDateStr(value?.date),
                amountEmitted: value?.amountEmitted,
                remarks: value?.remarks,
              },
            },
            successFn: (res) => {
              emissionLog$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Emission Log'),
  };
}

export function emissionLogTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        emissionLogUpsertBtn(comp),
        emissionLogSubmitBtn(comp),
        emissionLogApproveBtn(comp),
        emissionLogRejectBtn(comp),
        emissionLogDeleteBtn(comp),
      ],
    },
  ];
}

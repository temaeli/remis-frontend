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
import { energyUseLookupProvider } from '../energy-uses/energy-use.provider';
import {
  APPROVE_ENERGY_USAGE,
  CREATE_OR_UPDATE_ENERGY_USAGE,
  DELETE_ENERGY_USAGE,
  GET_ENERGY_USAGE_BY_UID,
  REJECT_ENERGY_USAGE,
  SUBMIT_ENERGY_USAGE,
} from './energy-usage.graphql';

export const energyUsage$ = new Subject<any>();

const MANAGE_PERMS = ['ROLE_MANAGE_ENERGY_USAGE'];
const DELETE_PERMS = ['ROLE_DELETE_ENERGY_USAGE'];
const APPROVE_PERMS = ['ROLE_APPROVE_ENERGY_USAGE'];

const toDateStr = (d: any): string | undefined => {
  if (!d) return undefined;
  const s = typeof d === 'string' ? d : new Date(d).toISOString();
  return s.split('T')[0];
};

export function getEnergyUsageFormFields(data?: any, unitLabel?: string): FieldConfig[] {
  const useLocked = !!data?.energyUseUid;
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'energyUseUid',
      label: 'Energy Use',
      type: useLocked ? FieldType.input : FieldType.select,
      visible: !useLocked,
      optionsVariables: useLocked ? undefined : lookupOptions(energyUseLookupProvider),
      validations: useLocked ? [] : [VALIDATOR_REQUIRED],
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
      label: 'Month',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
    },
    {
      key: 'amountUsed',
      label: 'Amount Used',
      type: FieldType.decimal,
      decimals: 2,
      hint: unitLabel ? `Measured in ${unitLabel} (set by the energy use)` : undefined,
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

export function energyUsageUpsertBtnForEnergyUse(
  comp: BaseComponent,
  energyUseUid: string,
  unitLabel?: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_ENERGY_USAGE_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const raw = fresh ?? data;
      const seed = {
        ...(raw ?? {}),
        energyUseUid,
        workingStationUid: raw?.workingStationUid ?? raw?.workingStation?.uid,
      };
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Energy Usage',
        fields: getEnergyUsageFormFields(seed, unitLabel),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_ENERGY_USAGE,
            variables: {
              input: {
                uid: value?.uid,
                energyUseUid: value?.energyUseUid,
                workingStationUid: value?.workingStationUid,
                date: toDateStr(value?.date),
                amountUsed: value?.amountUsed,
                remarks: value?.remarks,
              },
            },
            successFn: (res) => {
              energyUsage$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Energy Usage'),
  };
}

export function energyUsageDeleteBtn(
  comp: BaseComponent,
  onAfterSuccess?: () => void,
): ActionButton {
  return {
    ...getDeleteBtnProps('Energy Usage'),
    permissions: DELETE_PERMS,
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_ENERGY_USAGE,
        variables: { uid: data.uid },
        successFn: () => {
          energyUsage$.next(null);
          onAfterSuccess?.();
        },
      });
    },
  };
}

export function energyUsageViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'visibility',
    label: 'View',
    color: 'primary',
    toolTip: 'View Energy Usage',
    permissions: ['ROLE_VIEW_ENERGY_USAGE'],
    click: (row: any) => {
      if (!row?.uid) return;
      comp.router.navigate(['/hse/energy-usages', row.uid]);
    },
  };
}

export function energyUsageSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Energy Usage',
    permissions: MANAGE_PERMS,
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Energy Usage',
      message: 'Are you sure you want to submit this usage?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: SUBMIT_ENERGY_USAGE,
        variables: { uid: data.uid },
        successFn: () => energyUsage$.next(null),
      });
    },
  };
}

export function energyUsageApproveBtn(comp: BaseComponent): ActionButton {
  return buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_ENERGY_USAGE,
    entityLabel: 'Energy Usage',
    permission: APPROVE_PERMS[0],
    onSuccess: () => energyUsage$.next(null),
    gateCreator: true,
  });
}

export function energyUsageRejectBtn(comp: BaseComponent): ActionButton {
  return buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_ENERGY_USAGE,
    entityLabel: 'Energy Usage',
    permission: APPROVE_PERMS[0],
    onSuccess: () => energyUsage$.next(null),
    gateCreator: true,
  });
}

export function energyUsageTableBtnsForEnergyUse(
  comp: BaseComponent,
  energyUseUid: string,
  unitLabel?: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        energyUsageUpsertBtnForEnergyUse(comp, energyUseUid, unitLabel),
        energyUsageSubmitBtn(comp),
        energyUsageApproveBtn(comp),
        energyUsageRejectBtn(comp),
        energyUsageDeleteBtn(comp),
      ],
    },
  ];
}

export function energyUsageUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_ENERGY_USAGE_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const raw = fresh ?? data;
      const seed = {
        ...(raw ?? {}),
        energyUseUid: raw?.energyUseUid ?? raw?.energyUse?.uid,
        workingStationUid: raw?.workingStationUid ?? raw?.workingStation?.uid,
      };
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Energy Usage',
        fields: getEnergyUsageFormFields(seed, raw?.energyUse?.unitOfMeasure),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_ENERGY_USAGE,
            variables: {
              input: {
                uid: value?.uid,
                energyUseUid: value?.energyUseUid,
                workingStationUid: value?.workingStationUid,
                date: toDateStr(value?.date),
                amountUsed: value?.amountUsed,
                remarks: value?.remarks,
              },
            },
            successFn: (res) => {
              energyUsage$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Energy Usage'),
  };
}

export function energyUsageTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        energyUsageUpsertBtn(comp),
        energyUsageSubmitBtn(comp),
        energyUsageApproveBtn(comp),
        energyUsageRejectBtn(comp),
        energyUsageDeleteBtn(comp),
      ],
    },
  ];
}

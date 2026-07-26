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
import { waterUseLookupProvider } from '../water-uses/water-use.provider';
import {
  APPROVE_WATER_USAGE,
  CREATE_OR_UPDATE_WATER_USAGE,
  DELETE_WATER_USAGE,
  GET_WATER_USAGE_BY_UID,
  REJECT_WATER_USAGE,
  SUBMIT_WATER_USAGE,
} from './water-usage.graphql';

export const waterUsage$ = new Subject<any>();

const MANAGE_PERMS = ['ROLE_MANAGE_WATER_USAGE'];
const DELETE_PERMS = ['ROLE_DELETE_WATER_USAGE'];
const APPROVE_PERMS = ['ROLE_APPROVE_WATER_USAGE'];

const toDateStr = (d: any): string | undefined => {
  if (!d) return undefined;
  const s = typeof d === 'string' ? d : new Date(d).toISOString();
  return s.split('T')[0];
};

export function getWaterUsageFormFields(data?: any): FieldConfig[] {
  const useLocked = !!data?.waterUseUid;
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'waterUseUid',
      label: 'Water Use',
      type: useLocked ? FieldType.input : FieldType.select,
      visible: !useLocked,
      optionsVariables: useLocked ? undefined : lookupOptions(waterUseLookupProvider),
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
      key: 'meterReading',
      label: 'Meter Reading',
      type: FieldType.decimal,
      decimals: 2,
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

export function waterUsageUpsertBtnForWaterUse(
  comp: BaseComponent,
  waterUseUid: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_WATER_USAGE_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const raw = fresh ?? data;
      const seed = {
        ...(raw ?? {}),
        waterUseUid,
        workingStationUid: raw?.workingStationUid ?? raw?.workingStation?.uid,
      };
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Water Usage',
        fields: getWaterUsageFormFields(seed),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_WATER_USAGE,
            variables: {
              input: {
                uid: value?.uid,
                waterUseUid: value?.waterUseUid,
                workingStationUid: value?.workingStationUid,
                date: toDateStr(value?.date),
                meterReading: value?.meterReading,
                remarks: value?.remarks,
              },
            },
            successFn: (res) => {
              waterUsage$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Water Usage'),
  };
}

export function waterUsageDeleteBtn(
  comp: BaseComponent,
  onAfterSuccess?: () => void,
): ActionButton {
  return {
    ...getDeleteBtnProps('Water Usage'),
    permissions: DELETE_PERMS,
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_WATER_USAGE,
        variables: { uid: data.uid },
        successFn: () => {
          waterUsage$.next(null);
          onAfterSuccess?.();
        },
      });
    },
  };
}

export function waterUsageViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'visibility',
    label: 'View',
    color: 'primary',
    toolTip: 'View Water Usage',
    permissions: ['ROLE_VIEW_WATER_USAGE'],
    click: (row: any) => {
      if (!row?.uid) return;
      comp.router.navigate(['/hse/water-usages', row.uid]);
    },
  };
}

export function waterUsageSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Water Usage',
    permissions: MANAGE_PERMS,
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Water Usage',
      message: 'Are you sure you want to submit this usage?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: SUBMIT_WATER_USAGE,
        variables: { uid: data.uid },
        successFn: () => waterUsage$.next(null),
      });
    },
  };
}

export function waterUsageApproveBtn(comp: BaseComponent): ActionButton {
  return buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_WATER_USAGE,
    entityLabel: 'Water Usage',
    permission: APPROVE_PERMS[0],
    onSuccess: () => waterUsage$.next(null),
    gateCreator: true,
  });
}

export function waterUsageRejectBtn(comp: BaseComponent): ActionButton {
  return buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_WATER_USAGE,
    entityLabel: 'Water Usage',
    permission: APPROVE_PERMS[0],
    onSuccess: () => waterUsage$.next(null),
    gateCreator: true,
  });
}

export function waterUsageTableBtnsForWaterUse(
  comp: BaseComponent,
  waterUseUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        waterUsageUpsertBtnForWaterUse(comp, waterUseUid),
        waterUsageSubmitBtn(comp),
        waterUsageApproveBtn(comp),
        waterUsageRejectBtn(comp),
        waterUsageDeleteBtn(comp),
      ],
    },
  ];
}

export function waterUsageUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_WATER_USAGE_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const raw = fresh ?? data;
      const seed = {
        ...(raw ?? {}),
        waterUseUid: raw?.waterUseUid ?? raw?.waterUse?.uid,
        workingStationUid: raw?.workingStationUid ?? raw?.workingStation?.uid,
      };
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Water Usage',
        fields: getWaterUsageFormFields(seed),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_WATER_USAGE,
            variables: {
              input: {
                uid: value?.uid,
                waterUseUid: value?.waterUseUid,
                workingStationUid: value?.workingStationUid,
                date: toDateStr(value?.date),
                meterReading: value?.meterReading,
                remarks: value?.remarks,
              },
            },
            successFn: (res) => {
              waterUsage$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Water Usage'),
  };
}

export function waterUsageTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        waterUsageUpsertBtn(comp),
        waterUsageSubmitBtn(comp),
        waterUsageApproveBtn(comp),
        waterUsageRejectBtn(comp),
        waterUsageDeleteBtn(comp),
      ],
    },
  ];
}

import { FormGroup } from '@angular/forms';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { mainFacilityLookupProvider } from '../main-facilities/main-facility.provider';
import {
  CREATE_OR_UPDATE_MAIN_FACILITY_SCHEDULE,
  DELETE_MAIN_FACILITY_SCHEDULE,
} from './main-facility-schedule.graphql';
import { MainFacilitySchedule } from './main-facility-schedule.interface';

const FALLBACK_HINT = 'Sum of Online + Offline + Downtime must equal 24.';

export function getMainFacilityScheduleFormFields(data?: MainFacilitySchedule | any): FieldConfig[] {
  const lockedFacilityUid: string | undefined = data?.facilityUid;
  const facilityPrefilled = !!lockedFacilityUid;

  const onlineField: FieldConfig = {
    key: 'online',
    label: 'Online (hrs)',
    type: FieldType.decimal,
    min: 0,
    max: 24,
    validations: [VALIDATOR_REQUIRED],
    hint: FALLBACK_HINT,
  };
  const offlineField: FieldConfig = {
    key: 'offline',
    label: 'Offline (hrs)',
    type: FieldType.decimal,
    min: 0,
    max: 24,
    validations: [VALIDATOR_REQUIRED],
    hint: FALLBACK_HINT,
  };
  const downtimeField: FieldConfig = {
    key: 'downtime',
    label: 'Downtime (hrs)',
    type: FieldType.decimal,
    min: 0,
    max: 24,
    validations: [VALIDATOR_REQUIRED],
    hint: FALLBACK_HINT,
  };

  const applySum = (form?: FormGroup): void => {
    if (!form) return;
    const online = Number(form.get('online')?.value ?? 0) || 0;
    const offline = Number(form.get('offline')?.value ?? 0) || 0;
    const downtime = Number(form.get('downtime')?.value ?? 0) || 0;
    const total = online + offline + downtime;
    const rounded = Math.round(total * 100) / 100;
    const ok = rounded === 24;
    const hint = ok ? `Total: ${rounded} / 24 hours` : `Total: ${rounded} / 24 hours — must equal 24`;
    onlineField.hint = hint;
    offlineField.hint = hint;
    downtimeField.hint = hint;
    if (ok) {
      form.setErrors(null);
    } else {
      form.setErrors({ sumNot24: true });
    }
  };

  onlineField.onChange = (_v, form) => applySum(form);
  offlineField.onChange = (_v, form) => applySum(form);
  downtimeField.onChange = (_v, form) => applySum(form);

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'facilityUid',
      label: 'Main Facility',
      type: facilityPrefilled ? FieldType.input : FieldType.select,
      visible: !facilityPrefilled,
      validations: [VALIDATOR_REQUIRED],
      ...(facilityPrefilled ? {} : { optionsVariables: lookupOptions(mainFacilityLookupProvider) }),
    },
    {
      key: 'date',
      label: 'Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      minDate: new Date(),
    },
    onlineField,
    offlineField,
    downtimeField,
    {
      key: 'remarks',
      label: 'Remarks',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

const scheduleCrud = defineEntityCrud<MainFacilitySchedule>({
  name: 'Schedule',
  modalTitle: 'Facility Operation Schedule',
  fields: (data) => getMainFacilityScheduleFormFields(data),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_MAIN_FACILITY_SCHEDULE,
    update: CREATE_OR_UPDATE_MAIN_FACILITY_SCHEDULE,
    delete: DELETE_MAIN_FACILITY_SCHEDULE,
  },
  permissions: {
    manage: ['ROLE_MANAGE_MAIN_FACILITY_SCHEDULE'],
    delete: ['ROLE_DELETE_MAIN_FACILITY_SCHEDULE'],
    view: ['ROLE_VIEW_MAIN_FACILITY_SCHEDULE'],
  },
  modelMapper: (data: any) => {
    const model: any = { ...(data ?? {}) };
    if (model.facility && !model.facilityUid) {
      model.facilityUid = model.facility.uid;
    }
    return model;
  },
});

export const mainFacilitySchedule$ = scheduleCrud.reload$;

export const mainFacilityScheduleUpsertBtn = (comp: BaseComponent): ActionButton =>
  scheduleCrud.upsertBtn(crudHostFromBase(comp));

export const mainFacilityScheduleDeleteBtn = (comp: BaseComponent): ActionButton =>
  scheduleCrud.deleteBtn(crudHostFromBase(comp));

export const mainFacilityScheduleTableBtns = (comp: BaseComponent): ActionButton[] =>
  scheduleCrud.tableBtns(crudHostFromBase(comp));

/**
 * Schedule upsert button bound to a specific facility. Hides + seeds the
 * facility field so the modal opens with facilityUid already chosen.
 */
export const mainFacilityScheduleUpsertBtnForFacility = (
  comp: BaseComponent,
  facilityUid: string,
): ActionButton => {
  const base = scheduleCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: (data?: any) => {
      const isCreate = !data?.uid;
      const seed = isCreate ? { ...(data ?? {}), facilityUid } : data;
      originalClick?.(seed);
    },
  };
};

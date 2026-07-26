import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
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
import { workingStationLookupProvider } from '../../pipeline-management/working-stations/working-station.provider';
import { GET_ALL_MANPOWER_CATEGORIES } from '../manpower-categories/manpower-category.graphql';
import {
  APPROVE_MANPOWER_ATTENDANCE,
  CREATE_MANPOWER_ATTENDANCE,
  CREATE_MANPOWER_ATTENDED,
  DELETE_MANPOWER_ATTENDANCE,
  DELETE_MANPOWER_ATTENDED,
  GET_MANPOWER_ATTENDED_BY_UID,
  REJECT_MANPOWER_ATTENDANCE,
  SUBMIT_MANPOWER_ATTENDANCE,
  UPDATE_MANPOWER_ATTENDANCE,
  UPDATE_MANPOWER_ATTENDED,
} from './manpower-attendance.graphql';
import { ManpowerAttendance, ManpowerAttended } from './manpower-attendance.interface';
import { manpowerCategoryLookupProvider } from '../manpower-categories/manpower-category.provider';

export function getManpowerAttendanceFormFields(data?: ManpowerAttendance | any): FieldConfig[] {
  const lockedStationUid: string | undefined = data?.workStationUid;
  const stationPrefilled = !!lockedStationUid;

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'workStationUid',
      label: 'Working Station',
      type: stationPrefilled ? FieldType.input : FieldType.select,
      visible: !stationPrefilled,
      validations: [VALIDATOR_REQUIRED],
      ...(stationPrefilled
        ? {}
        : { optionsVariables: lookupOptions(workingStationLookupProvider) }),
    },
    {
      key: 'date',
      label: 'Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
    },
    {
      key: 'remarks',
      label: 'Remarks',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'manpowerAttended',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      label: 'Attended by Category',
      labelClass: 'p-0 pb-3',
      fieldsClass: 'grid grid-cols-3 gap-4',
      canAddFormGroup: false,
      expandable: false,
      fields: [
        { key: 'uid', type: FieldType.input, visible: false },
        {
          key: 'manpowerCategoryUid',
          type: FieldType.input,
          visible: false,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'manpowerCategoryName',
          label: 'Category',
          type: FieldType.label,
          valueAsLabel: true,
          innerClass: 'bg-gray-400/10 rounded-lg p-3',
          disabled: true,
          ignoreOnSubmit: true,
        },
        {
          key: 'attended',
          label: 'Attended',
          type: FieldType.number,
          validations: [],
        },
      ],
    },
  ];
}

const hasValue = (v: any) => v !== null && v !== undefined && v !== '';

const pruneEmptyAttended = (rows: any[] | undefined) =>
  (rows ?? []).filter((r) => hasValue(r?.attended));

const stripDisplayKeys = (rows: any[] | undefined) =>
  (rows ?? []).map(({ manpowerCategoryName, ...rest }: any) => rest);

const manpowerAttendanceCrud = defineEntityCrud<ManpowerAttendance>({
  name: 'Attendance',
  modalTitle: 'Manpower Attendance',
  routeSlug: 'manpower-attendances',
  fields: (data) => getManpowerAttendanceFormFields(data),
  modalWidth: '60%',
  mutations: {
    create: CREATE_MANPOWER_ATTENDANCE,
    update: UPDATE_MANPOWER_ATTENDANCE,
    delete: DELETE_MANPOWER_ATTENDANCE,
  },
  upsertVariables: (value: any) => ({
    input: {
      ...value,
      manpowerAttended: stripDisplayKeys(pruneEmptyAttended(value?.manpowerAttended)),
    },
  }),
  permissions: {
    manage: ['ROLE_MANAGE_MANPOWER_ATTENDANCE'],
    delete: ['ROLE_DELETE_MANPOWER_ATTENDANCE'],
    view: ['ROLE_VIEW_MANPOWER_ATTENDANCE'],
  },
  statusGate: { edit: true, delete: true },
  statusResolver: processStatusFromTimestamps,
  modelMapper: (data: any) => {
    const model: any = { ...(data ?? {}) };
    if (model.station && !model.workStationUid) {
      model.workStationUid = model.station.uid;
    }
    if (Array.isArray(model.manpowerAttended)) {
      model.manpowerAttended = model.manpowerAttended.map((row: any) => ({
        uid: row?.uid,
        attended: row?.attended,
        manpowerCategoryUid: row?.manpowerCategoryUid ?? row?.category?.uid,
        manpowerCategoryName: row?.manpowerCategoryName ?? row?.category?.name,
      }));
    }
    return model;
  },
});

async function loadManpowerCategories(comp: BaseComponent): Promise<any[]> {
  const page = await comp.fs.fetch({
    query: GET_ALL_MANPOWER_CATEGORIES,
    variables: { active: true, pageableParam: { size: 1000 } },
  });
  return page?.content ?? [];
}

async function withCategorySeed(comp: BaseComponent, data?: any): Promise<any> {
  if (data?.uid) return data;
  const categories = await loadManpowerCategories(comp);
  if (categories.length === 0) {
    comp.notify.error('Configure manpower categories before recording attendance.');
    return null;
  }
  return {
    ...(data ?? {}),
    manpowerAttended: categories.map((c: any) => ({
      manpowerCategoryUid: c.uid,
      manpowerCategoryName: c.name,
      attended: null,
    })),
  };
}

export const manpowerAttendance$ = manpowerAttendanceCrud.reload$;

export const attendanceUpsertBtn = (comp: BaseComponent): ActionButton => {
  const base = manpowerAttendanceCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: async (data?: any) => {
      const seed = await withCategorySeed(comp, data);
      if (seed === null) return;
      originalClick?.(seed);
    },
  };
};

export const attendanceDeleteBtn = (comp: BaseComponent): ActionButton =>
  manpowerAttendanceCrud.deleteBtn(crudHostFromBase(comp));

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Attendance',
    permissions: ['ROLE_MANAGE_MANPOWER_ATTENDANCE'],
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Attendance',
      message: 'Are you sure you want to submit this attendance?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_MANPOWER_ATTENDANCE,
        variables: { uid: data.uid },
        successFn: () => manpowerAttendance$.next(null),
      });
    },
  };
}

export const attendanceSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));

export const attendanceApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_MANPOWER_ATTENDANCE,
    entityLabel: 'Attendance',
    permission: 'ROLE_APPROVE_MANPOWER_ATTENDANCE',
    onSuccess: () => manpowerAttendance$.next(null),
    gateCreator: true,
  });

export const attendanceRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_MANPOWER_ATTENDANCE,
    entityLabel: 'Manpower Attendance',
    permission: 'ROLE_APPROVE_MANPOWER_ATTENDANCE',
    onSuccess: () => manpowerAttendance$.next(null),
    gateCreator: true,
  });

export const attendanceTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return manpowerAttendanceCrud.tableBtns(host);
};

/**
 * Read-only kebab: View only, no mutations. Used by the pipeline Working Station
 * detail, where attendance is read-only (management lives in HSE).
 */
export const attendanceViewBtns = (comp: BaseComponent): ActionButton[] => {
  const view = manpowerAttendanceCrud.viewBtn(crudHostFromBase(comp));
  return view ? [{ ...MORE_BTN, buttons: [view] }] : [];
};

/**
 * Attendance upsert button bound to a specific working station. Hides+seeds the
 * station field and pre-seeds one row per manpower category.
 */
export const attendanceUpsertBtnForWorkstation = (
  comp: BaseComponent,
  workStationUid: string,
): ActionButton => {
  const base = manpowerAttendanceCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: async (data?: any) => {
      if (data?.uid) {
        originalClick?.(data);
        return;
      }
      const seed = await withCategorySeed(comp, { ...(data ?? {}), workStationUid });
      if (seed === null) return;
      originalClick?.(seed);
    },
  };
};

const manpowerAttendedCrud = defineEntityCrud<ManpowerAttended>({
  name: 'Attended Row',
  modalTitle: 'Attended by Category',
  fields: (data?: any) => {
    const isEdit = !!data?.uid;
    return [
      { key: 'uid', type: FieldType.input, visible: false },
      { key: 'attendanceUid', type: FieldType.input, visible: false },
      {
        key: 'manpowerCategoryUid',
        label: 'Category',
        type: isEdit ? FieldType.input : FieldType.select,
        disabled: isEdit,
        validations: [VALIDATOR_REQUIRED],
        ...(isEdit ? {} : { optionsVariables: lookupOptions(manpowerCategoryLookupProvider) }),
      },
      {
        key: 'manpowerCategoryName',
        label: 'Category',
        type: FieldType.label,
        valueAsLabel: true,
        innerClass: 'bg-gray-400/10 rounded-lg p-3',
        disabled: true,
        ignoreOnSubmit: true,
        visible: isEdit,
      },
      {
        key: 'attended',
        label: 'Attended',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
    ];
  },
  modalWidth: '40%',
  mutations: {
    create: CREATE_MANPOWER_ATTENDED,
    update: UPDATE_MANPOWER_ATTENDED,
    delete: DELETE_MANPOWER_ATTENDED,
  },
  upsertVariables: (value: any) => ({
    input: {
      uid: value?.uid,
      attendanceUid: value?.attendanceUid,
      attended: value?.attended,
      manpowerCategoryUid: value?.manpowerCategoryUid,
    },
  }),
  permissions: {
    manage: ['ROLE_MANAGE_MANPOWER_ATTENDANCE'],
    delete: ['ROLE_DELETE_MANPOWER_ATTENDANCE'],
    view: ['ROLE_VIEW_MANPOWER_ATTENDANCE'],
  },
  modelMapper: (data: any) => ({
    ...(data ?? {}),
    manpowerCategoryUid: data?.manpowerCategoryUid ?? data?.category?.uid,
    manpowerCategoryName: data?.manpowerCategoryName ?? data?.category?.name,
    attendanceUid: data?.attendanceUid ?? data?.attendance?.uid,
  }),
});

export const manpowerAttended$ = manpowerAttendedCrud.reload$;

export const attendedUpsertBtnForAttendance = (
  comp: BaseComponent,
  attendanceUid: string,
): ActionButton => {
  const base = manpowerAttendedCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_MANPOWER_ATTENDED_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      originalClick?.({ ...(fresh ?? data ?? {}), attendanceUid });
    },
  };
};

export const attendedDeleteBtn = (comp: BaseComponent): ActionButton =>
  manpowerAttendedCrud.deleteBtn(crudHostFromBase(comp));

export const attendedTableBtnsForAttendance = (
  comp: BaseComponent,
  attendanceUid: string,
): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return [
    {
      ...MORE_BTN,
      buttons: [attendedUpsertBtnForAttendance(comp, attendanceUid), attendedDeleteBtn(comp)],
    },
  ];
};

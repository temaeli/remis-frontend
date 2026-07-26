import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { stationOptions, guardOptions } from '../shared/security-lookups';
import { securityTableBtns } from '../shared/security-workflow';
import { SecurityAttendanceStatus } from '../shared/security.enums';
import { SAVE_SECURITY_GUARD_ATTENDANCE } from './security-guard-attendance.graphql';
import { SecurityGuardAttendance } from './security-guard-attendance.interface';

export function getSecurityGuardAttendanceFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'guardUid',
      label: 'Guard',
      type: FieldType.select,
      optionsVariables: guardOptions(),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'stationUid',
      label: 'Station',
      type: FieldType.select,
      optionsVariables: stationOptions(),
      validations: [],
    },
    {
      key: 'attendanceDate',
      label: 'Attendance Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'status',
      label: 'Status',
      type: FieldType.select,
      options: enumToObjectArray(SecurityAttendanceStatus),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

const securityGuardAttendanceCrud = defineEntityCrud<SecurityGuardAttendance>({
  name: 'Security Guard Attendance',
  routeSlug: 'security-guard-attendances',
  fields: getSecurityGuardAttendanceFormFields(),
  modalWidth: '50%',
  modelMapper: (data?: SecurityGuardAttendance) => ({
    ...(data ?? {}),
    guardUid: data?.guard?.uid,
    stationUid: data?.station?.uid,
  }),
  mutations: {
    create: SAVE_SECURITY_GUARD_ATTENDANCE,
    update: SAVE_SECURITY_GUARD_ATTENDANCE,
    delete: undefined,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_GUARD_ATTENDANCE', 'ROLE_UPDATE_SECURITY_GUARD_ATTENDANCE'],
  },
});

export const securityGuardAttendance$ = securityGuardAttendanceCrud.reload$;

export const securityGuardAttendanceUpsertBtn = (comp: BaseComponent): ActionButton =>
  securityGuardAttendanceCrud.upsertBtn(crudHostFromBase(comp));

export const securityGuardAttendanceTableBtns = (comp: BaseComponent): ActionButton[] =>
  securityTableBtns(securityGuardAttendanceCrud, crudHostFromBase(comp));

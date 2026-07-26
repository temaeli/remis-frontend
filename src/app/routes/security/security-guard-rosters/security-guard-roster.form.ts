import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { stationOptions, contractorOptions, guardOptions } from '../shared/security-lookups';
import { workflowActionBtn, securityTableBtns, gatedUpsertBtn } from '../shared/security-workflow';
import { SecurityGuardShift, SecurityWorkflowStatus } from '../shared/security.enums';
import {
  SAVE_SECURITY_GUARD_ROSTER,
  SUBMIT_SECURITY_GUARD_ROSTER,
  REVIEW_SECURITY_GUARD_ROSTER,
} from './security-guard-roster.graphql';
import { SecurityGuardRoster } from './security-guard-roster.interface';

export function getSecurityGuardRosterFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'stationUid',
      label: 'Station',
      type: FieldType.select,
      optionsVariables: stationOptions(),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'contractorUid',
      label: 'Contractor',
      type: FieldType.select,
      optionsVariables: contractorOptions(),
      validations: [],
    },
    {
      key: 'weekStart',
      label: 'Week Start',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    { key: 'weekEnd', label: 'Week End', type: FieldType.date, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'entries',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      label: 'Roster Entries',
      labelClass: 'p-0 pb-3',
      fieldsClass: 'grid grid-cols-3 gap-4',
      canAddFormGroup: true,
      fields: [
        {
          key: 'guardUid',
          label: 'Guard',
          type: FieldType.select,
          optionsVariables: guardOptions(),
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'dutyDate',
          label: 'Duty Date',
          type: FieldType.date,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'shift',
          label: 'Shift',
          type: FieldType.select,
          options: enumToObjectArray(SecurityGuardShift),
          validations: [VALIDATOR_REQUIRED],
        },
      ],
    },
  ];
}

const securityGuardRosterCrud = defineEntityCrud<SecurityGuardRoster>({
  name: 'Guard Roster',
  routeSlug: 'security-guard-rosters',
  fields: getSecurityGuardRosterFormFields(),
  modalWidth: '70%',
  modelMapper: (data?: SecurityGuardRoster) => ({
    ...(data ?? {}),
    stationUid: data?.station?.uid,
    contractorUid: data?.contractor?.uid,
    entries: (data?.entries ?? []).map((e) => ({
      guardUid: e.guard?.uid ?? e.guardUid,
      guardName: e.guardName,
      dutyDate: e.dutyDate,
      shift: e.shift,
    })),
  }),
  mutations: {
    create: SAVE_SECURITY_GUARD_ROSTER,
    update: SAVE_SECURITY_GUARD_ROSTER,
    delete: undefined,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_GUARD_ROSTER', 'ROLE_UPDATE_SECURITY_GUARD_ROSTER'],
  },
});

export const securityGuardRoster$ = securityGuardRosterCrud.reload$;

export const securityGuardRosterUpsertBtn = (comp: BaseComponent): ActionButton =>
  gatedUpsertBtn(securityGuardRosterCrud, crudHostFromBase(comp), [
    SecurityWorkflowStatus.DRAFT,
    SecurityWorkflowStatus.RETURNED,
  ]);

export const securityGuardRosterTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return securityTableBtns(securityGuardRosterCrud, host, [
    workflowActionBtn(host, {
      icon: 'send',
      label: 'Submit',
      mutation: SUBMIT_SECURITY_GUARD_ROSTER,
      reload$: securityGuardRosterCrud.reload$,
      uidOnly: true,
      permissions: ['ROLE_CREATE_SECURITY_GUARD_ROSTER', 'ROLE_UPDATE_SECURITY_GUARD_ROSTER'],
      statuses: [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED],
    }),
    workflowActionBtn(host, {
      icon: 'verified',
      label: 'Approve',
      color: 'primary',
      mutation: REVIEW_SECURITY_GUARD_ROSTER,
      reload$: securityGuardRosterCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_APPROVE_SECURITY_GUARD_ROSTER'],
      statuses: [SecurityWorkflowStatus.SUBMITTED, SecurityWorkflowStatus.UNDER_REVIEW],
    }),
  ], [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED]);
};

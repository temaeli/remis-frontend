import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { stationOptions, userOptions, guardOptions } from '../shared/security-lookups';
import { workflowActionBtn, securityTableBtns } from '../shared/security-workflow';
import { Gender, SecurityVettingSubjectType } from '../shared/security.enums';
import {
  SAVE_SECURITY_VETTING_RECORD,
  RECOMMEND_SECURITY_VETTING_RECORD,
} from './security-vetting-record.graphql';
import { SecurityVettingRecord } from './security-vetting-record.interface';

export function getSecurityVettingRecordFormFields(): FieldConfig[] {
  return [
    // { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'stationUid',
      label: 'Station',
      type: FieldType.select,
      optionsVariables: stationOptions(),
      validations: [],
    },
    {
      key: 'subjectType',
      label: 'Subject Type',
      type: FieldType.select,
      options: enumToObjectArray(SecurityVettingSubjectType),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'staffUserUid',
      label: 'Staff User',
      type: FieldType.select,
      optionsVariables: userOptions(),
      validations: [],
    },
    {
      key: 'guardUid',
      label: 'Guard',
      type: FieldType.select,
      optionsVariables: guardOptions(),
      validations: [],
    },
    { key: 'relationshipType', label: 'Relationship Type', type: FieldType.input, validations: [] },
    {
      key: 'firstName',
      label: 'First Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    { key: 'middleName', label: 'Middle Name', type: FieldType.input, validations: [] },
    { key: 'surname', label: 'Surname', type: FieldType.input, validations: [] },
    {
      key: 'gender',
      label: 'Gender',
      type: FieldType.select,
      options: enumToObjectArray(Gender),
      validations: [],
    },
    { key: 'dateOfBirth', label: 'Date of Birth', type: FieldType.date, validations: [] },
    { key: 'placeOfBirth', label: 'Place of Birth', type: FieldType.input, validations: [] },
    { key: 'idType', label: 'ID Type', type: FieldType.input, validations: [] },
    { key: 'idNumber', label: 'ID Number', type: FieldType.input, validations: [] },
    { key: 'phoneNumber', label: 'Phone Number', type: FieldType.input, validations: [] },
    { key: 'email', label: 'Email', type: FieldType.input, validations: [] },
    {
      key: 'currentResidence',
      label: 'Current Residence',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'officerComments',
      label: 'Officer Comments',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

const securityVettingRecordCrud = defineEntityCrud<SecurityVettingRecord>({
  name: 'Vetting Record',
  routeSlug: 'security-vetting-records',
  fields: getSecurityVettingRecordFormFields(),
  modalWidth: '70%',
  modelMapper: (data?: SecurityVettingRecord) => ({
    ...(data ?? {}),
    stationUid: data?.station?.uid,
    staffUserUid: data?.staffUser?.uid,
    guardUid: data?.guard?.uid,
  }),
  mutations: {
    create: SAVE_SECURITY_VETTING_RECORD,
    update: SAVE_SECURITY_VETTING_RECORD,
    delete: undefined,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_VETTING', 'ROLE_UPDATE_SECURITY_VETTING'],
  },
});

export const securityVettingRecord$ = securityVettingRecordCrud.reload$;

export const securityVettingRecordUpsertBtn = (comp: BaseComponent): ActionButton =>
  securityVettingRecordCrud.upsertBtn(crudHostFromBase(comp));

export const securityVettingRecordTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return securityTableBtns(securityVettingRecordCrud, host, [
    workflowActionBtn(host, {
      icon: 'recommend',
      label: 'Recommend',
      color: 'primary',
      mutation: RECOMMEND_SECURITY_VETTING_RECORD,
      reload$: securityVettingRecordCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_RECOMMEND_SECURITY_VETTING'],
    }),
  ]);
};

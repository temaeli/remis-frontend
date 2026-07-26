import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { stationOptions, userOptions } from '../shared/security-lookups';
import { securityTableBtns } from '../shared/security-workflow';
import { securityAttachmentField, mapAttachmentDtoList } from '../shared/security-attachments';
import { SecurityAccessPersonType, SecurityAccessResult } from '../shared/security.enums';
import { SAVE_SECURITY_ACCESS_EVENT } from './security-access-event.graphql';
import { SecurityAccessEvent } from './security-access-event.interface';

export function getSecurityAccessEventFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'stationUid',
      label: 'Station',
      type: FieldType.select,
      optionsVariables: stationOptions(),
      validations: [],
    },
    {
      key: 'personName',
      label: 'Person Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'personType',
      label: 'Person Type',
      type: FieldType.select,
      options: enumToObjectArray(SecurityAccessPersonType),
      validations: [],
    },
    {
      key: 'staffUserUid',
      label: 'Staff User',
      type: FieldType.select,
      optionsVariables: userOptions(),
      validations: [],
    },
    {
      key: 'companyOrDepartment',
      label: 'Company / Department',
      type: FieldType.input,
      validations: [],
    },
    { key: 'purpose', label: 'Purpose', type: FieldType.input, validations: [] },
    { key: 'credentialType', label: 'Credential Type', type: FieldType.input, validations: [] },
    {
      key: 'result',
      label: 'Result',
      type: FieldType.select,
      options: enumToObjectArray(SecurityAccessResult),
      validations: [],
    },
    { key: 'eventTime', label: 'Event Time', type: FieldType.dateTime, validations: [] },
    { key: 'authorizedBy', label: 'Authorized By', type: FieldType.input, validations: [] },
    {
      key: 'remarks',
      label: 'Remarks',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    securityAttachmentField(
      AttachmentSourceNameEnum.SECURITY_ACCESS_EVENT,
      'Access Event Attachment',
      'Attachments (optional)',
    ),
  ];
}

const securityAccessEventCrud = defineEntityCrud<SecurityAccessEvent>({
  name: 'Security Access Event',
  routeSlug: 'security-access-events',
  fields: getSecurityAccessEventFormFields(),
  modalWidth: '60%',
  modelMapper: (data?: SecurityAccessEvent) => ({
    ...(data ?? {}),
    stationUid: data?.station?.uid,
    staffUserUid: data?.staffUser?.uid,
  }),
  mutations: {
    create: SAVE_SECURITY_ACCESS_EVENT,
    update: SAVE_SECURITY_ACCESS_EVENT,
    delete: undefined,
  },
  upsertVariables: (value) => ({ dto: mapAttachmentDtoList(value) }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_ACCESS_EVENT', 'ROLE_UPDATE_SECURITY_ACCESS_EVENT'],
  },
});

export const securityAccessEvent$ = securityAccessEventCrud.reload$;

export const securityAccessEventUpsertBtn = (comp: BaseComponent): ActionButton =>
  securityAccessEventCrud.upsertBtn(crudHostFromBase(comp));

export const securityAccessEventTableBtns = (comp: BaseComponent): ActionButton[] =>
  securityTableBtns(securityAccessEventCrud, crudHostFromBase(comp));

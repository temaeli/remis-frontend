import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { stationOptions } from '../shared/security-lookups';
import { SECURITY_UNIT_OF_MEASURE_OPTIONS } from '../shared/security-units';
import { workflowActionBtn, securityTableBtns, gatedUpsertBtn } from '../shared/security-workflow';
import { securityAttachmentField, mapAttachmentDtoList } from '../shared/security-attachments';
import { SecurityGatePassItemStatus, SecurityGatePassStatus } from '../shared/security.enums';
import {
  SAVE_SECURITY_GATE_PASS,
  REVIEW_SECURITY_GATE_PASS,
  APPROVE_SECURITY_GATE_PASS,
  SECURITY_CHECK_GATE_PASS,
  CLOSE_SECURITY_GATE_PASS,
} from './security-gate-pass.graphql';
import { SecurityGatePass } from './security-gate-pass.interface';

export function getSecurityGatePassFormFields(): FieldConfig[] {
  return [
    // { key: 'uid', type: FieldType.input, visible: false },
    // serialNo is auto-generated server-side — not shown on create/edit form
    { key: 'company', label: 'Company', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'vehicleNo', label: 'Vehicle No', type: FieldType.input, validations: [] },
    {
      key: 'stationUid',
      label: 'Station',
      type: FieldType.select,
      optionsVariables: stationOptions(),
      validations: [],
    },
    {
      key: 'otherStation',
      label: 'Other Station',
      hint: 'Fill this in only if the station is not in the list above',
      type: FieldType.input,
      validations: [],
    },
    { key: 'passDate', label: 'Pass Date', type: FieldType.dateTime, validations: [] },
    { key: 'initiatedByName', label: 'Initiated By', type: FieldType.input, validations: [] },
    {
      key: 'comments',
      label: 'Comments',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'items',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      label: 'Items',
      labelClass: 'p-0 pb-3',
      fieldsClass: 'grid grid-cols-2 gap-4',
      canAddFormGroup: true,
      fields: [
        // { key: 'uid', type: FieldType.input, visible: false },
        {
          key: 'materialDescription',
          label: 'Material Description',
          type: FieldType.input,
          validations: [VALIDATOR_REQUIRED],
        },
        { key: 'quantity', label: 'Quantity', type: FieldType.number, validations: [] },
        { key: 'itemRefNo', label: 'Item Ref No', type: FieldType.input, validations: [] },
        {
          key: 'itemStatus',
          label: 'Item Status',
          type: FieldType.select,
          options: enumToObjectArray(SecurityGatePassItemStatus),
          validations: [],
        },
        {
          key: 'unitOfMeasure',
          label: 'Unit of Measure',
          type: FieldType.select,
          options: SECURITY_UNIT_OF_MEASURE_OPTIONS,
          validations: [],
        },
        {
          key: 'returnDetails',
          label: 'Return Details',
          type: FieldType.textarea,
          validations: [],
          showWhen: [{ key: 'itemStatus', value: SecurityGatePassItemStatus.RETURNABLE }],
        },
        {
          key: 'expectedReturnDate',
          label: 'Expected Return Date',
          type: FieldType.date,
          validations: [],
          showWhen: [{ key: 'itemStatus', value: SecurityGatePassItemStatus.RETURNABLE }],
        },
      ],
    },
    securityAttachmentField(
      AttachmentSourceNameEnum.SECURITY_GATE_PASS,
      'Gate Pass Attachment',
      'Attachments (optional)',
    ),
  ];
}

const securityGatePassCrud = defineEntityCrud<SecurityGatePass>({
  name: 'Security Gate Pass',
  routeSlug: 'security-gate-passes',
  fields: getSecurityGatePassFormFields(),
  modalWidth: '70%',
  modelMapper: (data?: SecurityGatePass) => ({
    ...(data ?? {}),
    stationUid: data?.station?.uid,
    items: data?.items ?? [],
  }),
  mutations: {
    create: SAVE_SECURITY_GATE_PASS,
    update: SAVE_SECURITY_GATE_PASS,
    delete: undefined,
  },
  upsertVariables: (value) => ({ dto: mapAttachmentDtoList(value) }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_GATE_PASS', 'ROLE_UPDATE_SECURITY_GATE_PASS'],
  },
});

export const securityGatePass$ = securityGatePassCrud.reload$;

export const securityGatePassUpsertBtn = (comp: BaseComponent): ActionButton =>
  gatedUpsertBtn(securityGatePassCrud, crudHostFromBase(comp), [SecurityGatePassStatus.INITIATED]);

export const securityGatePassTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return securityTableBtns(securityGatePassCrud, host, [
    workflowActionBtn(host, {
      icon: 'fact_check',
      label: 'Review',
      color: 'primary',
      mutation: REVIEW_SECURITY_GATE_PASS,
      reload$: securityGatePassCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_REVIEW_SECURITY_GATE_PASS'],
      statuses: [SecurityGatePassStatus.INITIATED],
    }),
    workflowActionBtn(host, {
      icon: 'verified',
      label: 'Approve',
      mutation: APPROVE_SECURITY_GATE_PASS,
      reload$: securityGatePassCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_APPROVE_SECURITY_GATE_PASS'],
      statuses: [SecurityGatePassStatus.REVIEWED],
    }),
    workflowActionBtn(host, {
      icon: 'security',
      label: 'Security Check',
      mutation: SECURITY_CHECK_GATE_PASS,
      reload$: securityGatePassCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_CHECK_SECURITY_GATE_PASS'],
      statuses: [SecurityGatePassStatus.APPROVED, SecurityGatePassStatus.DISPATCHED],
    }),
    workflowActionBtn(host, {
      icon: 'lock',
      label: 'Close (Returned)',
      mutation: CLOSE_SECURITY_GATE_PASS,
      reload$: securityGatePassCrud.reload$,
      permissions: ['ROLE_CHECK_SECURITY_GATE_PASS'],
      statuses: [SecurityGatePassStatus.DISPATCHED],
    }),
  ], [SecurityGatePassStatus.INITIATED]);
};

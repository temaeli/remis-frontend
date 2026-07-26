import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { formOptions, stationOptions } from '../shared/security-lookups';
import { workflowActionBtn, securityTableBtns } from '../shared/security-workflow';
import { securityAttachmentField, mapAttachmentDtoList } from '../shared/security-attachments';
import { SecurityWorkflowStatus } from '../shared/security.enums';
import {
  SAVE_SECURITY_FORM_SUBMISSION,
  SUBMIT_SECURITY_FORM_SUBMISSION,
  REVIEW_SECURITY_FORM_SUBMISSION,
  APPROVE_SECURITY_FORM_SUBMISSION,
  ESCALATE_SECURITY_FORM_SUBMISSION,
  CLOSE_SECURITY_FORM_SUBMISSION,
  GET_SECURITY_FORM_FIELDS,
} from './security-form-submission.graphql';
import { SecurityFormSubmission } from './security-form-submission.interface';
import { SecurityFormSubmissionFieldsService } from './security-form-submission-fields.service';
import { securityFormSubmissionDynamicUpsertBtn } from './security-form-submission-upsert.button';

export function getSecurityFormSubmissionFormFields(selectedFormFields?: any[]): FieldConfig[] {
  const fieldsService = new SecurityFormSubmissionFieldsService();

  // Only include field definitions if we have selectedFormFields
  // Otherwise, fields will be populated later when form fields are loaded
  const fieldsForValues = selectedFormFields && selectedFormFields.length > 0
    ? fieldsService.generateValueFields(selectedFormFields)
    : [];

  return [
    // { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'formUid',
      label: 'Form',
      type: FieldType.select,
      optionsVariables: formOptions(),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'stationUid',
      label: 'Station',
      type: FieldType.select,
      optionsVariables: stationOptions(),
      validations: [],
    },
    { key: 'periodStart', label: 'Period Start', type: FieldType.date, validations: [] },
    { key: 'periodEnd', label: 'Period End', type: FieldType.date, validations: [] },
    {
      key: 'values',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      label: 'Values',
      labelClass: 'p-0 pb-3',
      fieldsClass: 'grid grid-cols-1 md:grid-cols-2 gap-4',
      canAddFormGroup: selectedFormFields && selectedFormFields.length > 0 ? false : true,
      itemLabelKey: 'fieldLabel',
      fields: fieldsForValues,
    },
    securityAttachmentField(
      AttachmentSourceNameEnum.SECURITY_FORM_SUBMISSION,
      'Submission Attachment',
      'Attachments (optional)',
    ),
  ];
}

const securityFormSubmissionCrud = defineEntityCrud<SecurityFormSubmission>({
  name: 'Form Submission',
  routeSlug: 'security-form-submissions',
  fields: getSecurityFormSubmissionFormFields(),
  modalWidth: '70%',
  modelMapper: (data?: SecurityFormSubmission) => ({
    ...(data ?? {}),
    formUid: data?.form?.uid,
    stationUid: data?.station?.uid,
    values: data?.values ?? [],
  }),
  mutations: {
    create: SAVE_SECURITY_FORM_SUBMISSION,
    update: SAVE_SECURITY_FORM_SUBMISSION,
    delete: undefined,
  },
  upsertVariables: (value) => ({ dto: mapAttachmentDtoList(value) }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_FORM_SUBMISSION', 'ROLE_UPDATE_SECURITY_FORM_SUBMISSION'],
  },
});

export const securityFormSubmission$ = securityFormSubmissionCrud.reload$;

export const securityFormSubmissionUpsertBtn = (comp: BaseComponent): ActionButton =>
  securityFormSubmissionDynamicUpsertBtn(comp);

export const securityFormSubmissionTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return securityTableBtns(securityFormSubmissionCrud, host, [
    // Edit button using dynamic modal
    {
      label: 'Edit',
      icon: 'edit',
      color: 'primary',
      disabledFunction: (row: any) =>
        !!row?.status &&
        ![SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED].includes(row.status),
      click: (row: SecurityFormSubmission) => {
        const editBtn = securityFormSubmissionDynamicUpsertBtn(comp, row);
        editBtn.click?.(row);
      },
    },
    workflowActionBtn(host, {
      icon: 'send',
      label: 'Submit',
      mutation: SUBMIT_SECURITY_FORM_SUBMISSION,
      reload$: securityFormSubmissionCrud.reload$,
      uidOnly: true,
      permissions: ['ROLE_CREATE_SECURITY_FORM_SUBMISSION', 'ROLE_UPDATE_SECURITY_FORM_SUBMISSION'],
      statuses: [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED],
    }),
    workflowActionBtn(host, {
      icon: 'fact_check',
      label: 'Review',
      color: 'primary',
      mutation: REVIEW_SECURITY_FORM_SUBMISSION,
      reload$: securityFormSubmissionCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_REVIEW_SECURITY_FORM_SUBMISSION'],
      statuses: [SecurityWorkflowStatus.SUBMITTED, SecurityWorkflowStatus.UNDER_REVIEW],
    }),
    workflowActionBtn(host, {
      icon: 'verified',
      label: 'Approve',
      color: 'primary',
      mutation: APPROVE_SECURITY_FORM_SUBMISSION,
      reload$: securityFormSubmissionCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_APPROVE_SECURITY_FORM_SUBMISSION'],
      statuses: [SecurityWorkflowStatus.UNDER_REVIEW],
    }),
    workflowActionBtn(host, {
      icon: 'priority_high',
      label: 'Escalate',
      color: 'warn',
      mutation: ESCALATE_SECURITY_FORM_SUBMISSION,
      reload$: securityFormSubmissionCrud.reload$,
      permissions: ['ROLE_REVIEW_SECURITY_FORM_SUBMISSION'],
      statuses: [SecurityWorkflowStatus.SUBMITTED, SecurityWorkflowStatus.UNDER_REVIEW],
    }),
    workflowActionBtn(host, {
      icon: 'lock',
      label: 'Close',
      mutation: CLOSE_SECURITY_FORM_SUBMISSION,
      reload$: securityFormSubmissionCrud.reload$,
      permissions: ['ROLE_CLOSE_SECURITY_FORM_SUBMISSION'],
      statuses: [
        SecurityWorkflowStatus.UNDER_REVIEW,
        SecurityWorkflowStatus.APPROVED,
        SecurityWorkflowStatus.ESCALATED,
      ],
    }),
  ], [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED]);
};

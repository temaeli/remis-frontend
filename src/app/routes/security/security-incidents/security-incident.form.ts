import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { stationOptions, incidentTypeOptions, userOptions } from '../shared/security-lookups';
import { workflowActionBtn, securityTableBtns, gatedUpsertBtn } from '../shared/security-workflow';
import { securityAttachmentField, mapAttachmentDtoList } from '../shared/security-attachments';
import { SecuritySeverity, SecurityWorkflowStatus } from '../shared/security.enums';
import {
  SAVE_SECURITY_INCIDENT,
  SUBMIT_SECURITY_INCIDENT,
  REVIEW_SECURITY_INCIDENT,
  ENDORSE_SECURITY_INCIDENT,
  APPROVE_SECURITY_INCIDENT,
  ESCALATE_SECURITY_INCIDENT,
  CLOSE_SECURITY_INCIDENT,
  APPOINT_SECURITY_INVESTIGATOR,
} from './security-incident.graphql';
import { SecurityIncident } from './security-incident.interface';

export function getSecurityIncidentFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'incidentTypeUid',
      label: 'Incident Type',
      type: FieldType.select,
      optionsVariables: incidentTypeOptions(),
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
      key: 'incidentDate',
      label: 'Incident Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'incidentTime',
      label: 'Incident Time',
      type: FieldType.input,
      inputType: 'time',
      validations: [],
    },
    { key: 'respondedAt', label: 'Responded At', type: FieldType.dateTime, validations: [] },
    { key: 'location', label: 'Location', type: FieldType.input, validations: [] },
    {
      key: 'severity',
      label: 'Severity',
      type: FieldType.select,
      options: enumToObjectArray(SecuritySeverity),
      validations: [],
    },
    {
      key: 'summary',
      label: 'Summary',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'cause',
      label: 'Cause',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'impact',
      label: 'Impact',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'immediateAction',
      label: 'Immediate Action',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'recommendation',
      label: 'Recommendation',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'policeNotified',
      label: 'Police Notified',
      type: FieldType.select,
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
      validations: [],
    },
    {
      key: 'policeReference',
      label: 'Police Reference',
      type: FieldType.input,
      validations: [],
      showWhen: [{ key: 'policeNotified', value: true }],
    },
    { key: 'reportedByName', label: 'Reported By (Name)', type: FieldType.input, validations: [] },
    {
      key: 'reportedByContact',
      label: 'Reported By (Contact)',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'respondedByName',
      label: 'Responded By (Name)',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'respondedByContact',
      label: 'Responded By (Contact)',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'requiresInvestigation',
      label: 'Requires Investigation',
      type: FieldType.toggle,
      validations: [],
    },
    securityAttachmentField(
      AttachmentSourceNameEnum.SECURITY_INCIDENT,
      'Incident Evidence',
      'Evidence Attachments (optional)',
    ),
  ];
}

const securityIncidentCrud = defineEntityCrud<SecurityIncident>({
  name: 'Security Incident',
  routeSlug: 'security-incidents',
  fields: getSecurityIncidentFormFields(),
  modalWidth: '70%',
  modelMapper: (data?: SecurityIncident) => ({
    ...(data ?? {}),
    incidentTypeUid: data?.incidentType?.uid,
    stationUid: data?.station?.uid,
  }),
  mutations: {
    create: SAVE_SECURITY_INCIDENT,
    update: SAVE_SECURITY_INCIDENT,
    delete: undefined,
  },
  upsertVariables: (value) => ({ dto: mapAttachmentDtoList(value) }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_INCIDENT', 'ROLE_UPDATE_SECURITY_INCIDENT'],
  },
});

export const securityIncident$ = securityIncidentCrud.reload$;

export const securityIncidentUpsertBtn = (comp: BaseComponent): ActionButton =>
  gatedUpsertBtn(securityIncidentCrud, crudHostFromBase(comp), [
    SecurityWorkflowStatus.DRAFT,
    SecurityWorkflowStatus.RETURNED,
  ]);

export const securityIncidentTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return securityTableBtns(securityIncidentCrud, host, [
    workflowActionBtn(host, {
      icon: 'send',
      label: 'Submit',
      mutation: SUBMIT_SECURITY_INCIDENT,
      reload$: securityIncidentCrud.reload$,
      uidOnly: true,
      permissions: ['ROLE_CREATE_SECURITY_INCIDENT', 'ROLE_UPDATE_SECURITY_INCIDENT'],
      statuses: [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED],
    }),
    workflowActionBtn(host, {
      icon: 'fact_check',
      label: 'Review',
      color: 'primary',
      mutation: REVIEW_SECURITY_INCIDENT,
      reload$: securityIncidentCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_REVIEW_SECURITY_INCIDENT'],
      statuses: [SecurityWorkflowStatus.SUBMITTED, SecurityWorkflowStatus.UNDER_REVIEW],
    }),
    workflowActionBtn(host, {
      icon: 'verified_user',
      label: 'Endorse',
      color: 'primary',
      mutation: ENDORSE_SECURITY_INCIDENT,
      reload$: securityIncidentCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_ENDORSE_SECURITY_INCIDENT'],
      statuses: [SecurityWorkflowStatus.UNDER_REVIEW],
    }),
    workflowActionBtn(host, {
      icon: 'check_circle',
      label: 'Approve',
      color: 'primary',
      mutation: APPROVE_SECURITY_INCIDENT,
      reload$: securityIncidentCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_APPROVE_SECURITY_INCIDENT'],
      statuses: [SecurityWorkflowStatus.ENDORSED],
    }),
    workflowActionBtn(host, {
      icon: 'priority_high',
      label: 'Escalate',
      color: 'warn',
      mutation: ESCALATE_SECURITY_INCIDENT,
      reload$: securityIncidentCrud.reload$,
      permissions: ['ROLE_APPROVE_SECURITY_INCIDENT'],
      statuses: [SecurityWorkflowStatus.ENDORSED, SecurityWorkflowStatus.APPROVED],
    }),
    workflowActionBtn(host, {
      icon: 'assignment_ind',
      label: 'Appoint Investigator',
      mutation: APPOINT_SECURITY_INVESTIGATOR,
      reload$: securityIncidentCrud.reload$,
      assigneeOptions: userOptions(),
      assigneeLabel: 'Investigator',
      permissions: ['ROLE_APPOINT_SECURITY_INVESTIGATOR'],
      statuses: [SecurityWorkflowStatus.UNDER_REVIEW, SecurityWorkflowStatus.ESCALATED],
    }),
    workflowActionBtn(host, {
      icon: 'lock',
      label: 'Close',
      mutation: CLOSE_SECURITY_INCIDENT,
      reload$: securityIncidentCrud.reload$,
      permissions: ['ROLE_CLOSE_SECURITY_INCIDENT'],
      statuses: [
        SecurityWorkflowStatus.APPROVED,
        SecurityWorkflowStatus.ESCALATED,
      ],
    }),
  ], [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED]);
};

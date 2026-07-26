import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { crudHostFromBase, defineEntityCrud, CrudHost } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { incidentOptions, userOptions } from '../shared/security-lookups';
import { workflowActionBtn, securityTableBtns, gatedUpsertBtn } from '../shared/security-workflow';
import { securityAttachmentField, mapAttachmentDtoList } from '../shared/security-attachments';
import {
  SecurityActionPriority,
  SecurityInvestigationType,
  SecurityWorkflowStatus,
} from '../shared/security.enums';
import {
  SAVE_SECURITY_INVESTIGATION,
  SUBMIT_SECURITY_INVESTIGATION,
  REVIEW_SECURITY_INVESTIGATION,
  ESCALATE_SECURITY_INVESTIGATION,
  CLOSE_SECURITY_INVESTIGATION,
  PUSH_INVESTIGATION_RECOMMENDATION_TO_ACTION_TRACKER,
} from './security-investigation.graphql';
import { SecurityInvestigation } from './security-investigation.interface';

export function getSecurityInvestigationFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'incidentUid',
      label: 'Related Incident',
      type: FieldType.select,
      optionsVariables: incidentOptions(),
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'allegation',
      label: 'Allegation',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'investigationType',
      label: 'Investigation Type',
      type: FieldType.select,
      options: enumToObjectArray(SecurityInvestigationType),
      validations: [],
    },
    { key: 'location', label: 'Location', type: FieldType.input, validations: [] },
    {
      key: 'investigationDate',
      label: 'Investigation Date',
      type: FieldType.date,
      validations: [],
    },
    { key: 'subjectPerson', label: 'Subject Person', type: FieldType.input, validations: [] },
    { key: 'complainantName', label: 'Complainant Name', type: FieldType.input, validations: [] },
    {
      key: 'investigatorUserUid',
      label: 'Investigator',
      type: FieldType.select,
      optionsVariables: userOptions(),
      validations: [],
    },
    {
      key: 'background',
      label: 'Background',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'remit',
      label: 'Remit',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'investigationProcess',
      label: 'Investigation Process',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'findings',
      label: 'Findings',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'conclusion',
      label: 'Conclusion',
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
    securityAttachmentField(
      AttachmentSourceNameEnum.SECURITY_INVESTIGATION,
      'Investigation Evidence',
      'Evidence Attachments (optional)',
    ),
  ];
}

const securityInvestigationCrud = defineEntityCrud<SecurityInvestigation>({
  name: 'Security Investigation',
  routeSlug: 'security-investigations',
  fields: getSecurityInvestigationFormFields(),
  modalWidth: '70%',
  modelMapper: (data?: SecurityInvestigation) => ({
    ...(data ?? {}),
    incidentUid: data?.incident?.uid,
    investigatorUserUid: data?.investigatorUser?.uid,
  }),
  mutations: {
    create: SAVE_SECURITY_INVESTIGATION,
    update: SAVE_SECURITY_INVESTIGATION,
    delete: undefined,
  },
  upsertVariables: (value) => ({ dto: mapAttachmentDtoList(value) }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_INVESTIGATION', 'ROLE_UPDATE_SECURITY_INVESTIGATION'],
  },
});

function pushToActionTrackerBtn(host: CrudHost): ActionButton {
  return {
    icon: 'playlist_add',
    label: 'Push to Action Tracker',
    toolTip: 'Create an action item from the recommendation',
    permissions: ['ROLE_CREATE_SECURITY_ACTION_ITEM'],
    showFunction: (row: any) => !!row?.uid && !!row?.recommendation,
    click: (row: any) => {
      const close$ = new Subject<void>();
      const fields: FieldConfig[] = [
        {
          key: 'controlMeasures',
          label: 'Control Measures',
          type: FieldType.textarea,
          class: 'col-span-full',
          value: row?.recommendation,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'priority',
          label: 'Priority',
          type: FieldType.select,
          options: enumToObjectArray(SecurityActionPriority),
          validations: [],
        },
        {
          key: 'responsibleName',
          label: 'Responsible Name',
          type: FieldType.input,
          validations: [],
        },
      ];
      const params: FormParameters = {
        model: {},
        title: 'Push to Action Tracker',
        fields,
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: PUSH_INVESTIGATION_RECOMMENDATION_TO_ACTION_TRACKER,
            variables: { investigationUid: row?.uid, ...value },
            successFn: () => {
              securityInvestigationCrud.reload$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '50%');
    },
  };
}

export const securityInvestigation$ = securityInvestigationCrud.reload$;

export const securityInvestigationUpsertBtn = (comp: BaseComponent): ActionButton =>
  gatedUpsertBtn(securityInvestigationCrud, crudHostFromBase(comp), [
    SecurityWorkflowStatus.DRAFT,
    SecurityWorkflowStatus.RETURNED,
  ]);

export const securityInvestigationTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return securityTableBtns(securityInvestigationCrud, host, [
    workflowActionBtn(host, {
      icon: 'send',
      label: 'Submit',
      mutation: SUBMIT_SECURITY_INVESTIGATION,
      reload$: securityInvestigationCrud.reload$,
      uidOnly: true,
      permissions: ['ROLE_CREATE_SECURITY_INVESTIGATION', 'ROLE_UPDATE_SECURITY_INVESTIGATION'],
      statuses: [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED],
    }),
    workflowActionBtn(host, {
      icon: 'fact_check',
      label: 'Review',
      color: 'primary',
      mutation: REVIEW_SECURITY_INVESTIGATION,
      reload$: securityInvestigationCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_REVIEW_SECURITY_INVESTIGATION'],
      statuses: [SecurityWorkflowStatus.SUBMITTED, SecurityWorkflowStatus.UNDER_REVIEW],
    }),
    workflowActionBtn(host, {
      icon: 'priority_high',
      label: 'Escalate',
      color: 'warn',
      mutation: ESCALATE_SECURITY_INVESTIGATION,
      reload$: securityInvestigationCrud.reload$,
      permissions: ['ROLE_REVIEW_SECURITY_INVESTIGATION'],
      statuses: [SecurityWorkflowStatus.SUBMITTED, SecurityWorkflowStatus.UNDER_REVIEW],
    }),
    workflowActionBtn(host, {
      icon: 'lock',
      label: 'Close',
      mutation: CLOSE_SECURITY_INVESTIGATION,
      reload$: securityInvestigationCrud.reload$,
      permissions: ['ROLE_CLOSE_SECURITY_INVESTIGATION'],
      statuses: [
        SecurityWorkflowStatus.UNDER_REVIEW,
        SecurityWorkflowStatus.APPROVED,
        SecurityWorkflowStatus.ESCALATED,
      ],
    }),
    pushToActionTrackerBtn(host),
  ], [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED]);
};

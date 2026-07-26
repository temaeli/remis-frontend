import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { stationOptions } from '../shared/security-lookups';
import { workflowActionBtn, securityTableBtns, gatedUpsertBtn } from '../shared/security-workflow';
import {
  SecurityIntelAssessment,
  SecurityIntelHandlingCode,
  SecurityIntelSanitization,
  SecurityIntelSourceEvaluation,
  SecurityWorkflowStatus,
} from '../shared/security.enums';
import {
  SAVE_SECURITY_INTELLIGENCE_REPORT,
  SUBMIT_SECURITY_INTELLIGENCE_REPORT,
  REVIEW_SECURITY_INTELLIGENCE_REPORT,
} from './security-intelligence-report.graphql';
import { SecurityIntelligenceReport } from './security-intelligence-report.interface';

export function getSecurityIntelligenceReportFormFields(): FieldConfig[] {
  return [
    // { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'stationUid',
      label: 'Station',
      type: FieldType.select,
      optionsVariables: stationOptions(),
      validations: [],
    },
    { key: 'organizationUnit', label: 'Organization Unit', type: FieldType.input, validations: [] },
    { key: 'contactNumber', label: 'Contact Number', type: FieldType.input, validations: [] },
    { key: 'operationName', label: 'Operation Name', type: FieldType.input, validations: [] },
    { key: 'eventAt', label: 'Event At', type: FieldType.dateTime, validations: [] },
    {
      key: 'sourceEvaluation',
      label: 'Source Evaluation',
      type: FieldType.select,
      options: enumToObjectArray(SecurityIntelSourceEvaluation),
      validations: [],
    },
    {
      key: 'assessment',
      label: 'Assessment',
      type: FieldType.select,
      options: enumToObjectArray(SecurityIntelAssessment),
      validations: [],
    },
    {
      key: 'handlingCode',
      label: 'Handling Code',
      type: FieldType.select,
      options: enumToObjectArray(SecurityIntelHandlingCode),
      validations: [],
    },
    {
      key: 'sanitization',
      label: 'Sanitization',
      type: FieldType.select,
      options: enumToObjectArray(SecurityIntelSanitization),
      validations: [],
    },
    {
      key: 'information',
      label: 'Information',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'provenanceSensitivity',
      label: 'Provenance / Sensitivity',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'thirdPartyWillingToEngage',
      label: 'Third Party Willing To Engage',
      type: FieldType.toggle,
      validations: [],
    },
  ];
}

const securityIntelligenceReportCrud = defineEntityCrud<SecurityIntelligenceReport>({
  name: 'Intelligence Report',
  routeSlug: 'security-intelligence-reports',
  fields: getSecurityIntelligenceReportFormFields(),
  modalWidth: '70%',
  modelMapper: (data?: SecurityIntelligenceReport) => ({
    ...(data ?? {}),
    stationUid: data?.station?.uid,
    thirdPartyWillingToEngage:
      data?.thirdPartyWillingToEngage == null
        ? data?.thirdPartyWillingToEngage
        : `${data.thirdPartyWillingToEngage}` === 'true',
  }),
  mutations: {
    create: SAVE_SECURITY_INTELLIGENCE_REPORT,
    update: SAVE_SECURITY_INTELLIGENCE_REPORT,
    delete: undefined,
  },
  upsertVariables: (value) => ({
    dto: {
      ...value,
      thirdPartyWillingToEngage:
        value?.thirdPartyWillingToEngage == null
          ? value?.thirdPartyWillingToEngage
          : String(value.thirdPartyWillingToEngage),
    },
  }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_INTELLIGENCE', 'ROLE_UPDATE_SECURITY_INTELLIGENCE'],
  },
});

export const securityIntelligenceReport$ = securityIntelligenceReportCrud.reload$;

export const securityIntelligenceReportUpsertBtn = (comp: BaseComponent): ActionButton =>
  gatedUpsertBtn(securityIntelligenceReportCrud, crudHostFromBase(comp), [
    SecurityWorkflowStatus.DRAFT,
    SecurityWorkflowStatus.RETURNED,
  ]);

export const securityIntelligenceReportTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return securityTableBtns(securityIntelligenceReportCrud, host, [
    workflowActionBtn(host, {
      icon: 'send',
      label: 'Submit',
      mutation: SUBMIT_SECURITY_INTELLIGENCE_REPORT,
      reload$: securityIntelligenceReportCrud.reload$,
      uidOnly: true,
      permissions: ['ROLE_CREATE_SECURITY_INTELLIGENCE', 'ROLE_UPDATE_SECURITY_INTELLIGENCE'],
      statuses: [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED],
    }),
    workflowActionBtn(host, {
      icon: 'fact_check',
      label: 'Review',
      color: 'primary',
      mutation: REVIEW_SECURITY_INTELLIGENCE_REPORT,
      reload$: securityIntelligenceReportCrud.reload$,
      withDecision: true,
      permissions: ['ROLE_REVIEW_SECURITY_INTELLIGENCE'],
      statuses: [SecurityWorkflowStatus.SUBMITTED, SecurityWorkflowStatus.UNDER_REVIEW],
    }),
  ], [SecurityWorkflowStatus.DRAFT, SecurityWorkflowStatus.RETURNED]);
};

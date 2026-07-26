import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  PROCESS_POLICY_REGISTRATION,
  SAVE_OR_UPDATE_POLICY_REGISTRATION,
} from './policy-registration.graphql';
import { PolicyRegistration } from './policy-registration.interface';
import { PolicyReviewStatus } from './policy-registration.interface';
import { ALL_DEPARTMENTS } from '@routes/settings/departments/department.graphql';
import { enumToObjectArray } from '@core/helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import { obs } from '@shared/components/generic-form/field-helpers';
import {
  commonProcessRegistrationFp,
  ComplianceRegistrationStage,
  proccessRegistrationBtn,
} from '../compliance-common/compliance-common';

//Listener for all PolicyRegistration actions
export const policyRegistration$ = new Subject<PolicyRegistration | any>();

export const getPolicyRegistrationFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  { key: 'name', type: FieldType.input, validations: [], class: 'col-span-full' },

  {
    key: 'departmentUid',
    type: FieldType.select,
    validations: [],
    optionsVariables: { fetchParameter: { query: ALL_DEPARTMENTS } },
  },
  {
    key: 'applicability',
    type: FieldType.input,
    validations: [],
  },
  {
    key: 'reviewStatus',
    type: FieldType.select,
    validations: [],
    options: enumToObjectArray(PolicyReviewStatus),
  },

  { key: 'dateOfReview', type: FieldType.date, validations: [] },
  { key: 'endorsementDate', type: FieldType.date, validations: [] },
  { key: 'expirationDate', type: FieldType.date, validations: [] },

  {
    key: 'attachments',
    label: 'Policy Attachments (optional)',
    type: FieldType.formGroupArray,
    showGroupLabel: false,
    expandable: false,
    validations: [],
    class: 'col-span-full',
    fields: [
      {
        key: 'data',
        label: 'Attachment File',
        type: FieldType.attachment,
        skipAutoUpload: true,
        attachment: { sourceName: AttachmentSourceNameEnum.OTHERS },
        validations: [],
        class: 'col-span-full',
      },
      {
        key: 'attachmentTitle',
        type: FieldType.input,
        value: obs('data', (data) => data?.attachmentTitle ?? ''),
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
        showWhen: [{ key: 'data' }],
      },
    ],
  },
];

export function policyRegistrationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: PolicyRegistration) => {
      let attachments = [];

      if (data?.uid) {
        attachments = await comp.fs.fetch({
          query: LIST_ATTACHMENTS_BY_SOURCE_ID,
          variables: { sourceUid: data?.uid },
        });

        attachments = attachments.map((a: any) => ({
          data: a,
          attachmentTitle: a.attachmentTitle,
        }));
      }

      const formParameter: FormParameters = {
        model: { ...data, departmentUid: data?.department?.uid, attachments },
        title: 'Policy Registration',
        fields: getPolicyRegistrationFormFields(comp),
        closeAction$: policyRegistration$,

        onSubmit: async (value: any) => {
          value.attachments = value.attachments
            .filter((a: any) => !!a.data?.dataBinary)
            .map((a: any) => ({
              ...a.data,
              attachmentTitle: a.attachmentTitle,
              sourceName: AttachmentSourceNameEnum.OTHERS,
            }));

          await comp.fs.fetch({
            notify: true,
            loadingOn: 'submit-button',
            variables: { policyRegistrationDto: value },
            mutation: SAVE_OR_UPDATE_POLICY_REGISTRATION,
            successFn: (res) => policyRegistration$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_CREATE_POLICY_REGISTRATION', 'ROLE_UPDATE_POLICY_REGISTRATION'],
    showFunction: (d: PolicyRegistration) => !d || d?.stage === ComplianceRegistrationStage.OFFICER,
    ...getUpsertBtnProps('Policy Registration'),
  };
}

export function policyRegistrationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Policy Registration',
    click: (data: PolicyRegistration) =>
      navigateRelativeTo(comp, 'policy-registrations', data?.uid),
    permissions: ['ROLE_VIEW_POLICY_REGISTRATION'],
  };
}

export function policyRegistrationProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...commonProcessRegistrationFp,
      variables: { processingDto: value },
      mutation: PROCESS_POLICY_REGISTRATION,
    });
  };

  return proccessRegistrationBtn(comp, onSubmit, {
    [ComplianceRegistrationStage.OFFICER]: 'ROLE_PROCESS_POLICY_REGISTRATION_AS_OFFICER',
    [ComplianceRegistrationStage.HOD]: 'ROLE_PROCESS_POLICY_REGISTRATION_AS_HOD',
    [ComplianceRegistrationStage.GENERAL_MANAGER]: 'ROLE_PROCESS_POLICY_REGISTRATION_AS_GM',
  });
}

// export function policyRegistrationDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: PolicyRegistration) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         successFn: (res) => policyRegistration$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Policy Registration', 'name'),
//     permissions: ['ROLE_DELETE_POLICY_REGISTRATION'],
//   };
// }

export function policyRegistrationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        policyRegistrationViewBtn(comp),
        policyRegistrationUpsertBtn(comp),
        // policyRegistrationDeleteBtn(comp),
      ],
    },
  ];
}

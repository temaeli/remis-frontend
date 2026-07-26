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
  PROCESS_LICENCE_REGISTRATION,
  SAVE_OR_UPDATE_LICENCE_REGISTRATION,
} from './licence-registration.graphql';
import { LicenceRegistration } from './licence-registration.interface';
import { ALL_DEPARTMENTS } from '@routes/settings/departments/department.graphql';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import {
  commonProcessRegistrationFp,
  ComplianceRegistrationStage,
  notFutureDateValidator,
  proccessRegistrationBtn,
  syncEndDateFromDuration,
} from '../compliance-common/compliance-common';
import { obs } from '@shared/components/generic-form/field-helpers';

//Listener for all LicenceRegistration actions
export const licenceRegistration$ = new Subject<LicenceRegistration | any>();

export const getLicenceRegistrationFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },

  { key: 'name', type: FieldType.input, validations: [], class: 'col-span-full' },

  {
    key: 'departmentUid',
    type: FieldType.select,
    validations: [],
    optionsVariables: { fetchParameter: { query: ALL_DEPARTMENTS } },
  },

  { key: 'condition', type: FieldType.input, validations: [] },

  {
    key: 'issuedDate',
    type: FieldType.date,
    maxDate: new Date(),
    validations: [notFutureDateValidator('Issued date cannot be in the future')],
    onChange: syncEndDateFromDuration('issuedDate', 'duration', 'expirationDate'),
  },
  {
    key: 'duration',
    label: 'Duration (in months)',
    type: FieldType.number,
    validations: [],
    onChange: syncEndDateFromDuration('issuedDate', 'duration', 'expirationDate'),
  },
  {
    key: 'expirationDate',
    type: FieldType.date,
    disabled: true,
    validations: [],
  },

  { key: 'renewalRequirement', type: FieldType.input, validations: [] },

  {
    key: 'attachments',
    label: 'Licence Attachments (optional)',
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

export function licenceRegistrationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: LicenceRegistration) => {
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
        title: 'Licence Registration',
        fields: getLicenceRegistrationFormFields(comp),
        closeAction$: licenceRegistration$,

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
            variables: { licenceRegistrationDto: value },
            mutation: SAVE_OR_UPDATE_LICENCE_REGISTRATION,
            successFn: (res) => licenceRegistration$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_CREATE_LICENCE_REGISTRATION', 'ROLE_UPDATE_LICENCE_REGISTRATION'],
    showFunction: (d: LicenceRegistration) =>
      !d || d?.stage === ComplianceRegistrationStage.OFFICER,
    ...getUpsertBtnProps('Licence Registration'),
  };
}

export function licenceRegistrationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Licence Registration',
    click: (data: LicenceRegistration) =>
      navigateRelativeTo(comp, 'licence-registrations', data?.uid),
    permissions: ['ROLE_VIEW_LICENCE_REGISTRATION'],
  };
}

export function licenceRegistrationProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...commonProcessRegistrationFp,
      variables: { processingDto: value },
      mutation: PROCESS_LICENCE_REGISTRATION,
    });
  };

  return proccessRegistrationBtn(comp, onSubmit, {
    [ComplianceRegistrationStage.OFFICER]: [
      'ROLE_PROCESS_LICENCE_REGISTRATION_AS_OFFICER',
      'ROLE_PROCESS_LICENCE_REGISTRATION_REPORT_AS_OFFICER',
    ],
    [ComplianceRegistrationStage.HOD]: 'ROLE_PROCESS_LICENCE_REGISTRATION_AS_HOD',
    [ComplianceRegistrationStage.GENERAL_MANAGER]: 'ROLE_PROCESS_LICENCE_REGISTRATION_AS_GM',
  });
}

// export function licenceRegistrationDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: LicenceRegistration) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         successFn: (res) => licenceRegistration$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Licence Registration', 'name'),
//     permissions: ['ROLE_DELETE_LICENCE_REGISTRATION'],
//   };
// }

export function licenceRegistrationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        licenceRegistrationViewBtn(comp),
        licenceRegistrationUpsertBtn(comp),
        // licenceRegistrationDeleteBtn(comp),
      ],
    },
  ];
}

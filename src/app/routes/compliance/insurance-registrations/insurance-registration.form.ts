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
  PROCESS_INSURANCE_REGISTRATION,
  SAVE_OR_UPDATE_INSURANCE_REGISTRATION,
} from './insurance-registration.graphql';
import { InsuranceRegistration } from './insurance-registration.interface';
import { InsuranceType } from './insurance-registration.interface';
import { enumToObjectArray } from '@core/helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import {
  commonProcessRegistrationFp,
  ComplianceRegistrationStage,
  Currency,
  notFutureDateValidator,
  proccessRegistrationBtn,
  syncEndDateFromDuration,
} from '../compliance-common/compliance-common';
import { ALL_DEPARTMENTS } from '@routes/settings/departments/department.graphql';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import { obs } from '@shared/components/generic-form/field-helpers';

//Listener for all InsuranceRegistration actions
export const insuranceRegistration$ = new Subject<InsuranceRegistration | any>();

export const getInsuranceRegistrationFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'departmentUid',
    type: FieldType.select,
    validations: [],
    optionsVariables: { fetchParameter: { query: ALL_DEPARTMENTS } },
  },
  { key: 'nameOfAsset', type: FieldType.input, validations: [] },
  { key: 'coverage', type: FieldType.input, validations: [] },
  {
    key: 'startDate',
    type: FieldType.date,
    maxDate: new Date(),
    validations: [notFutureDateValidator('Start date cannot be in the future')],
    onChange: syncEndDateFromDuration('startDate', 'duration', 'endDate'),
  },
  {
    key: 'duration',
    label: 'Duration (in months)',
    type: FieldType.number,
    validations: [],
    onChange: syncEndDateFromDuration('startDate', 'duration', 'endDate'),
  },
  {
    key: 'endDate',
    type: FieldType.date,
    disabled: true,
    validations: [],
  },
  {
    key: 'insuranceType',
    type: FieldType.select,
    validations: [],
    options: enumToObjectArray(InsuranceType),
  },
  { key: 'value', type: FieldType.decimal, validations: [] },
  {
    key: 'currency',
    type: FieldType.select,
    validations: [],
    options: enumToObjectArray(Currency),
  },
  {
    key: 'otherCurrency',
    label: 'Other Currency',
    showWhen: [{ key: 'currency', value: Currency.OTHER }],
    type: FieldType.input,
    validations: [],
  },
  { key: 'statusOfIncident', type: FieldType.input, validations: [] },
  {
    key: 'attachments',
    label: 'Insurance Attachments (optional)',
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

export function insuranceRegistrationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: InsuranceRegistration) => {
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
        model: { ...data, departmentUid: data?.department?.uid, attachments: attachments },
        title: 'Insurance Registration',
        fields: getInsuranceRegistrationFormFields(comp),
        closeAction$: insuranceRegistration$,

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
            variables: { insuranceRegistrationDto: value },
            mutation: SAVE_OR_UPDATE_INSURANCE_REGISTRATION,
            successFn: (res) => insuranceRegistration$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_CREATE_INSURANCE_REGISTRATION', 'ROLE_UPDATE_INSURANCE_REGISTRATION'],
    showFunction: (d: InsuranceRegistration) =>
      !d || d?.stage === ComplianceRegistrationStage.OFFICER,
    ...getUpsertBtnProps('Insurance Registration'),
  };
}

export function insuranceRegistrationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Insurance Registration',
    click: (data: InsuranceRegistration) =>
      navigateRelativeTo(comp, 'insurance-registrations', data?.uid),
    permissions: ['ROLE_VIEW_INSURANCE_REGISTRATION'],
  };
}

export function insuranceRegistrationProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...commonProcessRegistrationFp,
      variables: { processingDto: value },
      mutation: PROCESS_INSURANCE_REGISTRATION,
    });
  };

  return proccessRegistrationBtn(comp, onSubmit, {
    [ComplianceRegistrationStage.OFFICER]: 'ROLE_PROCESS_INSURANCE_REGISTRATION_AS_OFFICER',
    [ComplianceRegistrationStage.HOD]: 'ROLE_PROCESS_INSURANCE_REGISTRATION_AS_HOD',
    [ComplianceRegistrationStage.GENERAL_MANAGER]: 'ROLE_PROCESS_INSURANCE_REGISTRATION_AS_GM',
  });
}

// export function insuranceRegistrationDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: InsuranceRegistration) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         successFn: (res) => insuranceRegistration$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Insurance Registration', 'nameOfAsset'),
//     permissions: ['ROLE_DELETE_INSURANCE_REGISTRATION'],
//   };
// }

export function insuranceRegistrationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        insuranceRegistrationViewBtn(comp),
        insuranceRegistrationUpsertBtn(comp),
        // insuranceRegistrationDeleteBtn(comp),
      ],
    },
  ];
}

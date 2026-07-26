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
  ALL_CONTRACT_REGISTRATIONS_PAGEABLE,
  GET_GENERAL_MANAGER_CONTRACT_REGISTRATIONS_PAGEABLE,
  GET_HEAD_OF_DEPARTMENT_CONTRACT_REGISTRATIONS_PAGEABLE,
  GET_OFFICER_CONTRACT_REGISTRATIONS_PAGEABLE,
  MY_CONTRACT_REGISTRATIONS_PAGEABLE,
  PROCESS_CONTRACT_REGISTRATION,
  SAVE_OR_UPDATE_CONTRACT_REGISTRATION,
} from './contract-registration.graphql';
import { ContractRegistration } from './contract-registration.interface';
import { ContractType } from './contract-registration.interface';
import { ContractExecutionStatus } from './contract-registration.interface';
import { enumToObjectArray } from '@core/helpers';
import { ALL_DEPARTMENTS } from '@routes/settings/departments/department.graphql';
import { LIST_USERS_PAGEABLE_ } from '@routes/users-managment/users/user.graphql';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import { obs } from '@shared/components/generic-form/field-helpers';
import {
  commonProcessRegistrationFp,
  ComplianceRegistrationStage,
  CompList,
  CompListContents,
  Currency,
  notFutureDateValidator,
  proccessRegistrationBtn,
  syncEndDateFromDuration,
} from '../compliance-common/compliance-common';
import { ContentParameter } from '@shared/components/view-component/view-interface';

//Listener for all ContractRegistration actions
export const contractRegistration$ = new Subject<ContractRegistration | any>();

export const getContractRegistrationFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },

  { key: 'name', type: FieldType.input, validations: [], class: 'col-span-full' },
  {
    key: 'departmentUid',
    type: FieldType.select,
    validations: [],
    optionsVariables: { fetchParameter: { query: ALL_DEPARTMENTS } },
  },
  {
    key: 'contractManager',
    type: FieldType.select,
    validations: [],
    optionsVariables: {
      mapFunction: (d: any) => ({
        label: `${d.firstName} ${d.lastName}`,
        value: `${d.firstName} ${d.lastName}`,
      }),
      fetchParameter: {
        queryFieldsKeys: ['firstName', 'lastName', 'uid'],
        query: LIST_USERS_PAGEABLE_,
        pageableParam: { page: 0, size: 10000 },
        variables: { active: true },
        searchStates: {},
      },
    },
  },
  { key: 'serviceProvider', type: FieldType.input, validations: [] },
  {
    key: 'amount',
    type: FieldType.decimal,
    validations: [],
  },
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

  {
    key: 'contractNumber',
    type: FieldType.input,
    validations: [],
  },
  {
    key: 'contractType',
    type: FieldType.select,
    validations: [],
    options: enumToObjectArray(ContractType),
  },
  {
    key: 'otherType',
    label: 'Other Contract Type',
    showWhen: [{ key: 'contractType', value: ContractType.OTHER }],
    type: FieldType.input,
    validations: [],
  },
  {
    key: 'contractDate',
    label: 'Start Date',
    type: FieldType.date,
    maxDate: new Date(),
    validations: [notFutureDateValidator('Start date cannot be in the future')],
    onChange: syncEndDateFromDuration('contractDate', 'duration', 'endDate'),
  },

  {
    key: 'duration',
    label: 'Duration (in months)',
    type: FieldType.number,
    validations: [],
    onChange: syncEndDateFromDuration('contractDate', 'duration', 'endDate'),
  },

  {
    key: 'endDate',
    type: FieldType.date,
    disabled: true,
    validations: [],
  },
  {
    key: 'executionStatus',
    type: FieldType.select,
    validations: [],
    options: enumToObjectArray(ContractExecutionStatus),
  },

  {
    key: 'attachments',
    label: 'Contract Attachments (optional)',
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

export function contractRegistrationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: ContractRegistration) => {
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
        title: 'Contract Registration',
        fields: getContractRegistrationFormFields(comp),
        closeAction$: contractRegistration$,

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
            variables: { contractRegistrationDto: value },
            mutation: SAVE_OR_UPDATE_CONTRACT_REGISTRATION,
            successFn: (res) => contractRegistration$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    ...getUpsertBtnProps('Contract Registration'),
    permissions: ['ROLE_CREATE_CONTRACT_REGISTRATION', 'ROLE_UPDATE_CONTRACT_REGISTRATION'],
    showFunction: (d: ContractRegistration) =>
      !d || d?.stage === ComplianceRegistrationStage.OFFICER,
  };
}

export function contractRegistrationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Contract Registration',
    click: (data: ContractRegistration) =>
      navigateRelativeTo(comp, 'contract-registrations', data?.uid),
    permissions: ['ROLE_VIEW_CONTRACT_REGISTRATION'],
  };
}

export function contractRegistrationProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...commonProcessRegistrationFp,
      variables: { processingDto: value },
      mutation: PROCESS_CONTRACT_REGISTRATION,
    });
  };

  return proccessRegistrationBtn(comp, onSubmit, {
    [ComplianceRegistrationStage.OFFICER]: 'ROLE_PROCESS_CONTRACT_REGISTRATION_AS_OFFICER',
    [ComplianceRegistrationStage.HOD]: 'ROLE_PROCESS_CONTRACT_REGISTRATION_AS_HOD',
    [ComplianceRegistrationStage.GENERAL_MANAGER]: 'ROLE_PROCESS_CONTRACT_REGISTRATION_AS_GM',
  });
}

// export function contractRegistrationDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: ContractRegistration) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         successFn: (res) => contractRegistration$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Contract Registration', 'name'),
//     permissions: ['ROLE_DELETE_CONTRACT_REGISTRATION'],
//   };
// }

export function contractRegistrationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        contractRegistrationViewBtn(comp),
        contractRegistrationUpsertBtn(comp),
        // contractRegistrationDeleteBtn(comp),
      ],
    },
  ];
}

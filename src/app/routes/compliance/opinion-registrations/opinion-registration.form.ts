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
  PROCESS_OPINION_REGISTRATION,
  SAVE_OR_UPDATE_OPINION_REGISTRATION,
} from './opinion-registration.graphql';
import { OpinionRegistration } from './opinion-registration.interface';
import { ALL_DEPARTMENTS } from '@routes/settings/departments/department.graphql';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import { obs } from '@shared/components/generic-form/field-helpers';
import {
  commonProcessRegistrationFp,
  ComplianceRegistrationStage,
  proccessRegistrationBtn,
} from '../compliance-common/compliance-common';

//Listener for all OpinionRegistration actions
export const opinionRegistration$ = new Subject<OpinionRegistration | any>();

export const getOpinionRegistrationFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },

  { key: 'name', type: FieldType.input, validations: [], class: 'col-span-full' },

  {
    key: 'responsibleDepartmentUid',
    type: FieldType.select,
    validations: [],
    optionsVariables: { fetchParameter: { query: ALL_DEPARTMENTS } },
  },

  { key: 'nature', type: FieldType.input, validations: [] },
  { key: 'resolutionStatus', type: FieldType.input, validations: [] },
  { key: 'valueObtained', type: FieldType.input, validations: [] },
  { key: 'findingStatus', type: FieldType.input, validations: [] },

  {
    key: 'attachments',
    label: 'Opinion Attachments (optional)',
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

export function opinionRegistrationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: OpinionRegistration) => {
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
        model: { ...data, responsibleDepartmentUid: data?.responsibleUnit?.uid, attachments },
        title: 'Opinion Registration',
        fields: getOpinionRegistrationFormFields(comp),
        closeAction$: opinionRegistration$,

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
            variables: { opinionRegistrationDto: value },
            mutation: SAVE_OR_UPDATE_OPINION_REGISTRATION,
            successFn: (res) => opinionRegistration$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_CREATE_OPINION_REGISTRATION', 'ROLE_UPDATE_OPINION_REGISTRATION'],
    showFunction: (d: OpinionRegistration) =>
      !d || d?.stage === ComplianceRegistrationStage.OFFICER,
    ...getUpsertBtnProps('Opinion Registration'),
  };
}

export function opinionRegistrationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Opinion Registration',
    click: (data: OpinionRegistration) =>
      navigateRelativeTo(comp, 'opinion-registrations', data?.uid),
    permissions: ['ROLE_VIEW_OPINION_REGISTRATION'],
  };
}

export function opinionRegistrationProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...commonProcessRegistrationFp,
      variables: { processingDto: value },
      mutation: PROCESS_OPINION_REGISTRATION,
    });
  };

  return proccessRegistrationBtn(comp, onSubmit, {
    [ComplianceRegistrationStage.OFFICER]: 'ROLE_PROCESS_OPINION_REGISTRATION_AS_OFFICER',
    [ComplianceRegistrationStage.HOD]: 'ROLE_PROCESS_OPINION_REGISTRATION_AS_HOD',
    [ComplianceRegistrationStage.GENERAL_MANAGER]: 'ROLE_PROCESS_OPINION_REGISTRATION_AS_GM',
  });
}

// export function opinionRegistrationDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: OpinionRegistration) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         successFn: (res) => opinionRegistration$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Opinion Registration', 'name'),
//     permissions: ['ROLE_DELETE_OPINION_REGISTRATION'],
//   };
// }

export function opinionRegistrationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        opinionRegistrationViewBtn(comp),
        opinionRegistrationUpsertBtn(comp),
        // opinionRegistrationDeleteBtn(comp),
      ],
    },
  ];
}

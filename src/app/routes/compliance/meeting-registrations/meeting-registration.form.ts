import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  PROCESS_MEETING_REGISTRATION,
  SAVE_OR_UPDATE_MEETING_REGISTRATION,
} from './meeting-registration.graphql';
import { MeetingRegistration } from './meeting-registration.interface';
import { MeetingCategory } from './meeting-registration.interface';
import { MinuteStatus } from './meeting-registration.interface';
import { enumToObjectArray } from '@core/helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import { obs } from '@shared/components/generic-form/field-helpers';
import {
  commonProcessRegistrationFp,
  ComplianceRegistrationStage,
  proccessRegistrationBtn,
} from '../compliance-common/compliance-common';

//Listener for all MeetingRegistration actions
export const meetingRegistration$ = new Subject<MeetingRegistration | any>();

export const getMeetingRegistrationFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },

  { key: 'name', type: FieldType.input, validations: [], class: 'col-span-full' },
  {
    key: 'category',
    type: FieldType.select,
    validations: [],
    options: enumToObjectArray(MeetingCategory),
  },
  { key: 'conductedDate', type: FieldType.date, validations: [] },
  { key: 'confirmationDate', type: FieldType.date, validations: [] },
  {
    key: 'minuteStatus',
    type: FieldType.select,
    validations: [],
    options: enumToObjectArray(MinuteStatus),
  },

  { key: 'upcomingSchedule', type: FieldType.date, validations: [] },

  {
    key: 'attachments',
    label: 'Meeting Attachments (optional)',
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

export function meetingRegistrationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: MeetingRegistration) => {
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
        model: { ...data, attachments },
        title: 'Meeting Registration',
        fields: getMeetingRegistrationFormFields(comp),
        closeAction$: meetingRegistration$,

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
            variables: { meetingRegistrationDto: value },
            mutation: SAVE_OR_UPDATE_MEETING_REGISTRATION,
            successFn: (res) => meetingRegistration$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_CREATE_MEETING_REGISTRATION', 'ROLE_UPDATE_MEETING_REGISTRATION'],
    showFunction: (d: MeetingRegistration) =>
      !d || d?.stage === ComplianceRegistrationStage.OFFICER,
    ...getUpsertBtnProps('Meeting Registration'),
  };
}

export function meetingRegistrationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Meeting Registration',
    click: (data: MeetingRegistration) =>
      navigateRelativeTo(comp, 'meeting-registrations', data?.uid),
    permissions: ['ROLE_VIEW_MEETING_REGISTRATION'],
  };
}

export function meetingRegistrationProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...commonProcessRegistrationFp,
      variables: { processingDto: value },
      mutation: PROCESS_MEETING_REGISTRATION,
    });
  };

  return proccessRegistrationBtn(comp, onSubmit, {
    [ComplianceRegistrationStage.OFFICER]: 'ROLE_PROCESS_MEETING_REGISTRATION_AS_OFFICER',
    [ComplianceRegistrationStage.HOD]: 'ROLE_PROCESS_MEETING_REGISTRATION_AS_HOD',
    [ComplianceRegistrationStage.GENERAL_MANAGER]: 'ROLE_PROCESS_MEETING_REGISTRATION_AS_GM',
  });
}

// export function meetingRegistrationDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: MeetingRegistration) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         successFn: (res) => meetingRegistration$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Meeting Registration', 'name'),
//     permissions: ['ROLE_DELETE_MEETING_REGISTRATION'],
//   };
// }

export function meetingRegistrationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        meetingRegistrationViewBtn(comp),
        meetingRegistrationUpsertBtn(comp),
        // meetingRegistrationDeleteBtn(comp),
      ],
    },
  ];
}

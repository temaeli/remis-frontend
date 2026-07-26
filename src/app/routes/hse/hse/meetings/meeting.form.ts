import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { SearchOperationType } from '@shared/fetch/fetch.interface';
import {
  CrudHost,
  buildRejectBtn,
  crudHostFromBase,
  defineEntityCrud,
} from '@shared/crud';
import { GET_ALL_USERS_PAGEABLE } from 'app/routes/plants/plants/plant.graphql';
import {
  APPROVE_HSE_MEETING_MINUTES,
  CONFIRM_HSE_MEETING,
  DELETE_HSE_MEETING,
  INVITE_TO_HSE_MEETING,
  MARK_HSE_MEETING_AS_COMPLETED,
  REJECT_HSE_MEETING_MINUTES,
  SCHEDULE_OR_RESCHEDULE_HSE_MEETING,
} from './meeting.graphql';
import { HseMeeting, MeetingCategory, MEETING_CATEGORY_LABELS, MeetingStatus } from './meeting.interface';

const MEETING_CATEGORY_OPTIONS = Object.values(MeetingCategory).map((value) => ({
  value,
  label: MEETING_CATEGORY_LABELS[value],
}));

const MEETING_USER_FETCH = {
  query: GET_ALL_USERS_PAGEABLE,
  variables: {
    active: true,
    pageableParam: {
      size: 1000,
      searchFields: [
        {
          fieldName: 'isStaff',
          fieldValue: 'true',
          searchType: SearchOperationType.Equals,
        },
      ],
    },
  },
};

export function getHseMeetingFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'title',
      label: 'Title',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'category',
      label: 'Category',
      type: FieldType.select,
      options: MEETING_CATEGORY_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'organizer',
      label: 'Organizer',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'chairPersonUid',
      label: 'Chair Person',
      type: FieldType.select,
      optionsVariables: { fetchParameter: MEETING_USER_FETCH },
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'secretaryUid',
      label: 'Secretary',
      type: FieldType.select,
      optionsVariables: { fetchParameter: MEETING_USER_FETCH },
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'startTime',
      label: 'Start Time',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
      minDate: new Date(),
    },
    {
      key: 'endTime',
      label: 'End Time',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
      minDate: new Date(),
    },
    {
      key: 'location',
      label: 'Location',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'reminderMinutes',
      label: 'Reminder (minutes)',
      type: FieldType.number,
      validations: [],
    },
    {
      key: 'onlineMeeting',
      label: 'Online Meeting',
      type: FieldType.toggle,
      validations: [],
    },
    {
      key: 'meetingLink',
      label: 'Meeting Link',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

const hseMeetingCrud = defineEntityCrud<HseMeeting>({
  name: 'HSE Meeting',
  routeSlug: 'meetings',
  fields: getHseMeetingFormFields(),
  modalWidth: '60%',
  mutations: {
    create: SCHEDULE_OR_RESCHEDULE_HSE_MEETING,
    update: SCHEDULE_OR_RESCHEDULE_HSE_MEETING,
    delete: DELETE_HSE_MEETING,
  },
  permissions: {
    manage: ['ROLE_SCHEDULE_HSE_MEETING'],
    delete: ['ROLE_DELETE_HSE_MEETING'],
    view: ['ROLE_VIEW_HSE_MEETING'],
  },
  modelMapper: (data?: HseMeeting) => ({
    ...(data ?? {}),
    chairPersonUid: (data as any)?.chairPerson?.uid,
    secretaryUid: (data as any)?.secretary?.uid,
  }),
});

export const hseMeeting$ = hseMeetingCrud.reload$;

export const hseMeetingUpsertBtn = (comp: BaseComponent): ActionButton => ({
  ...hseMeetingCrud.upsertBtn(crudHostFromBase(comp)),
  labelMapper: (d?: any) => (!d?.uid ? 'Schedule Meeting' : 'Edit Meeting'),
  showFunction: (row: any) => !row?.uid || row?.status !== MeetingStatus.COMPLETED,
});

export const hseMeetingDeleteBtn = (comp: BaseComponent): ActionButton => ({
  ...hseMeetingCrud.deleteBtn(crudHostFromBase(comp)),
  showFunction: (row: any) => row?.status !== MeetingStatus.COMPLETED,
});

function buildMarkCompletedBtn(host: CrudHost): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Mark Completed',
    color: 'primary',
    toolTip: 'Mark Meeting as Completed',
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
    showFunction: (row: any) =>
      !!row?.uid && !row?.completedAt && row?.status !== MeetingStatus.CANCELLED,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Complete Meeting: ' + (data?.title ?? ''),
        fields: [
          {
            key: 'remarks',
            label: 'Remarks',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: MARK_HSE_MEETING_AS_COMPLETED,
            variables: {
              meetingUid: data.uid,
              remarks: value?.remarks,
              attachments: [],
            },
            successFn: () => {
              hseMeeting$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '50%');
    },
  };
}

function buildApproveMinutesBtn(host: CrudHost): ActionButton {
  return {
    icon: 'thumb_up',
    label: 'Approve Minutes',
    color: 'primary',
    toolTip: 'Approve Meeting Minutes',
    permissions: ['ROLE_APPROVE_HSE_MEETING_MINUTES'],
    showFunction: (row: any) => !!row?.completedAt && !row?.approvedAt && !row?.rejectedAt,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Approve Meeting Minutes: ' + (data?.title ?? ''),
        fields: [
          {
            key: 'comment',
            label: 'Approval Comment',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: APPROVE_HSE_MEETING_MINUTES,
            variables: { meetingUid: data.uid, comment: value?.comment },
            successFn: () => {
              hseMeeting$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '40%');
    },
  };
}

function buildConfirmMeetingBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Confirm & Send Invitations',
    color: 'primary',
    toolTip: 'Confirm meeting and email invitations to attendees',
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
    showFunction: (row: any) =>
      !!row?.uid && !row?.confirmedAt && row?.status === MeetingStatus.SCHEDULED,
    confirmDataMapper: (data: any) => ({
      title: 'Confirm & Send Invitations',
      message: `Confirm "${data?.title ?? 'this meeting'}" and email invitations to all attendees?`,
      confirmText: 'Confirm & Send',
      confirmButtonColor: 'primary',
    }),
    click: async (data: any) => {
      await host.fetch({
        notify: true,
        mutation: CONFIRM_HSE_MEETING,
        variables: { uid: data.uid },
        successFn: () => hseMeeting$.next(null),
      });
    },
  };
}

function buildResendInvitationsBtn(host: CrudHost): ActionButton {
  return {
    icon: 'email',
    label: 'Resend Invitations',
    color: 'primary',
    toolTip: 'Resend invitation emails to attendees',
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
    showFunction: (row: any) =>
      !!row?.uid && !!row?.confirmedAt && row?.status === MeetingStatus.SCHEDULED,
    confirmDataMapper: (data: any) => ({
      title: 'Resend Invitations',
      message: `Resend invitation emails for "${data?.title ?? 'this meeting'}"?`,
      confirmText: 'Resend',
      confirmButtonColor: 'primary',
    }),
    click: async (data: any) => {
      await host.fetch({
        notify: true,
        query: INVITE_TO_HSE_MEETING,
        variables: { meetingUid: data.uid },
        successFn: () => hseMeeting$.next(null),
      });
    },
  };
}

export const hseMeetingConfirmBtn = (comp: BaseComponent): ActionButton =>
  buildConfirmMeetingBtn(crudHostFromBase(comp));

export const hseMeetingResendInvitationsBtn = (comp: BaseComponent): ActionButton =>
  buildResendInvitationsBtn(crudHostFromBase(comp));

export const hseMeetingMarkCompletedBtn = (comp: BaseComponent): ActionButton =>
  buildMarkCompletedBtn(crudHostFromBase(comp));

export const hseMeetingApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveMinutesBtn(crudHostFromBase(comp));

export const hseMeetingRejectBtn = (comp: BaseComponent): ActionButton => {
  const btn = buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_HSE_MEETING_MINUTES,
    entityLabel: 'Meeting Minutes',
    permission: 'ROLE_APPROVE_HSE_MEETING_MINUTES',
    onSuccess: () => hseMeeting$.next(null),
    uidKey: 'meetingUid',
  });
  return {
    ...btn,
    showFunction: (row: any) => !!row?.completedAt && !row?.approvedAt && !row?.rejectedAt,
  };
};

export const hseMeetingTableBtns = (comp: BaseComponent): ActionButton[] =>
  hseMeetingCrud.tableBtns(crudHostFromBase(comp));

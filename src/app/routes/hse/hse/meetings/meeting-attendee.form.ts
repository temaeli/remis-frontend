import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_EMAIL, VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import {
  CREATE_OR_UPDATE_HSE_MEETING_ATTENDEE,
  DELETE_HSE_MEETING_ATTENDEE,
  GET_HSE_MEETING_ATTENDEE_BY_UID,
  SAVE_OR_UPDATE_HSE_MEETING_ATTENDANCE,
} from './meeting-attendee.graphql';

export const hseMeetingAttendee$ = new Subject<any>();

export function getHseMeetingAttendeeFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'contact',
      label: 'Email',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_EMAIL],
    },
    {
      key: 'designation',
      label: 'Designation',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'section',
      label: 'Section',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'organization',
      label: 'Organization',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

export function hseMeetingAttendeeUpsertBtn(comp: BaseComponent, meetingUid: string): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_HSE_MEETING_ATTENDEE_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: { ...seed },
        title: 'Meeting Attendee',
        fields: getHseMeetingAttendeeFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_HSE_MEETING_ATTENDEE,
            variables: { input: value, meetingUid },
            successFn: () => {
              hseMeetingAttendee$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '50%');
    },
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
    ...getUpsertBtnProps('Attendee'),
  };
}

export function hseMeetingAttendeeDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Attendee'),
    permissions: ['ROLE_DELETE_HSE_MEETING'],
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_HSE_MEETING_ATTENDEE,
        variables: { uid: data.uid },
        successFn: () => hseMeetingAttendee$.next(null),
      });
    },
  };
}

export function hseMeetingAttendeeMarkAttendanceBtn(
  comp: BaseComponent,
  meetingUid: string,
): ActionButton {
  return {
    icon: 'how_to_reg',
    label: 'Mark Attendance',
    color: 'primary',
    toolTip: 'Mark Attendance',
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {
          attended: data?.attended ?? false,
          comment: data?.comment ?? '',
        },
        title: `Attendance: ${data?.name ?? 'Attendee'}`,
        fields: [
          {
            key: 'attended',
            label: 'Attended',
            type: FieldType.checkbox,
          },
          {
            key: 'comment',
            label: 'Comment',
            class: 'col-span-full',
            type: FieldType.textarea,
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: SAVE_OR_UPDATE_HSE_MEETING_ATTENDANCE,
            variables: {
              meetingUid,
              attendances: [
                { uid: data?.uid, attended: !!value?.attended, comment: value?.comment ?? null },
              ],
            },
            successFn: () => {
              hseMeetingAttendee$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '40%');
    },
  };
}

export function hseMeetingAttendeeTableBtns(
  comp: BaseComponent,
  meetingUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        hseMeetingAttendeeUpsertBtn(comp, meetingUid),
        hseMeetingAttendeeMarkAttendanceBtn(comp, meetingUid),
        hseMeetingAttendeeDeleteBtn(comp),
      ],
    },
  ];
}

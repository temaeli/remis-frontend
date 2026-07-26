import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { buildAttachmentUploadDto } from '@shared/components/generic-form/attachment/attachment-upload.util';
import { attachmentViewBtn } from '@shared/components/attachment-viewer/attachment-view-button';
import { SAVE_OR_UPDATE_HSE_MEETING_ATTACHMENT } from './meeting.graphql';

export const hseMeetingAttendance$ = new Subject<any>();
export const hseMeetingMinutes$ = new Subject<any>();

function getAttachmentFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'attachmentTitle',
      label: 'Title',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'attachmentFile',
      label: 'Document',
      type: FieldType.attachment,
      validations: [],
      class: 'col-span-full',
      skipAutoUpload: true,
    },
  ];
}

function buildUpsertBtn(
  comp: BaseComponent,
  meetingUid: string,
  sourceName: AttachmentSourceNameEnum,
  reload$: Subject<any>,
  label: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { uid: data?.uid, attachmentTitle: data?.attachmentTitle },
        title: label,
        fields: getAttachmentFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          const dto = buildAttachmentUploadDto(value, sourceName);
          await comp.fs.fetch({
            notify: true,
            mutation: SAVE_OR_UPDATE_HSE_MEETING_ATTACHMENT,
            variables: { meetingUid, input: dto },
            successFn: () => {
              reload$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
    ...getUpsertBtnProps(label),
  };
}

export function hseMeetingAttendanceUpsertBtn(
  comp: BaseComponent,
  meetingUid: string,
): ActionButton {
  return buildUpsertBtn(
    comp,
    meetingUid,
    AttachmentSourceNameEnum.MEETING_ATTENDANCE,
    hseMeetingAttendance$,
    'Attendance Attachment',
  );
}

export function hseMeetingMinutesUpsertBtn(
  comp: BaseComponent,
  meetingUid: string,
): ActionButton {
  return buildUpsertBtn(
    comp,
    meetingUid,
    AttachmentSourceNameEnum.MEETING_MINUTES,
    hseMeetingMinutes$,
    'Minutes Attachment',
  );
}

export function hseMeetingAttendanceTableBtns(
  comp: BaseComponent,
  meetingUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        attachmentViewBtn(comp, ['ROLE_VIEW_HSE_MEETING']),
        hseMeetingAttendanceUpsertBtn(comp, meetingUid),
      ],
    },
  ];
}

export function hseMeetingMinutesTableBtns(
  comp: BaseComponent,
  meetingUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        attachmentViewBtn(comp, ['ROLE_VIEW_HSE_MEETING']),
        hseMeetingMinutesUpsertBtn(comp, meetingUid),
      ],
    },
  ];
}

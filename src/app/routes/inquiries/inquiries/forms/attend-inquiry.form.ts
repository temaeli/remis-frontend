import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ATTEND_INQUIRY } from '../inquiry.graphql';
import { Inquiry, InquiryStatus } from '../inquiry.interface';
import { inquiry$, inquiryProcess$ } from './inquiry.form';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';

export const getAttendInquiryFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },

  {
    key: 'comment',
    type: FieldType.textarea,
    validations: [],
    class: 'col-span-full',
  },

  {
    key: 'attachmentDtos',
    label: 'Inquiry Attend Attachments (optional)',
    type: FieldType.attachment,
    canAddFormGroup: false,
    skipAutoUpload: true,
    attachment: {
      sourceName: AttachmentSourceNameEnum.OTHERS,
      attachmentTitle: 'Inquiry Attend Attachment',
    },
    validations: [],
    class: 'col-span-full',
  },
];

export function inquiryAttendBtn(comp: BaseComponent): ActionButton {
  return {
    label: 'Attend Inquiry',
    icon: 'hand_fix',
    showFunction: (d?: Inquiry) =>
      !!d?.status &&
      [InquiryStatus.OPEN, InquiryStatus.ATTENDED].includes(d?.status) &&
      !!d?.assignments?.find((a) => a.assignee?.uid === comp.auth.user$?.value?.uid),

    click: (data?: Inquiry) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Attend Inquiry',
        fields: getAttendInquiryFormFields(comp),
        closeAction$: inquiryProcess$,

        onSubmit: async (value: any) => {
          if (value.attachmentDtos?.data && !Array.isArray(value.attachmentDtos)) {
            value.attachmentDtos = [value.attachmentDtos];
          } else value.attachmentDtos = [];

          await comp.fs.fetch({
            notify: true,
            variables: { attendInquiryDto: value },
            query: ATTEND_INQUIRY,
            successFn: (res) => inquiryProcess$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_ATTEND_INQUIRY'],
  };
}

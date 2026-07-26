import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { buildAttachmentUploadDto } from '@shared/components/generic-form/attachment/attachment-upload.util';
import { attachmentViewBtn } from '@shared/components/attachment-viewer/attachment-view-button';
import {
  SAVE_OR_UPDATE_INSPECTION_ATTACHMENT,
  DELETE_INSPECTION_ATTACHMENT,
} from './inspection-plan.graphql';

export const inspectionAttachment$ = new Subject<any>();

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

export function inspectionAttachmentUpsertBtn(
  comp: BaseComponent,
  planUid: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { uid: data?.uid, attachmentTitle: data?.attachmentTitle },
        title: 'Inspection Attachment',
        fields: getAttachmentFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          const dto = buildAttachmentUploadDto(value, AttachmentSourceNameEnum.INSPECTION);
          await comp.fs.fetch({
            notify: true,
            mutation: SAVE_OR_UPDATE_INSPECTION_ATTACHMENT,
            variables: { planUid, attachmentDto: dto },
            successFn: () => {
              inspectionAttachment$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: ['ROLE_EXECUTE_INSPECTION_PLAN'],
    ...getUpsertBtnProps('Attachment'),
  };
}

export function inspectionAttachmentDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Attachment'),
    permissions: ['ROLE_DELETE_INSPECTION_PLAN'],
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_INSPECTION_ATTACHMENT,
        variables: { attachmentUid: data.uid },
        successFn: () => inspectionAttachment$.next(null),
      });
    },
  };
}

export function inspectionAttachmentTableBtns(
  comp: BaseComponent,
  planUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        attachmentViewBtn(comp, ['ROLE_VIEW_INSPECTION_PLAN']),
        inspectionAttachmentUpsertBtn(comp, planUid),
        inspectionAttachmentDeleteBtn(comp),
      ],
    },
  ];
}

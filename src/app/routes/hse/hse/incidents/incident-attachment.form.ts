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
import {
  ADD_INCIDENT_ATTACHMENT,
  UPDATE_INCIDENT_ATTACHMENT,
  GET_INCIDENT_ATTACHMENT_BY_UID,
} from './incident.graphql';
import { canActOnIncident } from './incident.form';

export const incidentAttachment$ = new Subject<any>();

function getIncidentAttachmentFormFields(): FieldConfig[] {
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

export function incidentAttachmentUpsertBtn(
  comp: BaseComponent,
  incidentUid: string,
  getIncident?: () => any,
): ActionButton {
  return {
    ...(getIncident ? { showFunction: () => canActOnIncident(getIncident()) } : {}),
    click: async (data?: any) => {
      const isEdit = !!data?.uid;
      const fresh = isEdit
        ? await comp.fs.fetch({
            query: GET_INCIDENT_ATTACHMENT_BY_UID,
            variables: { attachmentUid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { uid: seed?.uid, attachmentTitle: seed?.attachmentTitle },
        title: 'Incident Attachment',
        fields: getIncidentAttachmentFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          const dto = buildAttachmentUploadDto(value, AttachmentSourceNameEnum.INCIDENT);
          if (isEdit) {
            await comp.fs.fetch({
              notify: true,
              mutation: UPDATE_INCIDENT_ATTACHMENT,
              variables: { attachmentUid: data.uid, input: dto },
              successFn: () => {
                incidentAttachment$.next(null);
                close$.next();
              },
            });
          } else {
            await comp.fs.fetch({
              notify: true,
              mutation: ADD_INCIDENT_ATTACHMENT,
              variables: { incidentUid, input: dto },
              successFn: () => {
                incidentAttachment$.next(null);
                close$.next();
              },
            });
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: ['ROLE_REPORT_INCIDENT', 'ROLE_UPDATE_INCIDENT'],
    ...getUpsertBtnProps('Attachment'),
  };
}

export function incidentAttachmentTableBtns(
  comp: BaseComponent,
  incidentUid: string,
  getIncident?: () => any,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        attachmentViewBtn(comp, ['ROLE_VIEW_INCIDENT']),
        incidentAttachmentUpsertBtn(comp, incidentUid, getIncident),
      ],
    },
  ];
}

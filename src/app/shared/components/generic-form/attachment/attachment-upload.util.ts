import { BaseComponent } from '@shared/components/base-componet/base-component';
import { lastValueFrom, Subject } from 'rxjs';
import { AttachmentSourceNameEnum } from './attachment.interface';
import { DELETE_ATTACHMENT, UPLOAD_ATTACHMENT } from './attachment.graphql';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { Form } from '@angular/forms';
import { FormParameters } from '../form.interface';
import { FieldType } from '../field.interface';
import { VALIDATOR_REQUIRED } from '../form-constants';
import { FormComponent } from '../form.component';
import { obs } from '../field-helpers';

export const attachment$ = new Subject<any>();

/**
 * Build the AttachmentDto payload for the module-scoped upload mutations
 * (addIncidentAttachment, saveOrUpdateHseMeetingAttachment,
 * saveOrUpdateInspectionAttachment — all routed through
 * AttachmentService.uploadAttachment(dto, sourceUid, model)).
 *
 * That backend path reads the payload TWICE with conflicting expectations:
 *   - getUploadedDataLocation(dto.data) parses a full `data:<mime>;base64,…` URI
 *     for the mime + payload, so `data` MUST carry the prefix.
 *   - updateAttachmentFromDto decodes `dto.dataBinary` as RAW base64 (no prefix)
 *     when present, else falls back to decoding `dto.data` — which throws
 *     `Illegal base64 character 3a` on the `:` of a data URI.
 * So we send both: `data` = URI (for the path resolver), `dataBinary` = raw
 * (for the decoder). The generic-form attachment field already hands us raw
 * base64 in `dataBinary`/`data`.
 */
export function buildAttachmentUploadDto(value: any, sourceName: AttachmentSourceNameEnum) {
  const att = value?.attachmentFile ?? {};
  const rawCandidate: string = att?.dataBinary ?? att?.data ?? '';
  const rawBase64 = rawCandidate.startsWith('data:')
    ? (rawCandidate.split(',', 2)[1] ?? '')
    : rawCandidate;
  const fullMime: string = att?.type ?? att?.mediaType ?? 'application/octet-stream';
  return {
    uid: value?.uid,
    attachmentTitle: value?.attachmentTitle ?? att?.fileName,
    sourceName,
    data: `data:${fullMime};base64,${rawBase64}`,
    dataBinary: rawBase64,
    mediaType: att?.mediaType,
    mediaSize: att?.mediaSize,
  };
}

export function uploadAttachmentBtn(comp: BaseComponent, sourceName: AttachmentSourceNameEnum) {
  return <ActionButton>{
    label: 'Add Attachment',
    icon: 'upload',
    showFunction: (data?: any) => !!data?.uid,

    click: async (data?: any) => {
      let fp: FormParameters = {
        title: 'Upload Attachment',

        fields: [
          {
            key: 'data',
            label: 'Attachment File',
            type: FieldType.attachment,
            skipAutoUpload: true,
            attachment: { sourceName },
            validations: [],
            class: 'col-span-full',
          },
          {
            key: 'attachmentTitle',
            value: obs('data', (data) => data?.attachmentTitle ?? ''),
            type: FieldType.input,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
            showWhen: [{ key: 'data' }],
          },
        ],

        closeAction$: attachment$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            mutation: UPLOAD_ATTACHMENT,
            variables: {
              attachmentDto: {
                ...value?.data,
                ...value,
                sourceId: data?.uid,
                data: value?.data?.data,
              },
            },
            notify: true,
            successFn: () => attachment$.next(data),
          });

          comp.cdr.markForCheck();
        },
      };

      comp.vs?.openModal(FormComponent, fp, '96%');
    },
    // permissions: ['ROLE_UPLOAD_ATTACHMENT'],
  };
}

export function deleteAttachmentBtn(comp: BaseComponent, attachment?: any) {
  return <ActionButton>{
    // label: 'Delete',
    icon: 'delete',
    tooltip: 'Delete Attachment',
    confirmMessage: 'Are you sure you want to delete this attachment?',
    click: async (data?: any) => {
      if (!data?.uid) return;

      await comp.fs.fetch({
        mutation: DELETE_ATTACHMENT,
        variables: { id: data?.id ?? attachment?.id },
        notify: true,
        successFn: () => attachment$.next(data),
      });

      comp.cdr.markForCheck();
    },
    // permissions: ['ROLE_DELETE_ATTACHMENT'],
  };
}

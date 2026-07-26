// Shared attachment helpers for the Construction module.
// Construction DTOs accept `attachments: [AttachmentDtoInput]` on save and
// expose per-entity read queries returning `[Attachment]` (e.g.
// `constructionDailyReportAttachments`, `constructionProjectAttachments`).

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';

/**
 * Upload field producing a single transient attachment object
 * (`{ data, attachmentTitle, sourceName }`). Use `mapConstructionAttachments`
 * when building the mutation variables to fold it into `attachments`.
 */
export function constructionAttachmentField(
  attachmentTitle: string,
  label = 'Attachments (optional)',
): FieldConfig {
  return {
    key: 'attachmentInput',
    label,
    type: FieldType.attachment,
    canAddFormGroup: false,
    skipAutoUpload: true,
    attachment: { sourceName: AttachmentSourceNameEnum.OTHERS, attachmentTitle },
    validations: [],
    class: 'col-span-full',
  };
}

/**
 * Folds the transient `attachmentInput` form value into `attachments` and
 * strips the transient key. Returns the cleaned DTO ready for the mutation.
 */
export function mapConstructionAttachments(value: any): any {
  const dto = { ...(value ?? {}) };
  const input = dto.attachmentInput;
  delete dto.attachmentInput;
  const attachment = Array.isArray(input) ? input[0] : input;
  if (attachment?.data) {
    dto.attachments = [attachment];
  }
  return dto;
}

/**
 * Repeatable attachment field — one file per row, rows addable/removable.
 * The backend accepts an arbitrary-length `attachments` list per save, so
 * this is the multi-file counterpart to `constructionAttachmentField`.
 * Pair with `mapConstructionAttachmentRows` on submit.
 */
export function constructionAttachmentRowsField(
  key = 'attachmentRows',
  label = 'Site Photos / Attachments (optional)',
): FieldConfig {
  return {
    key,
    label,
    type: FieldType.formGroupArray,
    class: 'col-span-full',
    canAddFormGroup: true,
    fields: [
      {
        key: 'attachmentInput',
        label: 'File',
        type: FieldType.attachment,
        skipAutoUpload: true,
        attachment: { sourceName: AttachmentSourceNameEnum.OTHERS },
        validations: [],
      },
    ],
  };
}

/**
 * Folds the repeatable `attachmentRows` (from `constructionAttachmentRowsField`)
 * into a flat `attachments` array, dropping empty rows, and strips the
 * transient key. Returns the cleaned DTO ready for the mutation.
 */
export function mapConstructionAttachmentRows(value: any, key = 'attachmentRows'): any {
  const dto = { ...(value ?? {}) };
  const rows = dto[key];
  delete dto[key];
  const attachments = (Array.isArray(rows) ? rows : [])
    .map((row) => row?.attachmentInput)
    .filter((attachment) => !!attachment?.data);
  if (attachments.length) {
    dto.attachments = attachments;
  }
  return dto;
}

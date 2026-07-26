// Shared attachment (evidence) helpers for the Security module.
// Security DTOs accept `attachmentDtoList: [AttachmentDtoInput]` on save and
// expose per-entity read queries returning `[Attachment]`. These helpers wire
// an upload field into the forms and an attachments tab into the detail views.

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { attachmentViewBtn } from '@shared/components/attachment-viewer/attachment-view-button';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';

/**
 * Upload field producing a single transient attachment object
 * (`{ data, attachmentTitle, sourceName }`). Use `mapAttachmentDtoList` in the
 * CRUD `upsertVariables` to fold it into `attachmentDtoList`.
 */
export function securityAttachmentField(
  sourceName: AttachmentSourceNameEnum,
  attachmentTitle: string,
  label = 'Attachments (optional)',
): FieldConfig {
  return {
    key: 'attachmentInput',
    label,
    type: FieldType.attachment,
    canAddFormGroup: false,
    skipAutoUpload: true,
    attachment: { sourceName, attachmentTitle },
    validations: [],
    class: 'col-span-full',
  };
}

/**
 * Folds the transient `attachmentInput` form value into `attachmentDtoList` and
 * strips the transient key. Returns the cleaned DTO ready for the mutation.
 */
export function mapAttachmentDtoList(value: any): any {
  const dto = { ...(value ?? {}) };
  const input = dto.attachmentInput;
  delete dto.attachmentInput;
  const attachment = Array.isArray(input) ? input[0] : input;
  if (attachment?.data) {
    dto.attachmentDtoList = [attachment];
  }
  return dto;
}

/**
 * Builds the "Attachments" tab for a detail view backed by one of the security
 * `*Attachments` read queries. Each row links to the shared attachment viewer.
 */
export function attachmentsContent(
  comp: BaseComponent,
  query: any,
  variables: Record<string, any>,
  permissions: string[] = [],
): ContentParameter {
  return {
    type: 'table',
    name: 'Attachments',
    label: 'Attachments',
    icon: 'attach_file',
    keyColumns: ['attachmentTitle', 'mediaType', 'mediaSize', 'actions'],
    isPageable: false,
    actionButtons: [attachmentViewBtn(comp, permissions)],
    fetchParameter: { query, variables },
  };
}

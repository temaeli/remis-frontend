import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { SecurityFormSubmissionModalComponent } from './security-form-submission-modal.component';
import { SecurityFormSubmission } from './security-form-submission.interface';
import { FetchService } from '@shared/fetch/fetch.service';
import { SAVE_SECURITY_FORM_SUBMISSION } from './security-form-submission.graphql';
import { mapAttachmentDtoList } from '../shared/security-attachments';

/**
 * Custom button handler for Form Submission upsert that opens the dynamic modal
 * instead of the CRUD system's static modal
 */
export function securityFormSubmissionDynamicUpsertBtn(
  comp: BaseComponent,
  row?: SecurityFormSubmission,
): ActionButton {
  const dialog = inject(MatDialog);
  const fs = inject(FetchService);

  return {
    label: row ? 'Edit' : 'Create',
    icon: row ? 'edit' : 'add',
    color: row ? 'primary' : undefined,
    click: async () => {
      const dialogRef = dialog.open(SecurityFormSubmissionModalComponent, {
        width: '70%',
        maxHeight: '90vh',
        data: {
          row: row ? {
            ...row,
            formUid: row.form?.uid,
            stationUid: row.station?.uid,
          } : null
        },
      });

      const result = await dialogRef.afterClosed().toPromise();

      if (result) {
        try {
          // Clean each value entry: strip frontend-only metadata fields,
          // merge valueSelect into valueText for SELECT-type fields,
          // and skip entries with no actual value.
          const transformedValues = (result.values || [])
            .map((v: any) => {
              const isSelect = v.fieldType === 'SELECT' || v.fieldType === 'MULTISELECT';
              const isTable = v.fieldType === 'TABLE';
              return {
                fieldKey: v.fieldKey,
                valueText: isSelect || isTable ? '' : (v.valueText || ''),
                valueSelect: isSelect ? (v.valueSelect || v.valueText || '') : undefined,
                valueNumber: (v.valueNumber !== '' && v.valueNumber != null) ? v.valueNumber : null,
                valueDate: v.valueDate || null,
                valueBoolean: v.valueBoolean ?? false,
                valueJson: isTable ? (v.valueText || null) : null,
              };
            })
            .map(({ valueSelect, ...rest }: any) =>
              valueSelect !== undefined ? { ...rest, valueText: valueSelect } : rest,
            )
            .filter(
              (v: any) => v.fieldKey && (v.valueText || (v.valueNumber != null && v.valueNumber !== '') || v.valueDate || v.valueBoolean || v.valueJson),
            );

          // Map the form data to match SecurityFormSubmissionDtoInput structure.
          // Omit date/uid fields when empty to avoid backend LocalDate parse errors.
          const submitData = mapAttachmentDtoList({
            formUid: result.formUid,
            ...(result.stationUid ? { stationUid: result.stationUid } : {}),
            ...(result.periodStart ? { periodStart: result.periodStart } : {}),
            ...(result.periodEnd ? { periodEnd: result.periodEnd } : {}),
            values: transformedValues,
          });

          console.log('Submitting form data:', submitData);

          // Submit the form to the backend using mutation
          await fs.fetch({
            mutation: SAVE_SECURITY_FORM_SUBMISSION,
            variables: {
              dto: submitData,
            },
          });

          console.log('Form submission saved successfully');

          // Reload the component
          comp.reloadComponent?.();
        } catch (error) {
          console.error('Failed to save form submission:', error);
        }
      }
    },
  };
}

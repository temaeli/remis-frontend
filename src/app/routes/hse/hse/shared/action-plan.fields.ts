import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';

/**
 * Shared form fields for the `ActionPlanDto` model, reused by both
 * Incident Corrective Actions and Inspection Action Plans (same backend DTO:
 * `{ uid?, action!, remarks?, assignedTo!, assignedToAs!, durationInDays! }`).
 *
 * Per-module wiring (mutations, parent-uid arg, mark-completed) stays in each
 * module's `*.form.ts`; only the identical field definitions live here.
 */
export function getActionPlanFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'action',
      label: 'Action',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'assignedToAs',
      label: 'Assigned To As',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'durationInDays',
      label: 'Duration (days)',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

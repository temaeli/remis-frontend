import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { getDisplayName } from '@shared/components/view-component/view.helpers';

/**
 * What kind of checklist something belongs to: the labels of the database enum
 * `checklist_types`, in its order, mirroring `ChecklistType` on the backend.
 */
export const CHECKLIST_TYPES = [
  'INSPECTION',
  'ASSESSMENT',
  'COMPLIANCE',
  'VERIFICATION',
  'EVALUATION',
  'AUDIT',
  'SURVEY',
  'HANDOVER',
  'MAINTENANCE',
  'SAFETY',
  'QUALITY_ASSURANCE',
  'DOCUMENTATION',
  'REGISTRATION',
  'APPROVAL',
  'CUSTOM',
  'ECO_LEVY',
] as const;

/**
 * The default the database gives inspections, assessments and the three
 * parameter tables. Checklists themselves have no default.
 */
export const DEFAULT_CHECKLIST_TYPE = 'COMPLIANCE';

export const CHECKLIST_TYPE_OPTIONS: Option[] = CHECKLIST_TYPES.map((value) => ({
  value,
  label: getDisplayName(value) as string,
}));

/**
 * The Checklist Type select. No `value` of its own: the form lets a field's
 * value override the record's, so any default is set in the lookup's `toModel`.
 * Required only on the checklist form, where the column has no default.
 */
export const checklistTypeField = (required = false): FieldConfig => ({
  key: 'checklistType',
  label: 'Checklist Type',
  hint: 'What kind of checklist this belongs to',
  type: FieldType.select,
  options: CHECKLIST_TYPE_OPTIONS,
  validations: required ? [VALIDATOR_REQUIRED] : [],
});

export const checklistTypeColumn: GridKeyColumn = {
  field: 'checklistType',
  header: 'Checklist Type',
  valueFn: (row) => getDisplayName(row?.checklistType),
};

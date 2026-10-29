import { AbstractControl, ValidationErrors } from '@angular/forms';
import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { getDisplayName } from '@shared/components/view-component/view.helpers';

/**
 * What kind of party a record is: the labels of the database enum
 * `bio_data_types`, in its order, mirroring `BioDataType` on the backend.
 * People default to HUMAN_BEING and organisations to COMPANY.
 */
export const BIO_DATA_TYPES = [
  'HUMAN_BEING',
  'COMPANY',
  'PERSON',
  'ORGANIZATION',
  'GOVERNMENT',
  'GOVERNMENT_AGENCY',
  'BUSINESS',
  'INSTITUTION',
  'NON_GOVERNMENTAL_ORGANIZATION',
  'INTERNATIONAL_ORGANIZATION',
  'PARTNERSHIP',
  'COOPERATIVE',
  'ASSOCIATION',
  'SOCIETY',
  'CLUB',
  'FOUNDATION',
  'TRUST',
  'RELIGIOUS_ORGANIZATION',
  'EDUCATIONAL_INSTITUTION',
  'HEALTHCARE_INSTITUTION',
  'FINANCIAL_INSTITUTION',
  'PUBLIC_INSTITUTION',
  'PRIVATE_INSTITUTION',
  'HOUSEHOLD',
  'FAMILY',
  'COMMUNITY',
  'GROUP',
  'TEAM',
  'DEPARTMENT',
  'DIVISION',
  'UNIT',
  'BRANCH',
  'SUBSIDIARY',
  'SOLE_PROPRIETORSHIP',
  'LEGAL_ENTITY',
  'OTHER',
  'FOREIGN_COMPANY',
] as const;

export const BIO_DATA_TYPE_OPTIONS: Option[] = BIO_DATA_TYPES.map((value) => ({
  value,
  label: getDisplayName(value) as string,
}));

/**
 * The type select on the person and business name forms. No `value` of its
 * own: the form lets a field's value override the record's, so the default is
 * set in each lookup's `toModel` instead.
 */
export const bioDataTypeField = (): FieldConfig => ({
  key: 'bioDataType',
  label: 'Type',
  hint: 'What kind of party this is',
  type: FieldType.select,
  options: BIO_DATA_TYPE_OPTIONS,
  validations: [VALIDATOR_REQUIRED],
});

export const bioDataTypeColumn: GridKeyColumn = {
  field: 'bioDataType',
  header: 'Type',
  valueFn: (row) => getDisplayName(row?.bioDataType),
};

/*
 * Mobile numbers on people and organisations, held to the DBA's rules
 * (bio_data17, 18, 46 to 48; business_names15 to 18, 27 to 29), the same as
 * `PhoneNumbers` on the backend:
 *   - every number is more than 1000000000 and less than 10000000000000;
 *   - a local number (the `local` toggle on) is more than 255000000000;
 *   - a foreign number (`local` off) only needs the first rule.
 */

/**
 * Whether the form the control sits in marks the record as local: on unless
 * switched off. Undefined while the form is still being built (a control is
 * first checked before it joins its form), so the local rule waits until the
 * number or the toggle changes rather than judging a foreign record as local.
 */
const localFlag = (control: AbstractControl): boolean | undefined => {
  const local = control.parent?.get('local');
  return local ? local.value !== false : undefined;
};

const isLocal = (control: AbstractControl): boolean => localFlag(control) !== false;

/**
 * The number as the backend stores it: digits only, and for a local number a
 * leading 0 replaced by 255. Null when nothing is typed.
 */
const mobileAsNumber = (control: AbstractControl): number | null => {
  let digits = String(control.value ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (isLocal(control) && digits.startsWith('0')) digits = '255' + digits.substring(1);
  return Number(digits);
};

export const VALIDATOR_MOBILE_RANGE = {
  name: 'mobileRange',
  message: 'Must be more than 1000000000 and less than 10000000000000 (10 to 13 digits, with the country code)',
  validator: (control: AbstractControl): ValidationErrors | null => {
    const number = mobileAsNumber(control);
    return number == null || (number > 1000000000 && number < 10000000000000) ? null : { mobileRange: true };
  },
};

export const VALIDATOR_MOBILE_LOCAL = {
  name: 'mobileLocal',
  message: 'A Tanzanian number must be more than 255000000000, e.g. 0754000000. Switch Local off for a foreign number.',
  validator: (control: AbstractControl): ValidationErrors | null => {
    const number = mobileAsNumber(control);
    return number == null || localFlag(control) !== true || number > 255000000000 ? null : { mobileLocal: true };
  },
};

/** The mobile number input on the person and business name forms. */
export const mobileNumberField = (required: boolean): FieldConfig => ({
  key: 'mobileNumber',
  label: 'Mobile Number',
  hint: 'Local: a Tanzanian number, e.g. 0754000000. Not local: the number with its country code, e.g. 14155550123',
  type: FieldType.input,
  validations: [
    ...(required ? [VALIDATOR_REQUIRED] : []),
    VALIDATOR_MOBILE_RANGE,
    VALIDATOR_MOBILE_LOCAL,
  ],
});

/**
 * The `local` toggle on the person and business name forms. Switching it
 * re-checks the mobile number, which is read as Tanzanian or foreign by it.
 *
 * No `value` of its own, like {@link bioDataTypeField}: a field's value would
 * override the record's, so a foreign record would open as local. The default
 * (on) is set in each lookup's `toModel` instead.
 */
export const localField = (): FieldConfig => ({
  key: 'local',
  label: 'Local',
  hint: 'On for a Tanzanian record, off for a foreign one',
  type: FieldType.toggle,
  onChange: (_value, form) => form?.get('mobileNumber')?.updateValueAndValidity(),
});

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

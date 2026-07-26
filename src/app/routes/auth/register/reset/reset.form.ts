import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRED,
  VALIDATOR_STRONG_PASSWORD,
} from '@shared/components/generic-form/form-constants';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BehaviorSubject, Subject } from 'rxjs';

// newPassword
// confirmPassword
// email
// rememberToken

export const getResetFields = (token?: string): FieldConfig[] => [
  {
    key: 'email',
    label: 'email',
    type: FieldType.input,
    inputType: 'email',
    visible: !token,
    validations: [VALIDATOR_REQUIRED, VALIDATOR_EMAIL],
  },
  {
    key: 'rememberToken',
    type: FieldType.input,
    value: token,
    visible: false,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'newPassword',
    type: FieldType.input,
    inputType: 'password',
    visible: !!token,
    validations: [VALIDATOR_REQUIRED, VALIDATOR_STRONG_PASSWORD],
  },
  {
    key: 'confirmPassword',
    type: FieldType.input,
    inputType: 'password',
    visible: !!token,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'submit',
    label: `${token ? 'Confirm Change' : 'Request Change'} `,
    type: FieldType.submit,
    isSaving$: new BehaviorSubject(false),
    class: 'col-span-full',
  },
];

export const getResetFp = (token?: string): FormParameters => ({
  fields: getResetFields(token),
  fieldsClass: 'xl:grid-cols-1',
  crossValidators: [{ type: 'match', fields: ['newPassword', 'confirmPassword'] }],
});

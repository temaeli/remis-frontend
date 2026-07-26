import { FieldType } from '@shared/components/generic-form/field.interface';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_NIN,
  VALIDATOR_REQUIRED,
  VALIDATOR_STRONG_PASSWORD,
  VALIDATOR_TANZINIA_PHONE,
} from '@shared/components/generic-form/form-constants';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BehaviorSubject } from 'rxjs';

export const registerFp: FormParameters = {
  crossValidators: [{ fields: ['password', 'confirmPassword'], type: 'match' }],

  fields: [
    {
      key: 'fullName',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'emailAddress',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_EMAIL],
    },
    {
      key: 'nationalId',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_NIN],
    },
    {
      key: 'phoneNumber',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_TANZINIA_PHONE],
    },
    {
      key: 'gender',
      type: FieldType.select,
      options: ['MALE', 'FEMALE'],
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'password',
      type: FieldType.input,
      inputType: 'password',
      validations: [VALIDATOR_REQUIRED, VALIDATOR_STRONG_PASSWORD],
    },
    {
      key: 'confirmPassword',
      type: FieldType.input,
      inputType: 'password',
      ignoreOnSubmit: true,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_STRONG_PASSWORD],
    },
    {
      key: 'save',
      type: FieldType.submit,
      label: 'Submit',
      class: 'col-span-full',
      isSaving$: new BehaviorSubject(false),
    },
  ],
};

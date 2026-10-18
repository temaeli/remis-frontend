import { FieldType } from '@shared/components/generic-form/field.interface';
import {
  VALIDATOR_NIN,
  VALIDATOR_PERSON_EMAIL,
  VALIDATOR_REQUIRED,
  VALIDATOR_STRONG_PASSWORD,
  VALIDATOR_TANZINIA_PHONE,
} from '@shared/components/generic-form/form-constants';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BehaviorSubject } from 'rxjs';

/**
 * What the backend needs to put someone on the register and give them a login:
 * the three names a person record requires, the email they will sign in with,
 * their mobile number and national ID, and a password of their own.
 */
export const registerFp: FormParameters = {
  crossValidators: [{ fields: ['password', 'confirmPassword'], type: 'match' }],

  fields: [
    {
      key: 'firstName',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'secondName',
      label: 'Middle Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'thirdName',
      label: 'Last Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'email',
      label: 'Email Address',
      hint: 'You will sign in with this, and the code is sent here',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_PERSON_EMAIL],
    },
    {
      key: 'mobileNumber',
      hint: 'For example 0654321234',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_TANZINIA_PHONE],
    },
    {
      key: 'nationalId',
      label: 'National ID (NIN)',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_NIN],
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
      label: 'Send Verification Code',
      class: 'col-span-full',
      isSaving$: new BehaviorSubject(false),
    },
  ],
};

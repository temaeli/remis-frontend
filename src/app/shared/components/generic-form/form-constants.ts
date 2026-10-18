import { Validators } from '@angular/forms';
import { CustomValidators } from './custom-validators';

export const validNamePattern = '^[a-zA-Z\']{2,}$';
export const validNumberPattern = '^[0-9]+(\\.[0-9]+)?$';
export const validFullNamePattern = '^[a-zA-Z\' ]{2,}$';
export const tanzaniaPhonePattern = '(\\+[0-9]{3}|[0-9]{3}|0)[^0]([0-9]{8})';
export const phoneNumberPattern = '(255|0)([0-9]{9})$';
export const tinNumberPattern = '([0-9]{9})$';
export const ninPattern = '^[0-9]{20}$';
export const currencyPattern = '/^d+(,d{3})*$/';
export const numericValidator = '^[0-9]+$';

export const VALIDATOR_REQUIRED = {
  name: 'required',
  message: 'This field is required',
  validator: Validators.required,
};

export const VALIDATOR_TANZINIA_PHONE = {
  name: 'pattern',
  message: 'Invalid phone number. Use format:0654321234',
  validator: Validators.pattern(tanzaniaPhonePattern),
};

export const VALIDATOR_WEBSITE = {
  name: 'number',
  message: 'Invalid  Website Url',
  validator: Validators.pattern(
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ),
};

export const VALIDATOR_NIN = {
  name: 'pattern',
  message: 'Invalid NIN. Must be exactly 20 digits',
  validator: Validators.pattern(ninPattern),
};

export const VALIDATOR_EMAIL = {
  name: 'email',
  message: 'Invalid Email',
  validator: Validators.email,
};

/**
 * A person's email, held to `bio_data37`. Stricter than {@link VALIDATOR_EMAIL},
 * which lets through `someone@remis`; the database refuses an address whose
 * domain has no dot, so the form does too. `EmailAddresses` on the backend.
 */
const emailLocalPart = '[A-Z0-9!#$%&\'*+/=?^_`{|}~-]+';

export const VALIDATOR_PERSON_EMAIL = {
  name: 'pattern',
  message: 'Invalid email address, for example name@example.com',
  validator: Validators.pattern(
    new RegExp(
      '^' +
        emailLocalPart +
        '(\\.' +
        emailLocalPart +
        ')*' +
        '@([A-Z0-9]([A-Z0-9-]*[A-Z0-9])?\\.)+[A-Z]{2,63}$',
      'i',
    ),
  ),
};

/**
 * A GePG control number as `normal_bill_control_numbers_bio_data42` takes it:
 * digits only, above 100000000000. Twelve digits or more, not led by a zero, and
 * not that number itself.
 */
export const VALIDATOR_CONTROL_NUMBER = {
  name: 'pattern',
  message: 'Digits only, greater than 100000000000',
  validator: Validators.pattern(/^(?!0)(?!100000000000$)[0-9]{12,50}$/),
};

//TODO; put actual domain
export const VALIDATOR_DOMAIN_EMAIL = {
  name: 'email',
  message: 'Invalid Email',
  validator: Validators.pattern('^([a-zA-Z0-9_\\-\\.]+)@domain.go.tz$'),
};

export const VALIDATOR_HAS_NUMBER = {
  name: 'hasNumber',
  message: 'Has No Number',
  validator: CustomValidators.patternValidator(/\d/, { hasNumber: true }),
};

export const VALIDATOR_HAS_CAPITAL = {
  name: 'hasCapital',
  message: 'Has No Capital Letter',
  validator: CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
};

export const VALIDATOR_HAS_SMALL = {
  name: 'hasSmall',
  message: 'Has No Small Letter',
  validator: CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
};

const specialCharacters = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export const VALIDATOR_HAS_SPECIAL_CHARACTER = {
  name: 'hasSpecial',
  message: 'Has No Special Character',
  validator: CustomValidators.patternValidator(specialCharacters, { hasSpecialCharacters: true }),
};

export const VALIDATOR_HAS_MINIMUM_LENGTH = {
  name: 'hasMinimum',
  message: 'Length Must Be Atleast 8 Characters',
  validator: Validators.minLength(8),
};

export const VALIDATOR_PHONE_NUMBER_MAX_LENGTH = {
  name: 'hasMaximum',
  message: 'Maximum Length Exceeded',
  validator: [Validators.maxLength(12), Validators.pattern('[0-9]{12}')],
};

export const VALIDATOR_STRONG_PASSWORD = {
  name: 'strongPassword',
  message:
    'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.',
  validator: Validators.pattern(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  ),
};

export const VALIDATOR_FAX = {
  name: 'pattern',
  message: 'Invalid fax number. Use format: +255654321234, 255654321234, or 0654321234',
  validator: Validators.pattern(tanzaniaPhonePattern),
};

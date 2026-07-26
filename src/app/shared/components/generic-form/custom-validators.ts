import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /** Start Number Validation
   *
   * check for valid number ::: CustomValidators.number()
   * check for valid number and min value :: CustomValidators.number({min: 0})
   *  check for valid number and max value :: CustomValidators.number({max: 20})
   * check for valid number and value range ie: [0-20] ::  CustomValidators.number({min: 0, max: 20})
   *
   */
  static number(prms: { min?: number; max?: number } = {}): ValidatorFn {
    const obj: any = { number: true };

    return ((control: FormControl): Record<string, string> | null => {
      // if (isPresent(Validators.required(control))) {
      //   return null;
      // }

      const val: number = control.value;
      const min: any = prms.min;
      const max: any = prms.max;

      if (isNaN(val) || /\D/.test(val.toString())) return obj;
      else if (!isNaN(min) && !isNaN(max)) {
        return val < min || val > max ? obj : null;
      } else if (!isNaN(min)) return val < min ? obj : null;
      else if (!isNaN(max)) return val > max ? obj : null;
      else return null;
    }) as any;
  }

  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): Record<string, any> => {
      if (!control.value) return null as any; // if control is empty return no error
      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);
      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null as any : error;
    };
  }

  static PasswordValidator(control: AbstractControl): Record<string, boolean> | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (password?.pristine || confirmPassword?.pristine) return null;

    return password && confirmPassword && password.value !== confirmPassword.value
      ? { misMatch: true }
      : null;
  }

  static phoneNumberValidator(control: AbstractControl): any {
    const countryCode = control.get('country_code');
    const phone = control.get('phone');
    if (countryCode?.value + '' !== '255') {
      return null;
    }
    return { phoneLengthError: true };
  }
}

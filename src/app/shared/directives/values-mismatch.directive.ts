import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export const valuesMismatchDirective: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ valuesMismatch: true });
    return { valuesMismatch: true };
  }
  confirmPassword?.setErrors(null);
  return null;
};

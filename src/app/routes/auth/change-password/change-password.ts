import { MatDialogRef } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { LocalStorageEnum } from '@core/settings/local-storage.service';
import { AuthService } from '../auth.service';

type PartComp = BaseComponent & { auth: AuthService };

export const changePasswordFormConfig: FormParameters = {
  fields: [
    {
      key: 'oldPassword',
      label: 'Old Password',
      type: FieldType.input,
      inputType: 'password',
      class: 'col-span-full pt-1',
      placeholder: 'Enter your current password',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'newPassword',
      label: 'New Password',
      type: FieldType.input,
      inputType: 'password',
      class: 'col-span-full',
      placeholder: 'Enter your new password',
      hint: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
      validations: [
        VALIDATOR_REQUIRED,
        {
          name: 'minlength',
          validator: Validators.minLength(8),
          message: 'Password must be at least 8 characters',
        },
        {
          name: 'pattern',
          validator: Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          ),
          message: 'Password must contain uppercase, lowercase, number and special character',
        },
      ],
      onChange: (value, form) => {
        // Trigger validation on confirmPassword when newPassword changes
        const confirmPasswordControl = form?.get('confirmPassword');
        if (confirmPasswordControl) {
          confirmPasswordControl.updateValueAndValidity();
        }
      },
    },
    {
      key: 'confirmPassword',
      label: 'Confirm New Password',
      type: FieldType.input,
      inputType: 'password',
      class: 'col-span-full pt-1',
      placeholder: 'Re-enter your new password',
      validations: [
        VALIDATOR_REQUIRED,
        {
          name: 'passwordMatch',
          validator: (control: any) => {
            const formGroup = control.parent;
            if (!formGroup) return null;

            const newPassword = formGroup.get('newPassword')?.value;
            const confirmPassword = control.value;

            return newPassword === confirmPassword ? null : { passwordMatch: true };
          },
          message: 'Passwords do not match',
        },
      ],
    },
  ],
  title: 'Change Password',
  fieldsClass: 'grid grid-cols-1 gap-4',
};

export function openChangePasswordDialog(comp: PartComp) {
  const userDetails = comp.storage.getItem(LocalStorageEnum.USER_DETAILS);
  const userId = userDetails?.id;

  if (!userId) {
    comp.notify.error('User ID not found. Please login again.');
    return;
  }

  const ref = comp.vs?.openDialog({
    data: {
      ...changePasswordFormConfig,
      onSubmit: async (data?: any) => {
        // Validate passwords match
        if (data?.newPassword !== data?.confirmPassword) {
          comp.notify.error('New password and confirm password do not match');
          return;
        }

        const payload = {
          userId,
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        };

        await comp.fs.fetch({
          notify: true,
          loadingOn: 'change-password',
          // fetchFn: () => comp.auth.changePassword(payload),
          successFn: () => {
            ref?.close();
            comp.notify.success('Password changed successfully');
          },
        });
      },
    } as FormParameters,
    component: FormComponent,
    width: '96%',
    maxWidth: '500px',
  });
}

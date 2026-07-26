import { Component, OnInit, inject, ChangeDetectorRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { CommonModule } from '@angular/common';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { AuthService } from 'app/routes/auth';
import { User } from 'app/routes/auth/auth.interface';
import { CHANGE_PASSWORD } from 'app/routes/users-managment/users/user.graphql';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'app-user',
  template: `
    <action-buttons
      [actionButtons]="actionButtons"
      [animation]="animation"
      [data]="user$ | async"
    />
  `,
  imports: [CommonModule, ActionButtonsComponent],
})
export class UserButton extends BaseComponent implements OnInit {
  override router = inject(Router);
  override auth = inject(AuthService);
  override cdr = inject(ChangeDetectorRef);

  @Input() override animation = settings$.value.animations?.pages;

  user$ = this.auth.user$;
  override actionButtons: ActionButton[] = [];

  ngOnInit(): void {
    this.setActions();
  }

  setActions() {
    this.actionButtons = [
      {
        type: 'button',
        labelMapper: (user: User) => {
          const names = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
          return names || 'User';
        },
        labelClass: 'lg:inline-block none px-3 font-bold text-white_ text-[16px]',
        icon: 'jobseeker',
        iconClass:
          'size-[24px] icon-medium overflow-hidden rounded-full border border-gray-300 bg-primary-100 dark:bg-gray-700 border-primary_',
        iconPosition: 'after',
        class: 'text-bold border-none',
        label: 'button',

        buttons: [
          {
            icon: 'graduate',
            label: 'My Profile',
            click: (user: User) => {
              if (user?.clientType) {
                this.router.navigateByUrl('portal/profile');
              } else {
                this.router.navigateByUrl('user/profile');
              }
            },
          },
          {
            icon: 'password',
            label: 'Change Password',
            click: () => this.changePassword(),
          },

          {
            icon: 'logout',
            label: 'Logout',
            click: (user: User) => this.logout(),
          },
        ],
      },
    ];
  }

  async editProfile() {
    //
  }

  viewProfile() {
    //
  }

  logout() {
    console.log('Logging out user');
    this.auth.logout().subscribe();
  }

  changePassword() {
    const user = this.auth.user$.value;
    const formParameter: FormParameters = {
      title: 'Change Password',
      fieldsClass: 'grid grid-cols-1 gap-4',
      fields: [
        {
          key: 'previousPassword',
          label: 'Current Password',
          type: FieldType.input,
          inputType: 'password',
          class: 'col-span-full pt-1',
          placeholder: 'Enter current password',
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'newPassword',
          label: 'New Password',
          type: FieldType.input,
          inputType: 'password',
          class: 'col-span-full pt-1',
          placeholder: 'Enter new password',
          hint: 'At least 8 characters with uppercase, lowercase, number and special character',
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
          onChange: (value: any, form: any) => {
            form?.get('confirmPassword')?.updateValueAndValidity();
          },
        },
        {
          key: 'confirmPassword',
          label: 'Confirm New Password',
          type: FieldType.input,
          inputType: 'password',
          class: 'col-span-full',
          placeholder: 'Re-enter new password',
          validations: [
            VALIDATOR_REQUIRED,
            {
              name: 'passwordMatch',
              validator: (control: any) => {
                const newPassword = control.parent?.get('newPassword')?.value;
                return newPassword === control.value ? null : { passwordMatch: true };
              },
              message: 'Passwords do not match',
            },
          ],
        },
      ],
      onSubmit: async (value: any) => {
        await this.fs.fetch({
          notify: true,
          variables: {
            uid: user?.uid,
            changePasswordDto: {
              previousPassword: value.previousPassword,
              newPassword: value.newPassword,
              confirmPassword: value.confirmPassword,
            },
          },
          mutation: CHANGE_PASSWORD,
        });
      },
    };

    this.vs?.openModal(FormComponent, formParameter, '96%');
  }
}

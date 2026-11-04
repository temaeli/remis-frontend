import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { LocalStorageService } from '@core/settings/local-storage.service';
import { SettingsService } from '@core/settings/settings.service';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { AuthService } from '../auth.service';
import { AppVariablesPipe } from '../../../core/settings/app-variables.pipe';
import { FetchService } from '@shared/fetch/fetch.service';
import { LoginCredentials, User } from '../auth.interface';
import { Subscription } from 'rxjs';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'app-login',
  imports: [FormComponent, MatIconModule, RouterLink, MatDividerModule, AppVariablesPipe],

  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy {
  errorMessage: string | null = null;
  private router = inject(Router);
  private storage = inject(LocalStorageService);
  private auth = inject(AuthService);
  private subs = new Subscription();

  st = inject(SettingsService);
  fs = inject(FetchService);

  currentYear = new Date().getFullYear();
  animation = settings$.value.animations?.auth;

  headerButtons: ActionButton[] = [
    {
      label: 'Home',
      class: 'bg-primary text-white_  hover:bg-gray-100',
      click: () => this.router.navigate(['/']),
      visible: !this.router.url.includes('home'),
    },
  ];

  formConfig: FormParameters = {
    fields: [
      {
        key: 'username',
        label: 'Email',
        type: FieldType.input,
        icon: 'person',
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'password',
        label: 'Password',
        type: FieldType.input,
        inputType: 'password',
        icon: 'lock',
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'submit',
        type: FieldType.submit,
        label: 'Login',
        inputClass: 'submit-button',
      },
    ],
    fieldsClass: 'grid grid-cols-1 xl:grid-cols-1 gap-4',
    onSubmit: (data) => this.login(data),
  };

  login(value: LoginCredentials): void {
    const payload: LoginCredentials = {
      username: value.username,
      password: value.password,
      rememberMe: value.rememberMe,
    };

    this.errorMessage = null;
    this.fs.fetch({
      loadingOn: 'submit-button',
      fetchFn: () => this.auth.login(payload),
      successFn: (user: any) => {
        this.redirectUser(user);
      },
      failedFn: (err: any) => {
        console.error('[Login] Failed:', err);
        this.handleLoginError(err);
      },
    });
  }

  private handleLoginError(err: any): void {
    // Try to extract OAuth error message
    const msg = err?.error?.error_description || err?.error?.error || 'Login failed';
    this.errorMessage = msg;
  }

  /** Staff to their modules, external users (isStaff === false) to their portal. */
  private redirectUser(user: User): void {
    if (user?.isStaff === true) {
      this.router.navigateByUrl('/staff-landing');
    } else if (user?.isStaff === false) {
      this.router.navigateByUrl('/portal');
    } else {
      // Type unknown: home, whose guard sends an external user on to the portal.
      this.router.navigateByUrl('/home');
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { registerFp } from './register.form';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { NotificationService } from '@shared/services/notification.service';
import { settings$ } from '@core/settings/settings.store';
import { RegistrationDetails, RegistrationService } from './registration.service';

/**
 * Step one of registering yourself: who you are and the password you want.
 * Submitting sends a code to the email and the mobile number given; the account
 * is created on the next screen, once that code is entered.
 */
@Component({
  selector: 'app-register',
  imports: [RouterLink, FormComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class RegisterComponent {
  private readonly registration = inject(RegistrationService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  animation = settings$.value.animations?.auth;

  fp: FormParameters = {
    ...registerFp,
    onSubmit: async (value: RegistrationDetails): Promise<void> => {
      const saveBtn = [...(this.fp?.fields ?? [])]?.pop();
      saveBtn?.isSaving$?.next(true);

      const answer = await this.registration.requestCode(value);
      saveBtn?.isSaving$?.next(false);

      if (!answer.ok) {
        this.notify.error(answer.message);
        return;
      }
      this.notify.success(answer.message);
      this.router.navigate(['auth', 'register', 'otp']);
    },
  };
}

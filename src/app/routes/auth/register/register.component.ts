import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { registerFp } from './register.form';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FetchService } from '@shared/fetch/fetch.service';
import { NotificationService } from '@shared/services/notification.service';
import { AuthService } from '../auth.service';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
    FormComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class RegisterComponent {
  auth = inject(AuthService);
  notify = inject(NotificationService);
  router = inject(Router);
  fs = inject(FetchService);

  animation = settings$.value.animations?.auth;

  fp: FormParameters = {
    ...registerFp,
    onSubmit: async (value: any): Promise<any> => {
      const saveBtn = [...(this.fp?.fields ?? [])]?.pop();
      saveBtn?.isSaving$?.next(true);

      ['phoneNumber', 'nationalId'].forEach((x) => localStorage.setItem(x, value[x])); // for otp
      this.notify.success('Registration Success, Verify the OTP sent to your Email');
      this.router.navigate(['auth', 'register', 'otp']);

      saveBtn?.isSaving$?.next(false);
    },
  };
}

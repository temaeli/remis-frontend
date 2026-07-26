import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs';
import { LoadingDirective } from '@core/loading/loader.directive';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { getResetFp } from './reset.form';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { NotificationService } from '@shared/services/notification.service';
import { AuthService } from '../../auth.service';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LoadingDirective,
    FormComponent,
  ],
  templateUrl: './reset.component.html',
})
export class ResetComponent implements OnInit {
  auth = inject(AuthService);
  notify = inject(NotificationService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  token?: string = undefined;
  loading = false;
  fp!: FormParameters;

  animation = settings$.value.animations?.auth;

  ngOnInit(): void {
    this.token = this.route?.snapshot?.paramMap?.get('token') ?? undefined;
    this.setForm();
  }

  setForm() {
    console.log('token', this.token);

    this.fp = {
      ...getResetFp(this.token),

      onSubmit: (value) => {
        const saveBtn = [...(this.fp?.fields ?? [])]?.pop();
        saveBtn?.isSaving$?.next(true);
        let sub = !!this.token ? this.requestConfirm(value, this.token) : this.requestReset(value);
        sub.add(() => saveBtn?.isSaving$?.next(false));
      },
    };
  }

  requestReset({ email }: any) {
    return this.auth
      .resetRequest({ email })
      .pipe(take(1))
      .subscribe({
        next: (res: any): any => {
          if (res?.code === 200) {
            this.notify.success('Request Granted, follow the link Sent to your email');
            this.router.navigate(['/']);
          } else this.notify.error(res.message ?? 'Error');
        },
        error: (err) => this.notify.error(err?.error?.message ?? err?.message),
      });
  }

  requestConfirm(value: any, token: string) {
    return this.auth
      .resetConfirm(value, token)
      .pipe(take(1))
      .subscribe({
        next: (res: any): any => {
          if (res?.code === 200) {
            this.notify.success('Password Reset Success, Login in with new Credentials');
            this.router.navigate(['auth', 'login']);
          } else this.notify.error(res.message ?? 'Error');
        },
        error: (err) => this.notify.error(err?.error?.message ?? err?.message),
      });
  }
}

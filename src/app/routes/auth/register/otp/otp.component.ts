import { Component, ElementRef, inject, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { LoadingDirective } from '@core/loading/loader.directive';
import { NotificationService } from '@shared/services/notification.service';
import { AuthService } from '../../auth.service';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LoadingDirective,
  ],
  templateUrl: './otp.component.html',
})
export class OtpComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  notify = inject(NotificationService);
  router = inject(Router);

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  animation = settings$.value.animations?.auth;

  otpControls = Array.from(
    { length: 6 },
    () => new FormControl('', [Validators.required, Validators.pattern(/^[0-9]$/)]),
  );

  form = this.fb.group({
    nationalId: [localStorage.getItem('nationalId'), [Validators.required]],
    phoneNumber: [
      localStorage.getItem('phoneNumber'),
      [Validators.required, Validators.pattern(/^\d{9,15}$/)],
    ],
  });

  isRequesting = false;
  loading = false;

  invalid(field: string) {
    const f = this.form.get(field);
    return f && f.invalid && (f.dirty || f.touched);
  }

  get otpInvalid() {
    return this.otpControls.some((c) => c.invalid);
  }

  // Auto focus next
  onOtpInput(i: number) {
    const input = this.otpInputs.toArray()[i].nativeElement;

    if (input.value.length === 1) {
      if (i < this.otpControls.length - 1) this.otpInputs.toArray()[i + 1].nativeElement.focus();
    }
  }

  // Backspace auto-jump back
  onOtpKey(event: KeyboardEvent, i: number) {
    const input = this.otpControls[i];

    if (event.key === 'Backspace' && !input.value && i > 0) {
      this.otpInputs.toArray()[i - 1].nativeElement.focus();
    }
  }

  getOtpString() {
    return this.otpControls.map((c) => c.value).join('');
  }

  submit() {
    // if (this.isRequesting && this.form.invalid) return this.form.markAllAsTouched();
    // else if (!this.isRequesting && this.otpInvalid) {
    //   return this.otpControls.forEach((c) => c.markAsTouched());
    // }
    // let sub;
    // this.loading = true;
    // if (this.isRequesting) sub = this.requestOtp({ ...this.form.value });
    // else sub = this.verifyOtp({ otp: this.getOtpString() });
    // sub.add(() => (this.loading = false));
  }

  verifyOtp(value: any) {
    // return this.auth
    //   .verifyUserOTP({ ...value, otpId: localStorage.getItem('otpId') })
    //   .pipe(take(1))
    //   .subscribe({
    //     next: (res): any => {
    //       if (!res.success) return this.notify.error(res.message ?? 'Error');
    //       this.notify.success('Registration Success, Go to Login');
    //       ['phoneNumber', 'nationalId'].forEach((x) => localStorage.removeItem(x));
    //       localStorage.removeItem('otpId');
    //       this.router.navigate(['auth', 'login']);
    //     },
    //     error: (err) => this.notify.error(err?.error?.message ?? err?.message),
    //   });
  }

  requestOtp(value: any) {
    // return this.auth
    //   .requestOTP(value)
    //   .pipe(take(1))
    //   .subscribe({
    //     next: (res): any => {
    //       if (!res.success) return this.notify.error(res.message ?? 'Error');
    //       this.notify.success('OTP Request Success, Verify the OTP sent to your Email');
    //       ['phoneNumber', 'nationalId'].forEach((x) => localStorage.setItem(x, value[x])); // for otp
    //       if (!localStorage.getItem('otpId') && res?.data?.otp?.id) {
    //         localStorage.setItem('otpId', res?.data?.otp?.id);
    //       }
    //       this.isRequesting = false;
    //     },
    //     error: (err) => this.notify.error(err?.error?.message ?? err?.message),
    //   });
  }
}

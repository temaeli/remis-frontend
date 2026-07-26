import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  OnInit,
  ElementRef,
  QueryList,
  ViewChildren,
  Directive,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, NgControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take, interval, takeWhile } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SelfRegistrationService, LocationOption } from './self-registration.service';
import { SelfRegistrationStore } from './self-registration.store';
import { settings$ } from '@core/settings/settings.store';
import { NotificationService } from '@shared/services/notification.service';

/**
 * Directive for Tanzania phone number formatting (07XXXXXXXX)
 * Auto-formats input to show formatted phone number while maintaining raw value
 */
@Directive({
  selector: '[appPhoneFormat]',
  standalone: true,
})
export class PhoneFormatDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length === 0) return;

    // If user entered 9 digits starting with 7, add leading 0
    if (value.length === 9 && value.startsWith('7')) {
      value = '0' + value;
    }
    // If user entered digits without leading 0, add it
    else if (value.length === 9 && !value.startsWith('0')) {
      value = '0' + value;
    }
    // If user entered 10 digits but doesn't start with 0, assume they started with 7
    else if (value.length === 10 && !value.startsWith('0')) {
      value = '0' + value.slice(1);
    }
    // Keep only first 10 digits
    else if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Ensure it starts with 07
    if (!value.startsWith('07')) {
      value = '07' + value.slice(2);
    }

    // Update the form control and input
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(value, { emitEvent: false });
    }
    input.value = value;
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
      input.value = value;
    }
  }
}

@Component({
  selector: 'app-self-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
    PhoneFormatDirective,
  ],
  templateUrl: './self-registration.component.html',
  styleUrl: './self-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class SelfRegistrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private srService = inject(SelfRegistrationService);
  private store = inject(SelfRegistrationStore);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private notify = inject(NotificationService);

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  // Animation support (like RegisterComponent)
  animation = settings$.value.animations?.auth;

  // Forms
  step1Form: FormGroup | null = null;
  step3Form: FormGroup | null = null;
  step4Form: FormGroup | null = null;

  // OTP inputs array (6 separate controls - no validators, validation handled in component)
  otpControls = Array.from(
    { length: 6 },
    () => new FormControl(''),
  );

  // Step2Form containing the OTP controls
  step2Form = new FormGroup({
    otp0: this.otpControls[0],
    otp1: this.otpControls[1],
    otp2: this.otpControls[2],
    otp3: this.otpControls[3],
    otp4: this.otpControls[4],
    otp5: this.otpControls[5],
  });

  // State signals
  currentStep = signal<number>(1);
  isSubmitting = signal(false);

  // OTP state
  expiresInSeconds = signal(600);
  otpCountdown = signal(0);
  attemptsLeft = signal<number | undefined>(undefined);
  canResendOtp = signal(false);
  resendCountdown = signal(0);


  applicationReference = computed(() => this.store.applicationReference());
  approvalStatus = computed(() => this.store.approvalStatus());

  // Cascading location dropdowns (public /public/locations/** lookups)
  regions = signal<LocationOption[]>([]);
  districts = signal<LocationOption[]>([]);
  wards = signal<LocationOption[]>([]);
  villages = signal<LocationOption[]>([]);

  constructor() {
    // Scroll the step card into view whenever the active step changes,
    // so fields at the top of a taller step (e.g. First Name in Step 3)
    // aren't left above the scrolled viewport.
    effect(() => {
      this.currentStep();
      this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  ngOnInit() {
    this.initForms();
    this.setupPhoneFormatting();
    this.setupUserTypeSync();
    this.loadRegions();
  }

  // Keeps identificationType + validators for lastName/idNumber/tin in sync with
  // the (backend-agnostic) userType selection: INDIVIDUAL -> NIDA, COMPANY -> TIN.
  private setupUserTypeSync() {
    const userTypeControl = this.step3Form?.get('userType');
    userTypeControl?.valueChanges.subscribe((userType) => this.applyUserTypeValidators(userType));
    this.applyUserTypeValidators(userTypeControl?.value);
  }

  private applyUserTypeValidators(userType: string | null | undefined) {
    if (!this.step3Form) return;

    const lastName = this.step3Form.get('lastName');
    const idNumber = this.step3Form.get('idNumber');
    const tin = this.step3Form.get('tin');
    const identificationType = this.step3Form.get('identificationType');

    if (userType === 'COMPANY') {
      lastName?.clearValidators();
      lastName?.setValue('', { emitEvent: false });
      idNumber?.clearValidators();
      idNumber?.setValue('', { emitEvent: false });
      tin?.setValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
      identificationType?.setValue('BUSINESS_REGISTRATION', { emitEvent: false });
    } else {
      lastName?.setValidators([Validators.required]);
      idNumber?.setValidators([Validators.required, Validators.pattern(/^\d{20}$/)]);
      tin?.clearValidators();
      tin?.setValue('', { emitEvent: false });
      identificationType?.setValue('NATIONAL_ID', { emitEvent: false });
    }

    lastName?.updateValueAndValidity({ emitEvent: false });
    idNumber?.updateValueAndValidity({ emitEvent: false });
    tin?.updateValueAndValidity({ emitEvent: false });
  }

  private setupPhoneFormatting() {
    // Auto-format phone number on value changes
    if (this.step1Form) {
      this.step1Form.get('phone')?.valueChanges.subscribe((value) => {
        if (value) {
          let cleaned = value.replace(/\D/g, ''); // Remove non-digits

          // Auto-add leading 0 if user enters 9 digits starting with 7
          if (cleaned.length === 9 && cleaned.startsWith('7')) {
            cleaned = '0' + cleaned;
            this.step1Form?.get('phone')?.setValue(cleaned, { emitEvent: false });
          }
          // Auto-add leading 0 if user enters digits not starting with 0
          else if (cleaned.length > 0 && !cleaned.startsWith('0') && cleaned.startsWith('7')) {
            cleaned = '0' + cleaned.slice(1);
            this.step1Form?.get('phone')?.setValue(cleaned, { emitEvent: false });
          }
        }
      });
    }
  }

  private initForms() {
    this.step1Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^07\d{8}$/), // Tanzania format
        ],
      ],
    });

    this.step3Form = this.fb.group({
      // Local UI-only field, drives which ID field is shown; not sent to the backend.
      userType: ['INDIVIDUAL', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      identificationType: ['NATIONAL_ID'],
      idNumber: ['', [Validators.required, Validators.pattern(/^\d{20}$/)]],
      tin: [''],
      regionUid: [''],
      districtUid: [''],
      wardUid: [''],
      subWardUid: [''],
      physicalAddress: [''],
      defaultDailyUsageMmscfd: [null],
      consent: [false, Validators.required],
    });

    this.step4Form = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordValidator(),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator(),
      },
    );
  }

  private passwordValidator() {
    return (control: FormControl) => {
      const value = control.value;
      if (!value) return null;

      const errors: Record<string, boolean> = {};

      if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
      if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
      if (!/\d/.test(value)) errors['noNumber'] = true;
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) errors['noSpecial'] = true;

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  private passwordMatchValidator() {
    return (group: FormGroup) => {
      const password = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;

      if (password && confirm && password !== confirm) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  // OTP input handling (like OtpComponent)
  onOtpInput(i: number) {
    const input = this.otpInputs.toArray()[i]?.nativeElement;
    if (!input) return;

    // Only allow digits and limit to 1
    let value = input.value.replace(/[^0-9]/g, '');
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Update both the input and form control
    this.otpControls[i].setValue(value, { emitEvent: false });
    input.value = value;

    // Auto-focus to next input if digit entered
    if (value.length === 1 && i < this.otpControls.length - 1) {
      const nextInput = this.otpInputs.toArray()[i + 1]?.nativeElement;
      if (nextInput) {
        setTimeout(() => nextInput.focus(), 0);
      }
    }
  }

  onOtpKey(event: KeyboardEvent, i: number) {
    const input = this.otpControls[i];
    if (event.key === 'Backspace' && !input.value && i > 0) {
      this.otpInputs.toArray()[i - 1].nativeElement.focus();
    }
  }

  getOtpString() {
    return this.otpControls.map((c) => c.value).join('');
  }

  private clearOtpInputs() {
    this.otpControls.forEach((control, i) => {
      control.setValue('', { emitEvent: false });
      const input = this.otpInputs?.toArray()[i]?.nativeElement;
      if (input) input.value = '';
    });
    const firstInput = this.otpInputs?.toArray()[0]?.nativeElement;
    if (firstInput) firstInput.focus();
  }

  private loadRegions() {
    this.srService
      .getRegions()
      .pipe(take(1))
      .subscribe({
        next: (regions) => this.regions.set(regions ?? []),
        error: () => this.regions.set([]),
      });
  }

  onRegionChange(regionUid: string) {
    this.districts.set([]);
    this.wards.set([]);
    this.villages.set([]);
    this.step3Form?.patchValue(
      { districtUid: '', wardUid: '', subWardUid: '' },
      { emitEvent: false },
    );
    if (!regionUid) return;
    this.srService
      .getDistricts(regionUid)
      .pipe(take(1))
      .subscribe({
        next: (districts) => this.districts.set(districts ?? []),
        error: () => this.districts.set([]),
      });
  }

  onDistrictChange(districtUid: string) {
    this.wards.set([]);
    this.villages.set([]);
    this.step3Form?.patchValue({ wardUid: '', subWardUid: '' }, { emitEvent: false });
    if (!districtUid) return;
    this.srService
      .getWards(districtUid)
      .pipe(take(1))
      .subscribe({
        next: (wards) => this.wards.set(wards ?? []),
        error: () => this.wards.set([]),
      });
  }

  onWardChange(wardUid: string) {
    this.villages.set([]);
    this.step3Form?.patchValue({ subWardUid: '' }, { emitEvent: false });
    if (!wardUid) return;
    this.srService
      .getVillages(wardUid)
      .pipe(take(1))
      .subscribe({
        next: (villages) => this.villages.set(villages ?? []),
        error: () => this.villages.set([]),
      });
  }

  submitStep1() {
    if (this.step1Form?.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.step1Form?.value;

    this.srService
      .requestRegistrationOtp(payload)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.store.setStep1({
              email: payload.email,
              phone: payload.phone,
              expiresInSeconds: res.data.expiresInSeconds,
            });
            this.expiresInSeconds.set(res.data.expiresInSeconds);
            this.otpCountdown.set(res.data.expiresInSeconds);
            this.resendCountdown.set(60);
            this.currentStep.set(2);
            this.notify.success(res.message);
            // Start countdown timers
            this.startOtpCountdownTimer();
            this.startResendCountdownTimer();
          } else {
            this.notify.error(res.message);
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.notify.error(err?.error?.message || 'Failed to request OTP');
          this.isSubmitting.set(false);
        },
      });
  }

  submitStep2() {
    const otp = this.getOtpString();
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      this.notify.error('Please enter all 6 OTP digits');
      return;
    }

    this.isSubmitting.set(true);
    const email = this.step1Form?.get('email')?.value;
    const code = this.getOtpString();

    this.srService
      .verifyRegistrationOtp({ email, code })
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.store.setStep2({
              email,
              code,
              otpToken: res.data.otpToken,
            });
            this.currentStep.set(3);
            this.notify.success('OTP verified successfully');
          } else {
            this.notify.error(res.message);
            if (res.message?.includes('attempt')) {
              // Extract attempts count if available
              const match = res.message.match(/\d+/);
              if (match) this.attemptsLeft.set(parseInt(match[0]));
            }
            this.clearOtpInputs();
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.notify.error(err?.error?.message || 'Failed to verify OTP');
          this.clearOtpInputs();
          this.isSubmitting.set(false);
        },
      });
  }

  submitStep3() {
    if (this.step3Form?.invalid) {
      this.step3Form.markAllAsTouched();
      return;
    }

    const otpToken = this.store.getOtpToken();
    if (!otpToken) {
      this.notify.error('OTP verification required. Please complete Step 2 first.');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.step3Form?.value;
    const email = this.step1Form?.get('email')?.value;
    const phone = this.step1Form?.get('phone')?.value;

    // Only send fields expected by backend
    const payload = {
      email,
      phone,
      firstName: formValue.firstName,
      lastName: formValue.lastName || undefined,
      identificationType: formValue.identificationType || undefined,
      idNumber: formValue.idNumber || undefined,
      tin: formValue.tin || undefined,
      regionUid: formValue.regionUid || undefined,
      districtUid: formValue.districtUid || undefined,
      wardUid: formValue.wardUid || undefined,
      subWardUid: formValue.subWardUid || undefined,
      physicalAddress: formValue.physicalAddress || undefined,
      defaultDailyUsageMmscfd: formValue.defaultDailyUsageMmscfd || undefined,
      consent: formValue.consent,
      otpToken,
      clientStreamType: 'DOWN' as const, // Must be DOWN
    };

    this.srService
      .selfRegister(payload)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.store.setRegistrationResponse({
              applicationReference: res.data.applicationReference,
              approvalStatus: res.data.approvalStatus,
              passwordSetupToken: res.data.passwordSetupToken,
            });
            this.currentStep.set(4);
            this.notify.success(res.message);
          } else {
            this.notify.error(res.message);
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.notify.error(err?.error?.message || 'Failed to submit registration');
          this.isSubmitting.set(false);
        },
      });
  }

  submitStep4() {
    if (this.step4Form?.invalid) {
      this.step4Form.markAllAsTouched();
      return;
    }

    const token = this.store.getPasswordSetupToken();
    if (!token) {
      this.notify.error('Session expired. Please start over.');
      return;
    }

    this.isSubmitting.set(true);
    const { password, confirmPassword } = this.step4Form?.value;

    this.srService
      .setPassword({ token, password, confirmPassword })
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.currentStep.set(5);
            this.notify.success(res.message);
            // Auto redirect to login after 3 seconds
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 3000);
          } else {
            this.notify.error(res.message);
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.notify.error(err?.error?.message || 'Failed to set password');
          this.isSubmitting.set(false);
        },
      });
  }

  resendOtp() {
    this.submitStep1();
    this.resendCountdown.set(300); // 5-minute cooldown
  }

  goBack() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  private startOtpCountdownTimer() {
    interval(1000)
      .pipe(
        takeWhile(() => this.otpCountdown() > 0),
      )
      .subscribe(() => {
        this.otpCountdown.update((v) => Math.max(0, v - 1));
      });
  }

  private startResendCountdownTimer() {
    interval(1000)
      .pipe(
        takeWhile(() => this.resendCountdown() > 0),
      )
      .subscribe(() => {
        this.resendCountdown.update((v) => Math.max(0, v - 1));
        this.canResendOtp.set(this.resendCountdown() === 0);
      });
  }

  formatCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

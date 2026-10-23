import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { settings$ } from '@core/settings/settings.store';
import { VALIDATOR_PERSON_EMAIL } from '@shared/components/generic-form/form-constants';
import { NotificationService } from '@shared/services/notification.service';
import { RegistrationService } from './registration.service';

/** The special characters the password rule accepts — and the only ones it does. */
const SPECIALS = '@$!%*?&';

/** Tanzania's country code, which every mobile number here starts with. */
const COUNTRY_CODE = '255';

/**
 * A Tanzanian mobile in full international form: 255, then nine digits, the
 * first 6, 7 or 8. The backend accepts the same range, 255600000000 to
 * 255899999999.
 */
const MOBILE_PATTERN = /^255[678]\d{8}$/;

/** One rule of the password, shown as a line of the checklist. */
interface PasswordRule {
  label: string;
  met: (value: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', met: (v) => v.length >= 8 },
  { label: 'Uppercase (A–Z)', met: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase (a–z)', met: (v) => /[a-z]/.test(v) },
  { label: 'Number (0–9)', met: (v) => /\d/.test(v) },
  { label: `One of ${SPECIALS.split('').join(' ')}`, met: (v) => /[@$!%*?&]/.test(v) },
];

/** Characters outside letters, digits and the accepted specials, which the rule refuses. */
const NOT_ALLOWED = /[^A-Za-z\d@$!%*?&]/;

/** The backend's rule, unchanged: VALIDATOR_STRONG_PASSWORD. */
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/** How strong a password reads, for the bar under it. */
interface Strength {
  /** Segments lit, 0 to 4. */
  level: number;
  label: string;
  tone: 'none' | 'weak' | 'fair' | 'good' | 'strong';
}

/**
 * Only a password the rule accepts can read Good or Strong: one that misses a
 * rule tops out at Fair, so the bar never shows green for something the form
 * will refuse.
 */
const strengthOf = (value: string): Strength => {
  if (!value) return { level: 0, label: '', tone: 'none' };
  const met = PASSWORD_RULES.filter((rule) => rule.met(value)).length;
  if (NOT_ALLOWED.test(value) || met <= 2) return { level: 1, label: 'Weak', tone: 'weak' };
  if (met < PASSWORD_RULES.length) return { level: 2, label: 'Fair', tone: 'fair' };
  return value.length >= 12
    ? { level: 4, label: 'Strong', tone: 'strong' }
    : { level: 3, label: 'Good — 12 or more characters makes it strong', tone: 'good' };
};

/** The two password fields must agree; the error sits on the group. */
const passwordsMatch = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
};

/**
 * Step one of registering yourself: who you are and the password you want.
 * Submitting sends a code to the email and the mobile number given; the account
 * is created on the next screen, once that code is entered.
 *
 * A frosted card, sized to fit one laptop screen, and the password shows how
 * strong it is as it is typed, against the same rule the backend holds it to.
 */
@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class RegisterComponent {
  private readonly registration = inject(RegistrationService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly animation = settings$.value.animations?.auth;
  readonly rules = PASSWORD_RULES;
  readonly specials = SPECIALS;

  readonly sending = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      secondName: ['', [Validators.required, Validators.maxLength(100)]],
      thirdName: ['', [Validators.required, Validators.maxLength(100)]],
      // Required, and chosen: no answer is picked for them.
      gender: this.fb.control<'MALE' | 'FEMALE' | null>(null, Validators.required),
      email: ['', [Validators.required, VALIDATOR_PERSON_EMAIL.validator]],
      // Opens with the country code in place, so only the nine digits are typed.
      mobileNumber: [COUNTRY_CODE, [Validators.required, Validators.pattern(MOBILE_PATTERN)]],
      password: ['', [Validators.required, Validators.pattern(STRONG_PASSWORD)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  private readonly password = toSignal(this.form.controls.password.valueChanges, {
    initialValue: '',
  });
  private readonly confirm = toSignal(this.form.controls.confirmPassword.valueChanges, {
    initialValue: '',
  });

  readonly strength = computed(() => strengthOf(this.password()));
  readonly ruleStates = computed(() =>
    PASSWORD_RULES.map((rule) => ({ label: rule.label, met: rule.met(this.password()) })),
  );
  readonly hasDisallowed = computed(() => NOT_ALLOWED.test(this.password()));
  readonly confirmState = computed<'empty' | 'match' | 'mismatch'>(() => {
    if (!this.confirm()) return 'empty';
    return this.confirm() === this.password() ? 'match' : 'mismatch';
  });

  /**
   * Keeps the mobile in the 255 form while it is typed: only digits, always
   * starting 255, at most twelve. A number typed or pasted the local way, with
   * a leading 0, has the 0 replaced by 255; one that starts 255 is left alone.
   * Deleting into the code puts it back, so the field is never without it.
   */
  formatMobile(event: Event): void {
    const box = event.target as HTMLInputElement;
    let digits = box.value.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = COUNTRY_CODE + digits.slice(1);
    else if (!digits.startsWith(COUNTRY_CODE))
      digits = COUNTRY_CODE + digits.replace(/^2?5?5?/, '');
    const formatted = digits.slice(0, 12);
    box.value = formatted;
    this.form.controls.mobileNumber.setValue(formatted);
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.sending()) {
      this.form.markAllAsTouched();
      return;
    }
    const { confirmPassword: _confirm, gender, ...details } = this.form.getRawValue();
    if (!gender) return;

    this.sending.set(true);
    const answer = await this.registration.requestCode({
      ...details,
      gender,
      firstName: details.firstName.trim(),
      secondName: details.secondName.trim(),
      thirdName: details.thirdName.trim(),
      email: details.email.trim(),
      mobileNumber: details.mobileNumber.trim(),
    });
    this.sending.set(false);

    if (!answer.ok) {
      this.notify.error(answer.message);
      return;
    }
    this.notify.success(answer.message);
    this.router.navigate(['auth', 'register', 'otp']);
  }
}

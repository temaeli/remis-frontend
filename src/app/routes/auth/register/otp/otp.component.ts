import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { LoadingDirective } from '@core/loading/loader.directive';
import { NotificationService } from '@shared/services/notification.service';
import { settings$ } from '@core/settings/settings.store';
import { RegistrationService } from '../registration.service';

const CODE_LENGTH = 6;

/**
 * Step two of registering yourself: the code that was sent to the email and the
 * mobile number given on the form. A correct code creates the account and
 * leads to the sign-in screen.
 *
 * Opened with nothing waiting on a code -- by a reload, or straight from a link
 * -- it says so and points back to the form, since what was typed there is
 * kept in memory only.
 */
@Component({
  selector: 'app-otp',
  imports: [MatButtonModule, LoadingDirective, RouterLink],
  templateUrl: './otp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpComponent {
  private readonly registration = inject(RegistrationService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  private readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('otpInput');

  animation = settings$.value.animations?.auth;

  readonly pending = this.registration.pending;
  readonly positions = Array.from({ length: CODE_LENGTH }, (_, i) => i);

  readonly digits = signal<string[]>(Array(CODE_LENGTH).fill(''));
  readonly code = computed(() => this.digits().join(''));
  readonly complete = computed(() => /^\d{6}$/.test(this.code()));

  readonly verifying = signal(false);
  readonly resending = signal(false);
  readonly failure = signal('');

  /** Keeps one digit in the box and moves on to the next. */
  onInput(index: number, event: Event): void {
    const box = event.target as HTMLInputElement;
    const digit = box.value.replace(/\D/g, '').slice(-1);
    box.value = digit;
    this.digits.update((all) => all.map((old, i) => (i === index ? digit : old)));
    if (digit && index < CODE_LENGTH - 1) this.focus(index + 1);
  }

  /** Backspace in an empty box steps back to the one before. */
  onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) this.focus(index - 1);
  }

  /** A code pasted from the message fills every box at once. */
  onPaste(event: ClipboardEvent): void {
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    if (!pasted) return;
    event.preventDefault();
    const filled = this.positions.map((i) => pasted[i] ?? '');
    this.digits.set(filled);
    this.boxes().forEach((box, i) => (box.nativeElement.value = filled[i]));
    this.focus(Math.min(pasted.length, CODE_LENGTH) - 1);
  }

  async submit(): Promise<void> {
    if (!this.complete() || this.verifying()) return;
    this.verifying.set(true);
    this.failure.set('');

    const answer = await this.registration.verifyAndRegister(this.code());
    this.verifying.set(false);

    if (!answer.ok) {
      this.failure.set(answer.message);
      return;
    }
    this.notify.success(answer.message);
    this.router.navigate(['auth', 'login']);
  }

  async resend(): Promise<void> {
    if (this.resending()) return;
    this.resending.set(true);
    this.failure.set('');

    const answer = await this.registration.resendCode();
    this.resending.set(false);

    if (answer.ok) this.notify.success(answer.message);
    else this.failure.set(answer.message);
  }

  private focus(index: number): void {
    this.boxes()[index]?.nativeElement.focus();
  }
}

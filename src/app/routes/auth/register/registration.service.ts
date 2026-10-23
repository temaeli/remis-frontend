import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment as env } from '@env/environment';

/** What someone types to register themselves. Sent as it is to the backend. */
export interface RegistrationDetails {
  firstName: string;
  secondName: string;
  thirdName: string;
  gender: 'MALE' | 'FEMALE';
  email: string;
  mobileNumber: string;
  password: string;
}

/** What every step answers. `token` comes back only from a correct code. */
export interface RegistrationAnswer {
  ok: boolean;
  message: string;
  token?: string | null;
}

interface RegistrationResponse {
  code?: number;
  message?: string;
  token?: string | null;
}

/**
 * Registering yourself on the portal, in the three calls the backend takes it
 * in: ask for a code, verify it, register.
 *
 * What was typed is kept here between the form and the code screen, in memory
 * only. It includes a password, so it is not put in browser storage, and a
 * reload of the code screen sends the person back to the form.
 */
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${env.SERVER_URL}/anonymous/register`;

  private readonly details = signal<RegistrationDetails | null>(null);

  /** What is waiting on a code, or null when nothing is. */
  readonly pending = this.details.asReadonly();

  /** Sends the code to the email and the mobile number given, and remembers what was typed. */
  async requestCode(details: RegistrationDetails): Promise<RegistrationAnswer> {
    const answer = await this.post(`${this.url}/otp`, details);
    if (answer.ok) this.details.set(details);
    return answer;
  }

  /** Sends the code again to whoever is waiting on one. */
  resendCode(): Promise<RegistrationAnswer> {
    const details = this.details();
    if (!details) return Promise.resolve(NOTHING_PENDING);
    return this.post(`${this.url}/otp`, details);
  }

  /**
   * Checks the code and, when it is right, creates the account in the same
   * breath: the token a correct code earns is good for one registration, and
   * there is nothing for the person to do between the two.
   */
  async verifyAndRegister(code: string): Promise<RegistrationAnswer> {
    const details = this.details();
    if (!details) return NOTHING_PENDING;

    const verified = await this.post(`${this.url}/otp/verify`, { email: details.email, code });
    if (!verified.ok || !verified.token) return verified;

    const registered = await this.post(this.url, { ...details, otpToken: verified.token });
    if (registered.ok) this.details.set(null);
    return registered;
  }

  /** Forgets what was typed, password included. */
  clear(): void {
    this.details.set(null);
  }

  private async post(url: string, body: unknown): Promise<RegistrationAnswer> {
    // The page shows its own progress on the button that was pressed.
    const headers = new HttpHeaders({ ngLoader: 'false' });
    try {
      const response = await firstValueFrom(
        this.http.post<RegistrationResponse>(url, body, { headers }),
      );
      return { ok: true, message: response?.message ?? '', token: response?.token };
    } catch (error) {
      // A refusal is a 400 whose body says why, in words meant to be shown.
      const refused = error instanceof HttpErrorResponse ? error.error : undefined;
      return {
        ok: false,
        message:
          (refused as RegistrationResponse | undefined)?.message ??
          'We could not reach the server. Check your connection and try again.',
      };
    }
  }
}

const NOTHING_PENDING: RegistrationAnswer = {
  ok: false,
  message: 'Fill in the registration form first.',
};

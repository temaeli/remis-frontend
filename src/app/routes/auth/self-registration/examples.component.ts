/**
 * Example usage of the self-registration service and store
 *
 * These examples show how to integrate self-registration functionality
 * into other components or services.
 *
 * NOTE: These are example code snippets and should NOT be imported or used directly.
 * They demonstrate patterns and API usage only.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelfRegistrationService } from './self-registration.service';
import { SelfRegistrationStore } from './self-registration.store';
import { NotificationService } from '@shared/services/notification.service';

/**
 * Example 1: Using the service directly
 */
@Component({
  selector: 'app-example-service-usage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="requestOtp()">Request OTP</button>
    <p *ngIf="error">Error: {{ error }}</p>
  `,
})
export class ExampleServiceUsageComponent {
  private srService = inject(SelfRegistrationService);
  private notify = inject(NotificationService);
  error: string | null = null;

  requestOtp() {
    this.srService
      .requestRegistrationOtp({
        email: 'customer@example.com',
        phone: '0712345678',
      })
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.notify.success(`OTP expires in ${response.data.expiresInSeconds}s`);
            this.error = null;
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = err.message;
        },
      });
  }
}

/**
 * Example 2: Using the store to track state
 */
@Component({
  selector: 'app-example-store-usage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h3>Current Step: {{ currentStep() }}</h3>
      <p *ngIf="isOtpVerified()">OTP Verified ✓</p>
      <p *ngIf="applicationRef()">Application: {{ applicationRef() }}</p>
    </div>
  `,
})
export class ExampleStoreUsageComponent {
  private store = inject(SelfRegistrationStore);

  // Computed signals
  currentStep = () => this.store.currentStep();
  isOtpVerified = () => this.store.isOtpVerified();
  applicationRef = () => this.store.applicationReference();

  saveProgress() {
    // Save step 1 data
    this.store.setStep1({
      email: 'user@example.com',
      phone: '0712345678',
      expiresInSeconds: 600,
    });

    // Save step 2 data
    this.store.setStep2({
      email: 'user@example.com',
      code: '123456',
      otpToken: 'token-from-backend',
    });
  }

  resetFlow() {
    this.store.reset();
  }

  resetSpecificStep() {
    this.store.resetStep(2);
  }
}

/**
 * Example 3: Complete registration flow in a custom component
 */
@Component({
  selector: 'app-example-complete-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Step 1 -->
      <div *ngIf="step() === 1">
        <input [(ngModel)]="email" placeholder="Email" />
        <input [(ngModel)]="phone" placeholder="Phone" />
        <button (click)="handleStep1()">Next</button>
      </div>

      <!-- Step 2 -->
      <div *ngIf="step() === 2">
        <input [(ngModel)]="code" placeholder="6-digit code" />
        <button (click)="handleStep2()">Verify</button>
      </div>

      <!-- Step 3 -->
      <div *ngIf="step() === 3">
        <p>Registration saved!</p>
        <p>Reference: {{ store.applicationReference() }}</p>
      </div>
    </div>
  `,
})
export class ExampleCompleteFlowComponent {
  private srService = inject(SelfRegistrationService);
  protected store = inject(SelfRegistrationStore);

  email = '';
  phone = '';
  code = '';
  step = () => this.store.currentStep();

  handleStep1() {
    this.srService
      .requestRegistrationOtp({
        email: this.email,
        phone: this.phone,
      })
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.store.setStep1({
              email: this.email,
              phone: this.phone,
              expiresInSeconds: res.data.expiresInSeconds,
            });
          }
        },
      });
  }

  handleStep2() {
    this.srService
      .verifyRegistrationOtp({
        email: this.email,
        code: this.code,
      })
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.store.setStep2({
              email: this.email,
              code: this.code,
              otpToken: res.data.otpToken,
            });
          }
        },
      });
  }
}

/**
 * Example 4: Using with API error handling
 */
export class ExampleErrorHandlingService {
  private srService = inject(SelfRegistrationService);

  /**
   * Verify OTP with comprehensive error handling
   */
  verifyOtpWithErrorHandling(email: string, code: string) {
    return this.srService.verifyRegistrationOtp({ email, code }).subscribe({
      next: (response) => {
        if (!response.status) {
          // Handle API-level error
          if (response.message?.includes('attempt')) {
            // Extract and show attempts remaining
            console.warn(response.message);
          } else if (response.message?.includes('expired')) {
            // Handle expiration
            console.error('Code expired, restart registration');
          }
        }
      },
      error: (networkError) => {
        // Handle network/HTTP errors
        console.error('Network error:', networkError);
      },
    });
  }
}

/**
 * Example 5: Password validation before submission
 */
export class ExamplePasswordValidationService {
  /**
   * Validate password against policy
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Example usage
   */
  exampleUsage() {
    const result = this.validatePassword('MyP@ss123');
    if (result.valid) {
      console.log('Password is valid');
    } else {
      result.errors.forEach((error) => console.error(error));
    }
  }
}

/**
 * Example 6: Accessing registration status after login
 *
 * NOTE: Simplified example - in real usage, you would properly type the Apollo result
 */
import { Apollo } from 'apollo-angular';
import { GET_MY_CLIENT_STATUS } from './self-registration.graphql';
import { MyClientStatusResponse } from './self-registration.interfaces';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-example-status-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="statusData$ | async as status">
      <h3>Registration Status</h3>
      <p><strong>Reference:</strong> {{ status.applicationReference }}</p>
      <p><strong>Status:</strong> {{ status.approvalStatus }}</p>
      <p>{{ status.statusMessage }}</p>
      <p *ngIf="status.customerId"><strong>Customer ID:</strong> {{ status.customerId }}</p>
    </div>
  `,
})
export class ExampleStatusTrackingComponent {
  private apollo = inject(Apollo);

  // Properly typed observable of MyClientStatusResponse
  statusData$: Observable<MyClientStatusResponse | null> = this.apollo
    .query({ query: GET_MY_CLIENT_STATUS })
    .pipe(map((result: any) => result?.data?.myClientStatus || null));
}

/**
 * Example 7: Programmatic navigation after registration
 */
import { Router } from '@angular/router';

@Component({
  selector: 'app-example-navigation',
  standalone: true,
  template: '',
})
export class ExampleNavigationComponent {
  private router = inject(Router);

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToSelfRegister() {
    this.router.navigate(['/auth/self-register']);
  }

  navigateToSelfRegisterStep(step: number) {
    // Note: The component doesn't support URL-based step navigation
    // This would require modifications to support query params like:
    // this.router.navigate(['/auth/self-register'], { queryParams: { step } });
  }
}

/**
 * Example 8: OTP countdown timer implementation
 */
import { effect, signal } from '@angular/core';
import { interval, takeWhile } from 'rxjs';

@Component({
  selector: 'app-example-countdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p *ngIf="secondsRemaining() > 0">Time remaining: {{ formatTime(secondsRemaining()) }}</p>
    <p *ngIf="secondsRemaining() === 0">OTP has expired</p>
  `,
})
export class ExampleCountdownComponent {
  secondsRemaining = signal(0);

  startCountdown(totalSeconds: number) {
    this.secondsRemaining.set(totalSeconds);

    effect(() => {
      if (this.secondsRemaining() > 0) {
        interval(1000)
          .pipe(takeWhile(() => this.secondsRemaining() > 0))
          .subscribe(() => {
            this.secondsRemaining.update((s) => s - 1);
          });
      }
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

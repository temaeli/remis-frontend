import { Injectable, computed, signal } from '@angular/core';
import {
  RegistrationState,
  SelfRegistrationStep1,
  SelfRegistrationStep2,
  SelfRegistrationStep3,
  SelfRegistrationStep4,
  ApprovalStatus,
} from './self-registration.interfaces';

@Injectable({
  providedIn: 'root',
})
export class SelfRegistrationStore {
  // Main state signal
  private state = signal<RegistrationState>({});

  // Computed signals
  currentStep = computed(() => {
    const s = this.state();
    if (s.step4) return 4;
    if (s.step3) return 3;
    if (s.step2) return 2;
    if (s.step1) return 1;
    return 0;
  });

  isOtpVerified = computed(() => !!this.state().otpToken);
  isStep3Completed = computed(() => !!this.state().step3);
  isStep4Completed = computed(() => !!this.state().passwordSetupToken);
  expiresInSeconds = computed(() => this.state().expiresInSeconds);
  attemptsLeft = computed(() => this.state().attemptsLeft);
  applicationReference = computed(() => this.state().applicationReference);
  approvalStatus = computed(() => this.state().approvalStatus);

  // Public getters
  getState() {
    return this.state();
  }

  getStep1() {
    return this.state().step1;
  }

  getStep2() {
    return this.state().step2;
  }

  getStep3() {
    return this.state().step3;
  }

  getStep4() {
    return this.state().step4;
  }

  getOtpToken() {
    return this.state().otpToken;
  }

  getPasswordSetupToken() {
    return this.state().passwordSetupToken;
  }

  // Update methods
  setStep1(data: SelfRegistrationStep1) {
    this.state.update((s) => ({
      ...s,
      step1: data,
      expiresInSeconds: data.expiresInSeconds,
    }));
  }

  setStep2(data: SelfRegistrationStep2) {
    this.state.update((s) => ({
      ...s,
      step2: data,
      otpToken: data.otpToken,
    }));
  }

  setStep3(data: SelfRegistrationStep3) {
    this.state.update((s) => ({
      ...s,
      step3: data,
    }));
  }

  setStep4(data: SelfRegistrationStep4) {
    this.state.update((s) => ({
      ...s,
      step4: data,
    }));
  }

  setRegistrationResponse(data: {
    applicationReference: string;
    approvalStatus: string;
    passwordSetupToken: string;
  }) {
    this.state.update((s) => ({
      ...s,
      applicationReference: data.applicationReference,
      approvalStatus: data.approvalStatus as ApprovalStatus,
      passwordSetupToken: data.passwordSetupToken,
    }));
  }

  setAttemptsLeft(attempts: number) {
    this.state.update((s) => ({
      ...s,
      attemptsLeft: attempts,
    }));
  }

  setLocked(expiresAt: Date) {
    this.state.update((s) => ({
      ...s,
      isLockedUntil: expiresAt,
    }));
  }

  reset() {
    this.state.set({});
  }

  resetStep(step: 1 | 2 | 3 | 4) {
    this.state.update((s) => {
      const newState = { ...s };
      delete (newState as any)[`step${step}`];
      return newState;
    });
  }
}

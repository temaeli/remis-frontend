/**
 * Self-registration interfaces
 * Based on REQ-028: Customer Self-Registration flow
 */

export type ClientStreamType = 'DOWN' | 'UP';
export type IdentificationType = 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SelfRegistrationStep1 {
  email: string;
  phone: string;
  expiresInSeconds?: number;
}

export interface SelfRegistrationStep2 {
  email: string;
  code: string;
  otpToken?: string;
}

export interface SelfRegistrationStep3 {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  clientStreamType: ClientStreamType;
  tin?: string;
  identificationType?: IdentificationType;
  idNumber?: string;
  subWardUid: string;
  regionUid?: string;
  districtUid?: string;
  wardUid?: string;
  blockNumber?: string;
  postalAddress?: string;
  categoryUids: string[];
  consent: boolean;
  otpToken: string;
}

export interface SelfRegistrationStep4 {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationState {
  step1?: SelfRegistrationStep1;
  step2?: SelfRegistrationStep2;
  step3?: SelfRegistrationStep3;
  step4?: SelfRegistrationStep4;
  applicationReference?: string;
  approvalStatus?: ApprovalStatus;
  passwordSetupToken?: string;
  otpToken?: string;
  expiresInSeconds?: number;
  attemptsLeft?: number;
  isLockedUntil?: Date;
}

export interface CustomerCategory {
  uid: string;
  name: string;
}

export interface Region {
  uid: string;
  name: string;
}

export interface District {
  uid: string;
  name: string;
  region?: Region;
}

export interface Ward {
  uid: string;
  name: string;
  district?: District;
}

export interface SubWard {
  uid: string;
  name: string;
  ward?: Ward;
}

export interface MyClientStatusResponse {
  applicationReference: string;
  approvalStatus: ApprovalStatus;
  customerId?: string;
  approvalComments?: string;
  statusMessage: string;
}

export interface PasswordPolicyError {
  field: string;
  message: string;
}

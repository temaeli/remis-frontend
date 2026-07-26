import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FetchService } from '@shared/fetch/fetch.service';
import { environment as env } from '@env/environment';

export interface RequestOtpPayload {
  email: string;
  phone: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface SelfRegisterPayload {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  clientStreamType: 'DOWN' | 'UP';
  tin?: string;
  identificationType?: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE' | 'BUSINESS_REGISTRATION';
  idNumber?: string;
  regionUid?: string;
  districtUid?: string;
  wardUid?: string;
  subWardUid?: string;
  blockNumber?: string;
  postalAddress?: string;
  physicalAddress?: string;
  defaultDailyUsageMmscfd?: number;
  categoryUids?: string[];
  consent: boolean;
  otpToken: string;
}

export interface LocationOption {
  uid: string;
  name: string;
  code: string;
}

export interface SetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface OtpResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    expiresInSeconds: number;
  };
  requestId: string;
}

export interface VerifyOtpResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    otpToken: string;
  };
  requestId: string;
}

export interface SelfRegisterResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    applicationReference: string;
    approvalStatus: string;
    passwordSetupToken: string;
  };
  requestId: string;
}

export interface SetPasswordResponse {
  status: boolean;
  code: number;
  message: string;
  data?: null;
  requestId: string;
}

export interface ErrorResponse {
  status: false;
  code: number;
  message: string;
  requestId: string;
}

@Injectable({
  providedIn: 'root',
})
export class SelfRegistrationService {
  private http = inject(HttpClient);
  private fs = inject(FetchService);

  private readonly PUBLIC_BASE = `${env.SERVER_URL}/public`;

  /**
   * Step 1: Request OTP for registration
   * POST /public/otp/request-registration
   */
  requestRegistrationOtp(payload: RequestOtpPayload): Observable<OtpResponse | ErrorResponse> {
    return this.http.post<OtpResponse | ErrorResponse>(
      `${this.PUBLIC_BASE}/otp/request-registration`,
      payload,
    );
  }

  /**
   * Step 2: Verify OTP
   * POST /public/otp/verify-registration
   */
  verifyRegistrationOtp(payload: VerifyOtpPayload): Observable<VerifyOtpResponse | ErrorResponse> {
    return this.http.post<VerifyOtpResponse | ErrorResponse>(
      `${this.PUBLIC_BASE}/otp/verify-registration`,
      payload,
    );
  }

  /**
   * Step 3: Submit self-registration form
   * POST /public/clients/self-register
   */
  selfRegister(payload: SelfRegisterPayload): Observable<SelfRegisterResponse | ErrorResponse> {
    return this.http.post<SelfRegisterResponse | ErrorResponse>(
      `${this.PUBLIC_BASE}/clients/self-register`,
      payload,
    );
  }

  /**
   * Step 4: Set password
   * POST /public/clients/set-password
   */
  setPassword(payload: SetPasswordPayload): Observable<SetPasswordResponse | ErrorResponse> {
    return this.http.post<SetPasswordResponse | ErrorResponse>(
      `${this.PUBLIC_BASE}/clients/set-password`,
      payload,
    );
  }

  /**
   * Cascading location lookups for the self-registration form.
   * GET /public/locations/regions|districts|wards|villages
   */
  getRegions(): Observable<LocationOption[]> {
    return this.http.get<LocationOption[]>(`${this.PUBLIC_BASE}/locations/regions`);
  }

  getDistricts(regionUid: string): Observable<LocationOption[]> {
    return this.http.get<LocationOption[]>(`${this.PUBLIC_BASE}/locations/districts`, {
      params: { regionUid },
    });
  }

  getWards(districtUid: string): Observable<LocationOption[]> {
    return this.http.get<LocationOption[]>(`${this.PUBLIC_BASE}/locations/wards`, {
      params: { districtUid },
    });
  }

  getVillages(wardUid: string): Observable<LocationOption[]> {
    return this.http.get<LocationOption[]>(`${this.PUBLIC_BASE}/locations/villages`, {
      params: { wardUid },
    });
  }
}

export interface User {
  [prop: string]: any;

  id?: number | string | null;
  name?: string;
  email?: string;
  avatar?: string;
  roles?: any[];
  permissions?: any[];
  client_id?: string | null;
  clientUid?: string | null;
  uid?: string;
  isStaff?: boolean;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
  nationalId?: string;
  username?: string;
  enabled?: boolean;
  active?: boolean;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  departmentUid?: string | null;
  departmentCode?: string | null;
  departmentName?: string | null;
  clientType?: string | null;
  authMode?: string;
}

export interface Token {
  [prop: string]: any;

  access_token?: string;
  token_type?: string;
  expires_in?: number;
  exp?: number;
  refresh_token?: string;
}

export interface OTPDto {
  nin: string;
  otp?: string;
  phoneNumber: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  data: Token;
  success: boolean;
  message: string;
}

export type SignupDetails = Record<string, any>;

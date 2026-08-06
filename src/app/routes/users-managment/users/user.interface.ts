export interface Permission {
  id?: string;
  name?: string;
}

export interface Role {
  id?: string;
  uid?: string;
  name?: string;
  permissionList?: Permission[];
}

export interface UserRole {
  id?: string;
  role?: Role;
}

export interface UserAccount {
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  authorities?: { authority: string }[];
  credentialsNonExpired?: boolean;
  email?: string;
  enabled?: boolean;
  failedAttempt?: number;
  firstLogin?: boolean;
  lockTime?: string;
  password?: string;
  passwordExpired?: boolean;
  username?: string;
  uid?: string;
  /** Personal data, held on bio_data rather than on the login. May be absent. */
  bioData?: BioData;
  active?: boolean;
  isStaff?: boolean;
  rolesList?: UserRole[];
}

export interface UserDtoInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber?: string;
  nationalId?: string;
  username?: string;
  uid?: string;
  isStaff?: boolean;
  roleUidList: [string];
}

/**
 * The person behind a login. Names are first/second/third rather than
 * first/middle/last, the national ID is `nin`, and the phone number is numeric.
 */
export interface BioData {
  id?: string;
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  nin?: string;
  mobileNumber?: number | string;
  email?: string;
}

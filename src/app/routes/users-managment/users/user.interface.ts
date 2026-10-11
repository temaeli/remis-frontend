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

/**
 * A login, for someone already on the register. Carries no personal data: the
 * person is created and edited through `saveBioData`, and this only says which
 * of them the account belongs to.
 */
export interface UserDtoInput {
  bioDataUid: string;
  email: string;
  uid?: string;
  isStaff?: boolean;
  designationUid?: string;
  roleUidList: [string];
}

/**
 * The person behind a login. Names are first/second/third rather than
 * first/middle/last, and the phone number is numeric.
 */
export interface BioData {
  id?: string;
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  mobileNumber?: number | string;
  email?: string;
}

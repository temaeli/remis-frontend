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
  firstName?: string;
  lastName?: string;
  lockTime?: string;
  middleName?: string;
  password?: string;
  passwordExpired?: boolean;
  username?: string;
  phoneNumber?: string;
  nationalId?: string;
  uid?: string;
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

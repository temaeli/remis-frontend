import { User } from 'app/routes/auth/auth.interface';
import { Plant } from 'app/routes/plants/plants/plant.interface';
import { Pipeline } from '@routes/pipeline-management/pipelines/pipeline.interface';

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
  plants?: UserPlant[];
  pipelines?: UserPipeline[];
}

export interface UserPlant {
  createdAt: string;
  current: boolean;
  id: number;
  plant: Plant;
  user: User;
}

export interface UserPipeline {
  createdAt: string;
  current: boolean;
  id: number;
  pipeline: Pipeline;
  user: User;
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

export enum UserAssignmentType {
  PIPELINE = 'PIPELINE',
  PLANT = 'PLANT',
  DISTRIBUTION = 'DISTRIBUTION',
}

/** Sub-type chosen when UserAssignmentType.DISTRIBUTION is selected. */
export enum DistributionAssignmentType {
  CONSTRUCTION = 'CONSTRUCTION',
  CNG = 'CNG',
}

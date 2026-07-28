import {
  baseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { gql } from 'apollo-angular';

export const userMinimalGqlFields = `
  email
  firstName
  middleName
  lastName
  phoneNumber
  isStaff
  fullName
  uid
`;

export const userGqlFields = `
  accountNonExpired
  accountNonLocked
  authorities{
    authority
  }
  credentialsNonExpired
  email
  enabled
  failedAttempt
  firstLogin
  firstName
  lastName
  lockTime
  middleName
  password
  passwordExpired
  username
  phoneNumber
  nationalId
  isStaff
  rolesList{
   id
   role{
    id
    uid
    name
    permissionList{
     id
     name
    }
   }
  }
  ${baseGqlFields}
`;

export const GET_USER_BY_UID = gql`
  query findUserByUid($uid: String!){
    findUserByUid(uid: $uid){
      ${userGqlFields}
    }
  }
`;

export const LIST_USERS_PAGEABLE = gql`
  query getAllUsersPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllUsersPageable(active: $active, pageableParam: $pageableParam){
     ${pageGqlFields(userGqlFields)}
    }
  }
`;

export const LIST_USERS_PAGEABLE_ = gql`
  query getAllUsersPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllUsersPageable(active: $active, pageableParam: $pageableParam){
     ${pageGqlFields('uid firstName lastName')}
    }
  }
`;

export const CREATE_USER = gql`
  mutation saveUser($userDto: UserDtoInput){
    saveUser(userDto: $userDto){
     ${responseGqlFields(userGqlFields)}
    }
  }
`;

export const ACTIVATE_USER = gql`
  mutation activateUser($uid: String){
    activateUser(uid: $uid){
      ${responseGqlFields(userGqlFields)}
    }
  }
`;

export const UNLOCK_USER = gql`
  mutation unlockUser($uid: String){
    unlockUser(uid: $uid){
      ${responseGqlFields(userGqlFields)}
    }
  }
`;

export const RESET_USER_PWD = gql`
  mutation resetUserPassword($uid: String) {
    resetUserPassword(uid: $uid) {
      ${responseGqlFields(userGqlFields)}
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation changePassword($uid: String!, $changePasswordDto: ChangePasswordDtoInput){
    changePassword(uid:$uid , changePasswordDto:$changePasswordDto){
      ${responseGqlFields(userGqlFields)}
    }
  }
`;

export const ASSIGN_ROLES_TO_USER = gql`
  mutation assignRolesToUser($userRoleListDto: UserRoleListDtoInput, $uid: String) {
    assignRolesToUser(userRoleListDto: $userRoleListDto, uid: $uid) {
           ${responseGqlFields(userGqlFields)}
    }
  }
`;

export const RESET_EMAIL_OR_PHONE = gql`
  mutation resetEmailOrPhone($uid: String,$infoDto: ChangeUserInfoDtoInput) {
    resetEmailOrPhone(uid: $uid,infoDto:$infoDto) {
      ${responseGqlFields(userGqlFields)}
    }
  }
`;

export const EXIST_BY_EMAIL = gql`
  query existByEmail($email: String) {
    existByEmail(email: $email)
  }
`;

export const INVITE_BY_USER_EMAIL = gql`
  mutation inviteUserByEmail($email: String) {
    inviteUserByEmail(email: $email) {
      ${plainResponseGqlFields}
    }
  }
`;

export const MY_PROFILE = gql`
  query myProfile {
    myProfile{
      ${userGqlFields}
    }
  }
`;

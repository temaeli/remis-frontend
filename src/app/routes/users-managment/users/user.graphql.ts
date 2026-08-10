import {
  baseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { gql } from 'apollo-angular';

/**
 * Personal data lives on `bio_data` in remis_core_schema, not on `uaa.users`,
 * which keeps only credentials. The column names differ from the old ones on
 * User: middleName is `secondName`, lastName is `thirdName`, nationalId is
 * `nin` and phoneNumber is `mobileNumber`.
 *
 * Nullable — a login can exist before a person record is attached to it — so
 * always read through it defensively.
 */
export const bioDataGqlFields = `
  bioData {
    id
    firstName
    secondName
    thirdName
    nin
    mobileNumber
    email
    identityType {
      id
      uid: id
      name
    }
  }
`;

export const userMinimalGqlFields = `
  email
  isStaff
  uid
  ${bioDataGqlFields}
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
  lockTime
  password
  passwordExpired
  username
  isStaff
  ${bioDataGqlFields}
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
     ${pageGqlFields(`uid ${bioDataGqlFields}`)}
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

/** Backs the associated-users panel on the designation detail page. */
export const USERS_BY_DESIGNATION_PAGEABLE = gql`
  query usersByDesignationPageable($pageableParam: PageableParamInput, $active: Boolean, $designationUid: String) {
    usersByDesignationPageable(pageableParam: $pageableParam, active: $active, designationUid: $designationUid) {
      ${pageGqlFields(userMinimalGqlFields)}
    }
  }
`;

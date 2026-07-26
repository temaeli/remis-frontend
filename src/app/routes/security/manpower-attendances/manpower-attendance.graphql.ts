import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const manpowerAttendanceFields = `
  date
  remarks
  comment
  submittedAt
  approvedAt
  approvedBy {
    uid
    username
    firstName
    lastName
  }
  rejectedAt
  rejectedBy {
    uid
    username
    firstName
    lastName
  }
  station {
    uid
    name
  }
  manpowerAttended {
    uid
    attended
    totalManHours
    category {
      uid
      name
    }
  }
  createdBy {
    username
  }
  ${baseGqlFields}
`;

export const GET_ALL_MANPOWER_ATTENDANCES = gql`
  query getAllManpowerAttendancesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllManpowerAttendancesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(manpowerAttendanceFields)}
    }
  }
`;

export const GET_MANPOWER_ATTENDANCES_BY_STATION = gql`
  query getManpowerAttendancesBySection($sectionUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getManpowerAttendancesBySection(sectionUid: $sectionUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(manpowerAttendanceFields)}
    }
  }
`;

export const GET_MANPOWER_ATTENDANCE_BY_UID = gql`
  query getManpowerAttendanceByUid($uid: String!){
    getManpowerAttendanceByUid(uid: $uid){
      ${responseGqlFields(manpowerAttendanceFields)}
    }
  }
`;

export const CREATE_MANPOWER_ATTENDANCE = gql`
  mutation createManpowerAttendance($input: ManpowerAttendanceDtoInput!){
    createManpowerAttendance(input: $input){
      ${responseGqlFields(manpowerAttendanceFields)}
    }
  }
`;

export const UPDATE_MANPOWER_ATTENDANCE = gql`
  mutation updateManpowerAttendance($input: ManpowerAttendanceDtoInput!){
    updateManpowerAttendance(input: $input){
      ${responseGqlFields(manpowerAttendanceFields)}
    }
  }
`;

export const DELETE_MANPOWER_ATTENDANCE = gql`
  mutation deleteManpowerAttendance($uid: String!){
    deleteManpowerAttendance(uid: $uid){
      ${responseGqlFields(manpowerAttendanceFields)}
    }
  }
`;

export const SUBMIT_MANPOWER_ATTENDANCE = gql`
  mutation submitManpowerAttendance($uid: String!){
    submitManpowerAttendance(uid: $uid){
      ${responseGqlFields(manpowerAttendanceFields)}
    }
  }
`;

export const APPROVE_MANPOWER_ATTENDANCE = gql`
  mutation approveManpowerAttendance($uid: String!, $comment: String!){
    approveManpowerAttendance(uid: $uid, comment: $comment){
      ${responseGqlFields(manpowerAttendanceFields)}
    }
  }
`;

// NOTE: backend spelling is `rejecManpowerAttendance` (missing `t`) — verbatim, do not "fix".
export const REJECT_MANPOWER_ATTENDANCE = gql`
  mutation rejecManpowerAttendance($uid: String!, $comment: String!){
    rejecManpowerAttendance(uid: $uid, comment: $comment){
      ${responseGqlFields(manpowerAttendanceFields)}
    }
  }
`;

export const manpowerAttendedFields = `
  attended
  totalManHours
  category {
    uid
    name
  }
  attendance {
    uid
  }
  ${baseGqlFields}
`;

export const GET_ALL_MANPOWER_ATTENDED_PAGEABLE = gql`
  query getAllManpowerAttendedPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllManpowerAttendedPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(manpowerAttendedFields)}
    }
  }
`;

export const GET_ALL_MANPOWER_ATTENDED_BY_ATTENDANCE = gql`
  query getAllManpowerAttendedByAttendance($attendanceUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getAllManpowerAttendedByAttendance(attendanceUid: $attendanceUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(manpowerAttendedFields)}
    }
  }
`;

export const GET_MANPOWER_ATTENDED_BY_UID = gql`
  query getManpowerAttendedByUid($uid: String!){
    getManpowerAttendedByUid(uid: $uid){
      ${responseGqlFields(manpowerAttendedFields)}
    }
  }
`;

export const CREATE_MANPOWER_ATTENDED = gql`
  mutation createManpowerAttended($input: ManpowerAttendedDtoInput!){
    createManpowerAttended(input: $input){
      ${responseGqlFields(manpowerAttendedFields)}
    }
  }
`;

export const UPDATE_MANPOWER_ATTENDED = gql`
  mutation updateManpowerAttended($input: ManpowerAttendedDtoInput!){
    updateManpowerAttended(input: $input){
      ${responseGqlFields(manpowerAttendedFields)}
    }
  }
`;

export const DELETE_MANPOWER_ATTENDED = gql`
  mutation deleteManpowerAttended($uid: String!){
    deleteManpowerAttended(uid: $uid){
      ${responseGqlFields(manpowerAttendedFields)}
    }
  }
`;

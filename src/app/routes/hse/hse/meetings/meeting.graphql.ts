import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
  booleanResponseGqlFields,
} from '@shared/fetch/graphql.constants';

export const hseMeetingFields = `
  title
  description
  category
  startTime
  endTime
  location
  status
  onlineMeeting
  meetingLink
  organizer
  chairPerson {
    uid
    username
    firstName
    lastName
  }
  secretary {
    uid
    username
    firstName
    lastName
  }
  reminderMinutes
  comment
  remarks
  completedAt
  completedBy {
    uid
    username
    firstName
    lastName
  }
  confirmedAt
  confirmedBy {
    uid
    username
    firstName
    lastName
  }
  approvedAt
  rejectedAt
  actedBy {
    uid
    username
    firstName
    lastName
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const hseMeetingAttachmentFields = `
  attachmentTitle
  filePath
  mediaType
  mediaSize
  sourceId
  sourceName
  ${baseGqlFields}
`;

export const GET_ALL_HSE_MEETINGS = gql`
  query getAllHseMeetingsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllHseMeetingsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseMeetingFields)}
    }
  }
`;

export const GET_HSE_MEETING_BY_UID = gql`
  query getHseMeetingByUid($uid: String!){
    getHseMeetingByUid(uid: $uid){
      ${responseGqlFields(hseMeetingFields)}
    }
  }
`;

export const SCHEDULE_OR_RESCHEDULE_HSE_MEETING = gql`
  mutation scheduleOrRescheduleHseMeeting($input: HseMeetingDtoInput!){
    scheduleOrRescheduleHseMeeting(input: $input){
      ${responseGqlFields(hseMeetingFields)}
    }
  }
`;

export const DELETE_HSE_MEETING = gql`
  mutation deleteHseMeeting($uid: String!){
    deleteHseMeeting(uid: $uid){
      ${responseGqlFields(hseMeetingFields)}
    }
  }
`;

export const CONFIRM_HSE_MEETING = gql`
  mutation confirmHseMeeting($uid: String!){
    confirmHseMeeting(uid: $uid){
      ${responseGqlFields(hseMeetingFields)}
    }
  }
`;

// BE declared as @GraphQLQuery despite email side effects — use `query` on FE
export const INVITE_TO_HSE_MEETING = gql`
  query inviteToHseMeeting($meetingUid: String!){
    inviteToHseMeeting(meetingUid: $meetingUid){
      ${booleanResponseGqlFields}
    }
  }
`;

export const MARK_HSE_MEETING_AS_COMPLETED = gql`
  mutation markHseMeetingAsCompleted(
    $meetingUid: String!,
    $remarks: String!,
    $attachments: [AttachmentDtoInput!]
  ){
    markHseMeetingAsCompleted(
      meetingUid: $meetingUid,
      remarks: $remarks,
      attachments: $attachments
    ){
      ${responseGqlFields(hseMeetingFields)}
    }
  }
`;

export const APPROVE_HSE_MEETING_MINUTES = gql`
  mutation approveHseMeetingMinutes($meetingUid: String!, $comment: String!){
    approveHseMeetingMinutes(meetingUid: $meetingUid, comment: $comment){
      ${responseGqlFields(hseMeetingFields)}
    }
  }
`;

export const REJECT_HSE_MEETING_MINUTES = gql`
  mutation rejectHseMeetingMinutes($meetingUid: String!, $comment: String!){
    rejectHseMeetingMinutes(meetingUid: $meetingUid, comment: $comment){
      ${responseGqlFields(hseMeetingFields)}
    }
  }
`;

export const SAVE_OR_UPDATE_HSE_MEETING_ATTACHMENT = gql`
  mutation saveOrUpdateHseMeetingAttachment($meetingUid: String!, $input: AttachmentDtoInput!){
    saveOrUpdateHseMeetingAttachment(meetingUid: $meetingUid, input: $input){
      ${responseGqlFields(hseMeetingAttachmentFields)}
    }
  }
`;

export const GET_HSE_MEETING_ATTENDANCE_ATTACHMENTS = gql`
  query getHseMeetingAttendanceAttachments($meetingUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getHseMeetingAttendanceAttachments(meetingUid: $meetingUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseMeetingAttachmentFields)}
    }
  }
`;

export const GET_HSE_MEETING_MINUTES_ATTACHMENTS = gql`
  query getHseMeetingMinutesAttachments($meetingUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getHseMeetingMinutesAttachments(meetingUid: $meetingUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseMeetingAttachmentFields)}
    }
  }
`;

export const GENERATE_HSE_MEETING_REPORT = gql`
  query generateHseMeetingReport($uid: String!){
    generateHseMeetingReport(uid: $uid){
      ${plainResponseGqlFields}
    }
  }
`;

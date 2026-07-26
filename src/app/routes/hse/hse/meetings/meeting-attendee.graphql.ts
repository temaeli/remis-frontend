import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

export const hseMeetingAttendeeFields = `
  name
  contact
  designation
  section
  organization
  attended
  comment
  ${baseGqlFields}
`;

export const GET_HSE_MEETING_ATTENDEES_BY_MEETING = gql`
  query getHseMeetingAttendeesByMeeting($meetingUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getHseMeetingAttendeesByMeeting(meetingUid: $meetingUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseMeetingAttendeeFields)}
    }
  }
`;

export const GET_HSE_MEETING_ATTENDEE_BY_UID = gql`
  query getHseMeetingAttendeeByUid($uid: String!){
    getHseMeetingAttendeeByUid(uid: $uid){
      ${responseGqlFields(hseMeetingAttendeeFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_HSE_MEETING_ATTENDEE = gql`
  mutation createOrUpdateHseMeetingAttendee($input: HseMeetingAttendeeDtoInput!, $meetingUid: String!){
    createOrUpdateHseMeetingAttendee(input: $input, meetingUid: $meetingUid){
      ${responseGqlFields(hseMeetingAttendeeFields)}
    }
  }
`;

export const DELETE_HSE_MEETING_ATTENDEE = gql`
  mutation deleteHseMeetingAttendee($uid: String!){
    deleteHseMeetingAttendee(uid: $uid){
      ${responseGqlFields(hseMeetingAttendeeFields)}
    }
  }
`;

export const SAVE_OR_UPDATE_HSE_MEETING_ATTENDANCE = gql`
  mutation saveOrUpdateHseMeetingAttendance($meetingUid: String!, $attendances: [AttendanceDtoInput!]!){
    saveOrUpdateHseMeetingAttendance(meetingUid: $meetingUid, attendances: $attendances){
      ${responseGqlFields(hseMeetingAttendeeFields)}
    }
  }
`;

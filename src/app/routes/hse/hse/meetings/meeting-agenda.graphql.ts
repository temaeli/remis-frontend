import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

export const hseMeetingAgendaFields = `
  name
  indexOrder
  notes
  ${baseGqlFields}
`;

export const GET_HSE_MEETING_AGENDAS_BY_MEETING = gql`
  query getHseMeetingAgendasByMeeting($meetingUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getHseMeetingAgendasByMeeting(meetingUid: $meetingUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseMeetingAgendaFields)}
    }
  }
`;

export const GET_HSE_MEETING_AGENDA_BY_UID = gql`
  query getHseMeetingAgendaByUid($uid: String!){
    getHseMeetingAgendaByUid(uid: $uid){
      ${responseGqlFields(hseMeetingAgendaFields)}
    }
  }
`;

export const CREATE_HSE_MEETING_AGENDA = gql`
  mutation createHseMeetingAgenda($input: HseMeetingAgendaDtoInput!){
    createHseMeetingAgenda(input: $input){
      ${responseGqlFields(hseMeetingAgendaFields)}
    }
  }
`;

export const SAVE_HSE_MEETING_AGENDA_NOTES = gql`
  mutation saveHseMeetingAgendaNotes($meetingUid: String!, $notes: String!){
    saveHseMeetingAgendaNotes(meetingUid: $meetingUid, notes: $notes){
      ${responseGqlFields(hseMeetingAgendaFields)}
    }
  }
`;

export const DELETE_HSE_MEETING_AGENDA = gql`
  mutation deleteHseMeetingAgenda($uid: String!){
    deleteHseMeetingAgenda(uid: $uid){
      ${responseGqlFields(hseMeetingAgendaFields)}
    }
  }
`;

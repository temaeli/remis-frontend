import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { complianceStageGqlFields } from '../compliance-common/compliance-common.graphql';

export const meetingRegistrationGqlFields = `
  category
  conductedDate
  confirmationDate
  createdBy{ ${userMinimalGqlFields}}
  minuteStatus
  name
  upcomingSchedule
  stage
  stages{${complianceStageGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_OR_UPDATE_MEETING_REGISTRATION = gql`
  mutation saveOrUpdateMeetingRegistration($meetingRegistrationDto: MeetingRegistrationDtoInput){
   saveOrUpdateMeetingRegistration(meetingRegistrationDto: $meetingRegistrationDto) {
      ${responseGqlFields(meetingRegistrationGqlFields)}
    }
  }
 `;

export const PROCESS_MEETING_REGISTRATION = gql`
  mutation processMeetingRegistration($processingDto: ProcessingDtoInput){
   processMeetingRegistration(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
 `;

//  Queries
export const GET_GENERAL_MANAGER_MEETING_REGISTRATIONS_PAGEABLE = gql`
  query getGeneralManagerMeetingRegistrationsPageable($pageableParam: PageableParamInput){
   getGeneralManagerMeetingRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(meetingRegistrationGqlFields)}
    }
  }
 `;

export const GET_HEAD_OF_DEPARTMENT_MEETING_REGISTRATIONS_PAGEABLE = gql`
  query getHeadOfDepartmentMeetingRegistrationsPageable($pageableParam: PageableParamInput){
   getHeadOfDepartmentMeetingRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(meetingRegistrationGqlFields)}
    }
  }
 `;

export const GET_OFFICER_MEETING_REGISTRATIONS_PAGEABLE = gql`
  query getOfficerMeetingRegistrationsPageable($pageableParam: PageableParamInput){
   getOfficerMeetingRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(meetingRegistrationGqlFields)}
    }
  }
 `;

export const ALL_MEETING_REGISTRATIONS_PAGEABLE = gql`
  query allMeetingRegistrationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allMeetingRegistrationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(meetingRegistrationGqlFields)}
    }
  }
 `;

export const MY_MEETING_REGISTRATIONS_PAGEABLE = gql`
  query myMeetingRegistrationsPageable($pageableParam: PageableParamInput){
   myMeetingRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(meetingRegistrationGqlFields)}
    }
  }
 `;

export const GET_MEETING_REGISTRATION_BY_UID = gql`
  query getMeetingRegistrationByUid($uid: String){
   getMeetingRegistrationByUid(uid: $uid) {
      ${responseGqlFields(meetingRegistrationGqlFields)}
    }
  }
 `;

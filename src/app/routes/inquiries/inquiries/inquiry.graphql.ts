import { gql } from '@apollo/client/core';
import { responseGqlFields, pageGqlFields, baseGqlFields } from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from 'app/routes/users-managment/users/user.graphql';

export const inquiryMinimalGqlFields = `
  clientName
  phone
  trackingId
  description
  priority
  ward{name uid}
  status
  stage
  uid
`;

export const inquiryGqlFields = `
  active
  attendee{${userMinimalGqlFields}}
  createdBy{${userMinimalGqlFields}}
  clientName
  closedBy{${userMinimalGqlFields}}
  destination
  followupInquiry{${inquiryMinimalGqlFields}}
  inquiryCategory
  nature
  otherNature
  phone
  priority
  status
  trackingId
  uid
  ward{name uid}
  region{name uid}
  district{name uid}
  subWard{name uid}
  stage
  type
  ${baseGqlFields}
  description

`;

export const inquiryAssignmentGqlFields = `
  assignedBy{${userMinimalGqlFields}}
  assignee{${userMinimalGqlFields}}
  comment
  createdBy{${userMinimalGqlFields}}
  current
  inquiry{${inquiryMinimalGqlFields}}
  ${baseGqlFields}
`;

export const inquiryReplyGqlFields = `
  attendee{${userMinimalGqlFields}}
  comment
  createdBy{${userMinimalGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_OR_UPDATE_INQUIRY = gql`
  mutation saveOrUpdateInquiry($inquiryDto: InquiryDtoInput){
   saveOrUpdateInquiry(inquiryDto: $inquiryDto) {
      ${responseGqlFields(inquiryGqlFields)}
    }
  }
 `;

export const ASSIGN_INQUIRY = gql`
  query assignInquiry($assignmentDto: AssignmentDtoInput){
   assignInquiry(assignmentDto: $assignmentDto) {
      ${responseGqlFields(inquiryGqlFields)}
    }
  }
 `;

export const ATTEND_INQUIRY = gql`
  query attendInquiry($attendInquiryDto: AttendInquiryDtoInput){
   attendInquiry(attendInquiryDto: $attendInquiryDto) {
      ${responseGqlFields(inquiryGqlFields)}
    }
  }
 `;

export const CLOSE_INQUIRY = gql`
  query closeInquiry($uid: String){
   closeInquiry(uid: $uid) {
      ${responseGqlFields(inquiryGqlFields)}
    }
  }
 `;

export const SUBMIT_INQUIRY = gql`
  query submitInquiry($uid: String){
   submitInquiry(uid: $uid) {
      ${responseGqlFields(inquiryGqlFields)}
    }
  }
 `;

//  Queries
export const ALL_INQUIRIES_PAGEABLE = gql`
  query allInquiriesPageable($pageableParam: PageableParamInput, $active: Boolean = true){
   allInquiriesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(inquiryGqlFields)}
    }
  }
 `;

export const GET_INQUIRIES = gql`
  query getInquiries{
   getInquiries {
      ${inquiryGqlFields}
    }
  }
 `;

export const GET_INQUIRY_BY_UID = gql`
  query getInquiryByUid($uid: String){
   getInquiryByUid(uid: $uid) {
      ${responseGqlFields(inquiryGqlFields)}
    }
  }
 `;

export const MY_INQUIRIES_PAGEABLE = gql`
  query myInquiriesPageable($pageableParam: PageableParamInput) {
    myInquiriesPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(inquiryGqlFields)}
    }
  }
`;

export const MY_INQUIRY_ASSIGNMENT_PAGEABLE = gql`
  query myInquiryAssignmentPageable($pageableParam: PageableParamInput){
   myInquiryAssignmentPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(inquiryAssignmentGqlFields)}
    }
  }
 `;

export const SUBMITTED_INQUIRIES_PAGEABLE = gql`
  query submittedInquiriesPageable($pageableParam: PageableParamInput){
   submittedInquiriesPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(inquiryGqlFields)}
    }
  }
 `;

export const GET_INQUIRY_REPLIES = gql`
  query getInquiryReplies($uid: String){
   getInquiryReplies(uid: $uid) {
      ${inquiryReplyGqlFields}
    }
  }
 `;

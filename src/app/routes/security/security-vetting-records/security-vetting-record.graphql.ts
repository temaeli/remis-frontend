import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityVettingRecordFields = `
  referenceNumber
  station { uid name }
  subjectType
  staffUser { uid fullName }
  guard { uid fullName }
  relationshipType
  surname
  firstName
  middleName
  gender
  dateOfBirth
  placeOfBirth
  idType
  idNumber
  phoneNumber
  email
  currentResidence
  recommendation
  officerComments
  ${baseGqlFields}
`;

const workflowReturn = responseGqlFields('uid recommendation');

export const ALL_SECURITY_VETTING_RECORDS_PAGEABLE = gql`
  query allSecurityVettingRecordsPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityVettingRecordsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityVettingRecordFields)}
    }
  }
`;

export const FIND_SECURITY_VETTING_RECORD = gql`
  query findSecurityVettingRecord($uid: String!){
    findSecurityVettingRecord(uid: $uid){
      ${responseGqlFields(securityVettingRecordFields)}
    }
  }
`;

export const SAVE_SECURITY_VETTING_RECORD = gql`
  mutation saveSecurityVettingRecord($dto: SecurityVettingRecordDtoInput){
    saveSecurityVettingRecord(dto: $dto){
      ${responseGqlFields(securityVettingRecordFields)}
    }
  }
`;

export const RECOMMEND_SECURITY_VETTING_RECORD = gql`
  mutation recommendSecurityVettingRecord($dto: SecurityWorkflowActionDtoInput){
    recommendSecurityVettingRecord(dto: $dto){ ${workflowReturn} }
  }
`;

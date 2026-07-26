import { gql } from '@apollo/client/core';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import {
  baseMinimalGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { complianceStageGqlFields } from '../compliance-common/compliance-common.graphql';

export const caseRegistrationGqlFields = `
  amount
  createdBy{${userMinimalGqlFields} }
  currency
  dateOfSchedules
  decistion
  name
  natureOfCase
  otherCurrency
  otherNature
  responsibleInstitution
  responsibleOfficer{${userMinimalGqlFields}}
  responsibleUnit{ name uid}
  year
  stage
  stages{${complianceStageGqlFields}}
  place{uid name}
  ${baseMinimalGqlFields}
`;

//
//  Mutations
export const SAVE_OR_UPDATE_CASE_REGISTRATION = gql`
  mutation saveOrUpdateCaseRegistration($caseRegistrationDto: CaseRegistrationDtoInput){
   saveOrUpdateCaseRegistration(caseRegistrationDto: $caseRegistrationDto) {
      ${responseGqlFields(caseRegistrationGqlFields)}
    }
  }
 `;

export const PROCESS_CASE_REGISTRATION = gql`
  mutation processCaseRegistration($processingDto: ProcessingDtoInput){
   processCaseRegistration(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
 `;

//  Queries
export const GET_GENERAL_MANAGER_CASE_REGISTRATIONS_PAGEABLE = gql`
  query getGeneralManagerCaseRegistrationsPageable($pageableParam: PageableParamInput){
   getGeneralManagerCaseRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(caseRegistrationGqlFields)}
    }
  }
 `;

export const GET_HEAD_OF_DEPARTMENT_CASE_REGISTRATIONS_PAGEABLE = gql`
  query getHeadOfDepartmentCaseRegistrationsPageable($pageableParam: PageableParamInput){
   getHeadOfDepartmentCaseRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(caseRegistrationGqlFields)}
    }
  }
 `;

export const GET_OFFICER_CASE_REGISTRATIONS_PAGEABLE = gql`
  query getOfficerCaseRegistrationsPageable($pageableParam: PageableParamInput){
   getOfficerCaseRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(caseRegistrationGqlFields)}
    }
  }
 `;

export const MY_CASE_REGISTRATIONS_PAGEABLE = gql`
  query myCaseRegistrationsPageable($pageableParam: PageableParamInput){
   myCaseRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(caseRegistrationGqlFields)}
    }
  }
 `;

export const ALL_CASE_REGISTRATIONS_PAGEABLE = gql`
  query allCaseRegistrationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allCaseRegistrationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(caseRegistrationGqlFields)}
    }
  }
 `;

export const GET_CASE_REGISTRATION_BY_UID = gql`
  query getCaseRegistrationByUid($uid: String){
   getCaseRegistrationByUid(uid: $uid) {
      ${responseGqlFields(caseRegistrationGqlFields)}
    }
  }
 `;

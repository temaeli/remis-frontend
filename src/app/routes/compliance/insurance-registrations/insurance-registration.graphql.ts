import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { complianceStageGqlFields } from '../compliance-common/compliance-common.graphql';

export const insuranceRegistrationGqlFields = `
  active
  coverage
  createdAt
  createdBy{ ${userMinimalGqlFields}}
  currency
  department{uid name}
  duration
  endDate
  insuranceType
  nameOfAsset
  otherCurrency
  startDate
  statusOfIncident
  stage
  stages{${complianceStageGqlFields}}
  value
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_OR_UPDATE_INSURANCE_REGISTRATION = gql`
  mutation saveOrUpdateInsuranceRegistration($insuranceRegistrationDto: InsuranceRegistrationDtoInput){
   saveOrUpdateInsuranceRegistration(insuranceRegistrationDto: $insuranceRegistrationDto) {
      ${responseGqlFields(insuranceRegistrationGqlFields)}
    }
  }
 `;

export const PROCESS_INSURANCE_REGISTRATION = gql`
  mutation processInsuranceRegistration($processingDto: ProcessingDtoInput){
   processInsuranceRegistration(processingDto: $processingDto) {
     ${booleanResponseGqlFields}
    }
  }
 `;

//  Queries
export const GET_GENERAL_MANAGER_INSURANCE_REGISTRATIONS_PAGEABLE = gql`
  query getGeneralManagerInsuranceRegistrationsPageable($pageableParam: PageableParamInput){
   getGeneralManagerInsuranceRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(insuranceRegistrationGqlFields)}
    }
  }
 `;

export const GET_HEAD_OF_DEPARTMENT_INSURANCE_REGISTRATIONS_PAGEABLE = gql`
  query getHeadOfDepartmentInsuranceRegistrationsPageable($pageableParam: PageableParamInput){
   getHeadOfDepartmentInsuranceRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(insuranceRegistrationGqlFields)}
    }
  }
 `;

export const GET_OFFICER_INSURANCE_REGISTRATIONS_PAGEABLE = gql`
  query getOfficerInsuranceRegistrationsPageable($pageableParam: PageableParamInput){
   getOfficerInsuranceRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(insuranceRegistrationGqlFields)}
    }
  }
 `;

export const ALL_INSURANCE_REGISTRATIONS_PAGEABLE = gql`
  query allInsuranceRegistrationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allInsuranceRegistrationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(insuranceRegistrationGqlFields)}
    }
  }
 `;

export const MY_INSURANCE_REGISTRATIONS_PAGEABLE = gql`
  query myInsuranceRegistrationsPageable($pageableParam: PageableParamInput){
   myInsuranceRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(insuranceRegistrationGqlFields)}
    }
  }
 `;

export const GET_INSURANCE_REGISTRATION_BY_UID = gql`
  query getInsuranceRegistrationByUid($uid: String){
   getInsuranceRegistrationByUid(uid: $uid) {
      ${responseGqlFields(insuranceRegistrationGqlFields)}
    }
  }
 `;

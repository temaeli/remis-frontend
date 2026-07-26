import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { complianceStageGqlFields } from '../compliance-common/compliance-common.graphql';

export const contractRegistrationGqlFields = `
  amount
  contractDate
  contractManager
  contractNumber
  contractType
  createdBy{ ${userMinimalGqlFields}}
  currency
  duration
  endDate
  executionStatus
  name
  otherCurrency
  otherType
  serviceProvider
  stage
  department{ name uid }
  stages{${complianceStageGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_OR_UPDATE_CONTRACT_REGISTRATION = gql`
  mutation saveOrUpdateContractRegistration($contractRegistrationDto: ContractRegistrationDtoInput){
   saveOrUpdateContractRegistration(contractRegistrationDto: $contractRegistrationDto) {
      ${responseGqlFields(contractRegistrationGqlFields)}
    }
  }
 `;

export const PROCESS_CONTRACT_REGISTRATION = gql`
  mutation processContractRegistration($processingDto: ProcessingDtoInput){
   processContractRegistration(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
 `;

//  Queries
export const GET_GENERAL_MANAGER_CONTRACT_REGISTRATIONS_PAGEABLE = gql`
  query getGeneralManagerContractRegistrationsPageable($pageableParam: PageableParamInput){
   getGeneralManagerContractRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(contractRegistrationGqlFields)}
    }
  }
 `;

export const GET_HEAD_OF_DEPARTMENT_CONTRACT_REGISTRATIONS_PAGEABLE = gql`
  query getHeadOfDepartmentContractRegistrationsPageable($pageableParam: PageableParamInput){
   getHeadOfDepartmentContractRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(contractRegistrationGqlFields)}
    }
  }
 `;

export const GET_OFFICER_CONTRACT_REGISTRATIONS_PAGEABLE = gql`
  query getOfficerContractRegistrationsPageable($pageableParam: PageableParamInput){
   getOfficerContractRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(contractRegistrationGqlFields)}
    }
  }
 `;

export const ALL_CONTRACT_REGISTRATIONS_PAGEABLE = gql`
  query allContractRegistrationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allContractRegistrationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(contractRegistrationGqlFields)}
    }
  }
 `;

export const GET_CONTRACT_REGISTRATION_BY_UID = gql`
  query getContractRegistrationByUid($uid: String){
   getContractRegistrationByUid(uid: $uid) {
      ${responseGqlFields(contractRegistrationGqlFields)}
    }
  }
 `;

export const MY_CONTRACT_REGISTRATIONS_PAGEABLE = gql`
  query myContractRegistrationsPageable($pageableParam: PageableParamInput){
   myContractRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(contractRegistrationGqlFields)}
    }
  }
 `;

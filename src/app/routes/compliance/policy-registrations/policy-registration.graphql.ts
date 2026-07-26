import { gql } from '@apollo/client/core';
import { stagesGqlFields } from '@routes/plants/hse-reports/hse-report.graphql';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { complianceStageGqlFields } from '../compliance-common/compliance-common.graphql';

export const policyRegistrationGqlFields = `
  applicability
  createdBy{ ${userMinimalGqlFields} }
  dateOfReview
  endorsementDate
  expirationDate
  name
  reviewStatus
  stage
  stages{${complianceStageGqlFields}}
  department{uid name}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_OR_UPDATE_POLICY_REGISTRATION = gql`
  mutation saveOrUpdatePolicyRegistration($policyRegistrationDto: PolicyRegistrationDtoInput){
   saveOrUpdatePolicyRegistration(policyRegistrationDto: $policyRegistrationDto) {
      ${responseGqlFields(policyRegistrationGqlFields)}
    }
  }
 `;

export const PROCESS_POLICY_REGISTRATION = gql`
  mutation processPolicyRegistration($processingDto: ProcessingDtoInput){
   processPolicyRegistration(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
 `;

//  Queries
export const GET_GENERAL_MANAGER_POLICY_REGISTRATIONS_PAGEABLE = gql`
  query getGeneralManagerPolicyRegistrationsPageable($pageableParam: PageableParamInput){
   getGeneralManagerPolicyRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(policyRegistrationGqlFields)}
    }
  }
 `;

export const GET_HEAD_OF_DEPARTMENT_POLICY_REGISTRATIONS_PAGEABLE = gql`
  query getHeadOfDepartmentPolicyRegistrationsPageable($pageableParam: PageableParamInput){
   getHeadOfDepartmentPolicyRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(policyRegistrationGqlFields)}
    }
  }
 `;

export const GET_OFFICER_POLICY_REGISTRATIONS_PAGEABLE = gql`
  query getOfficerPolicyRegistrationsPageable($pageableParam: PageableParamInput){
   getOfficerPolicyRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(policyRegistrationGqlFields)}
    }
  }
 `;

export const ALL_POLICY_REGISTRATIONS_PAGEABLE = gql`
  query allPolicyRegistrationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allPolicyRegistrationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(policyRegistrationGqlFields)}
    }
  }
 `;

export const GET_POLICY_REGISTRATION_BY_UID = gql`
  query getPolicyRegistrationByUid($uid: String){
   getPolicyRegistrationByUid(uid: $uid) {
      ${responseGqlFields(policyRegistrationGqlFields)}
    }
  }
 `;

export const MY_POLICY_REGISTRATIONS_PAGEABLE = gql`
  query myPolicyRegistrationsPageable($pageableParam: PageableParamInput){
   myPolicyRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(policyRegistrationGqlFields)}
    }
  }
 `;

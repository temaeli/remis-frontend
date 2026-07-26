import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { complianceStageGqlFields } from '../compliance-common/compliance-common.graphql';

export const licenceRegistrationGqlFields = `
  condition
  createdBy{ ${userMinimalGqlFields}}
  duration
  department{uid name}
  expirationDate
  name
  renewalRequirement
  stage
  issuedDate
  stages{${complianceStageGqlFields}}
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_OR_UPDATE_LICENCE_REGISTRATION = gql`
  mutation saveOrUpdateLicenceRegistration($licenceRegistrationDto: LicenceRegistrationDtoInput){
   saveOrUpdateLicenceRegistration(licenceRegistrationDto: $licenceRegistrationDto) {
      ${responseGqlFields(licenceRegistrationGqlFields)}
    }
  }
 `;

export const PROCESS_LICENCE_REGISTRATION = gql`
  mutation processLicenceRegistration($processingDto: ProcessingDtoInput){
   processLicenceRegistration(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
 `;

//  Queries
export const GET_GENERAL_MANAGER_LICENCE_REGISTRATIONS_PAGEABLE = gql`
  query getGeneralManagerLicenceRegistrationsPageable($pageableParam: PageableParamInput){
   getGeneralManagerLicenceRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(licenceRegistrationGqlFields)}
    }
  }
 `;

export const GET_HEAD_OF_DEPARTMENT_LICENCE_REGISTRATIONS_PAGEABLE = gql`
  query getHeadOfDepartmentLicenceRegistrationsPageable($pageableParam: PageableParamInput){
   getHeadOfDepartmentLicenceRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(licenceRegistrationGqlFields)}
    }
  }
 `;

export const GET_OFFICER_LICENCE_REGISTRATIONS_PAGEABLE = gql`
  query getOfficerLicenceRegistrationsPageable($pageableParam: PageableParamInput){
   getOfficerLicenceRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(licenceRegistrationGqlFields)}
    }
  }
 `;

export const ALL_LICENCE_REGISTRATIONS_PAGEABLE = gql`
  query allLicenceRegistrationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allLicenceRegistrationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(licenceRegistrationGqlFields)}
    }
  }
 `;

export const MY_LICENCE_REGISTRATIONS_PAGEABLE = gql`
  query myLicenceRegistrationsPageable($pageableParam: PageableParamInput){
   myLicenceRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(licenceRegistrationGqlFields)}
    }
  }
 `;

export const GET_LICENCE_REGISTRATION_BY_UID = gql`
  query getLicenceRegistrationByUid($uid: String){
   getLicenceRegistrationByUid(uid: $uid) {
      ${responseGqlFields(licenceRegistrationGqlFields)}
    }
  }
 `;

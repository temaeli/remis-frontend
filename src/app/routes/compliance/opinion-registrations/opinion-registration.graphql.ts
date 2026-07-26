import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { complianceStageGqlFields } from '../compliance-common/compliance-common.graphql';

export const opinionRegistrationGqlFields = `
  createdBy{ ${userMinimalGqlFields} }
  deletedAt
  deletedBy
  findingStatus
  name
  nature
  resolutionStatus
  stage
  stages{${complianceStageGqlFields}}
  responsibleUnit{uid name}
  valueObtained
  ${baseGqlFields}
`;

//
//  Mutations
export const SAVE_OR_UPDATE_OPINION_REGISTRATION = gql`
  mutation saveOrUpdateOpinionRegistration($opinionRegistrationDto: OpinionRegistrationDtoInput){
   saveOrUpdateOpinionRegistration(opinionRegistrationDto: $opinionRegistrationDto) {
      ${responseGqlFields(opinionRegistrationGqlFields)}
    }
  }
 `;

export const PROCESS_OPINION_REGISTRATION = gql`
  mutation processOpinionRegistration($processingDto: ProcessingDtoInput){
   processOpinionRegistration(processingDto: $processingDto) {
     ${booleanResponseGqlFields}
    }
  }
 `;

//  Queries
export const GET_GENERAL_MANAGER_OPINION_REGISTRATIONS_PAGEABLE = gql`
  query getGeneralManagerOpinionRegistrationsPageable($pageableParam: PageableParamInput){
   getGeneralManagerOpinionRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(opinionRegistrationGqlFields)}
    }
  }
 `;

export const GET_HEAD_OF_DEPARTMENT_OPINION_REGISTRATIONS_PAGEABLE = gql`
  query getHeadOfDepartmentOpinionRegistrationsPageable($pageableParam: PageableParamInput){
   getHeadOfDepartmentOpinionRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(opinionRegistrationGqlFields)}
    }
  }
 `;

export const GET_OFFICER_OPINION_REGISTRATIONS_PAGEABLE = gql`
  query getOfficerOpinionRegistrationsPageable($pageableParam: PageableParamInput){
   getOfficerOpinionRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(opinionRegistrationGqlFields)}
    }
  }
 `;

export const MY_OPINION_REGISTRATIONS_PAGEABLE = gql`
  query myOpinionRegistrationsPageable($pageableParam: PageableParamInput){
   myOpinionRegistrationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(opinionRegistrationGqlFields)}
    }
  }
 `;

export const ALL_OPINION_REGISTRATIONS_PAGEABLE = gql`
  query allOpinionRegistrationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allOpinionRegistrationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(opinionRegistrationGqlFields)}
    }
  }
 `;

export const GET_OPINION_REGISTRATION_BY_UID = gql`
  query getOpinionRegistrationByUid($uid: String){
   getOpinionRegistrationByUid(uid: $uid) {
      ${responseGqlFields(opinionRegistrationGqlFields)}
    }
  }
 `;

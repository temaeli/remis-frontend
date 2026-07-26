import { gql } from '@apollo/client/core';
import {
  responseGqlFields,
  baseMinimalGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const designationGqlFields = `
active
code
migrated
title
${baseMinimalGqlFields}

`;

export const userGqlFields = `
active
email
firstName
lastName
phoneNumber
${baseMinimalGqlFields}

`;

//
//  Mutations
export const SAVE_DESIGNATION = gql`
  mutation saveDesignation($dto: DesignationDtoInput){
   saveDesignation(dto: $dto) {
      ${responseGqlFields(designationGqlFields)}
    }
  }
 `;

export const DELETE_DESIGNATION = gql`
  mutation deleteDesignation($uid: String!){
   deleteDesignation(uid: $uid) {
      ${responseGqlFields(designationGqlFields)}
    }
  }
 `;

//  Queries
export const ALL_DESIGNATIONS = gql`
  query allDesignations{
   allDesignations {
      ${designationGqlFields}
    }
  }
 `;

export const ALL_DESIGNATIONS_PAGEABLE = gql`
  query allDesignationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allDesignationsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(designationGqlFields)}
    }
  }
 `;

export const FIND_DESIGNATION = gql`
  query findDesignation($uid: String!){
   findDesignation(uid: $uid) {
      ${responseGqlFields(designationGqlFields)}
    }
  }
 `;

export const USERS_BY_DESIGNATION_PAGEABLE = gql`
  query usersByDesignationPageable($pageableParam: PageableParamInput, $active: Boolean, $designationUid: String){
   usersByDesignationPageable(pageableParam: $pageableParam, active: $active, designationUid: $designationUid) {
      ${pageGqlFields(userGqlFields)}
    }
  }
 `;

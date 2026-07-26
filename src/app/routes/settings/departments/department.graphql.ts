import { gql } from '@apollo/client/core';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import {
  baseMinimalGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

export const departmentGqlFields = `
  active
  code
  createdBy{ ${userMinimalGqlFields} }
  name
  uid
  ${baseMinimalGqlFields}
`;

//
//  Mutations
export const DELETE_DEPARTMENT = gql`
  mutation deleteDepartment($uid: String){
   deleteDepartment(uid: $uid) {
      ${responseGqlFields(departmentGqlFields)}
    }
  }
 `;

export const SAVE_DEPARTMENT = gql`
  mutation saveDepartment($dto: DepartmentDtoInput){
   saveDepartment(dto: $dto) {
      ${responseGqlFields(departmentGqlFields)}
    }
  }
 `;

//  Queries
export const FIND_DEPARTMENT = gql`
  query findDepartment($uid: String){
   findDepartment(uid: $uid) {
      ${responseGqlFields(departmentGqlFields)}
    }
  }
 `;

export const ALL_DEPARTMENTS_PAGEABLE = gql`
  query allDepartmentsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allDepartmentsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(departmentGqlFields)}
    }
  }
 `;

export const ALL_DEPARTMENTS = gql`
  query allDepartments{
   allDepartments {
      ${departmentGqlFields}
    }
  }
 `;

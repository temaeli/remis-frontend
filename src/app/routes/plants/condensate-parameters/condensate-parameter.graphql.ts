import { gql } from '@apollo/client/core';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const condensateParameterGqlFields = `
  createdBy{${userMinimalGqlFields}}
  plant{name uid}
  testedRvp
  ${baseGqlFields}
`;

//
//  Mutations
export const CREATE_UPDATE_CONDENSATE_PARAMETER = gql`
  mutation createUpdateCondensateParameter($uid: String, $inputs: CondensateParameterDtoInput!, $plantUid: String){
   createUpdateCondensateParameter(uid: $uid, inputs: $inputs, plantUid: $plantUid) {
      ${responseGqlFields(condensateParameterGqlFields)}
    }
  }
 `;

//  Queries
export const GET_MY_CONDENSATE_PARAMETER_PAGEABLE = gql`
  query getMyCondensateParameterPageable($pageableParam: PageableParamInput){
   getMyCondensateParameterPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(condensateParameterGqlFields)}
    }
  }
 `;

export const GET_ALL_CONDENSATE_PARAMETER_PAGEABLE = gql`
  query getAllCondensateParameterPageable($pageableParam: PageableParamInput, $active: Boolean){
   getAllCondensateParameterPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(condensateParameterGqlFields)}
    }
  }
 `;

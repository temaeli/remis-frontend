import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const gasInstallationGqlFields = `
code
description
migrated
name
${baseGqlFields}
`;

// Gas Installation Mutations

export const ALL_GAS_INSTALLATIONS = gql`
  query allGasInstallations{
   allGasInstallations {
      ${gasInstallationGqlFields}
    }
  }
 `;

export const ALL_GAS_INSTALLATIONS_PAGEABLE = gql`
  query allGasInstallationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allGasInstallationsPageable(pageableParam: $pageableParam, active: $active) {
     ${pageGqlFields(gasInstallationGqlFields)}
    }
  }
 `;

export const FIND_GAS_INSTALLATION = gql`
  query findGasInstallation($uid: String!){
   findGasInstallation(uid: $uid) {
      ${responseGqlFields(gasInstallationGqlFields)}
    }
  }
 `;

export const DELETE_GAS_INSTALLATION = gql`
  mutation deleteGasInstallation($uid: String){
   deleteGasInstallation(uid: $uid) {
      ${responseGqlFields(gasInstallationGqlFields)}
    }
  }
 `;

export const SAVE_GAS_INSTALLATION = gql`
  mutation saveGasInstallation($dto: GasInstallationDtoInput){
   saveGasInstallation(dto: $dto) {
      ${responseGqlFields(gasInstallationGqlFields)}
    }
  }
 `;

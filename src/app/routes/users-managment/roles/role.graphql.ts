import { baseGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { gql } from 'apollo-angular';
import { permissionFields } from '../permissions/permission.graphql';

export const roleMinimalGqlFields = `
  name
  description
  canBeEdited
  permissionList{
    name
    displayName
    groupName
    id
    service
  }
`;

export const roleFields = `
    name
    description
    permissionList{
      ${permissionFields}
    }
      ${baseGqlFields}
    `;

export const LIST_ALL_ROLES = gql`
    query listingRoles($active: Boolean){
      listingRoles(active:$active){
        ${roleFields}
      }
    }
`;

export const GET_ROLE_BY_UID = gql`
    query getRoleByUid($roleUid: String){
      getRoleByUid(roleUid: $roleUid){
     ${responseGqlFields(roleFields)}
      }
    }
`;

export const CREATE_OR_UPDATE_ROLE = gql`
 mutation saveRole($roleDto: RoleDtoInput){
  saveRole(roleDto: $roleDto){
  ${responseGqlFields(roleFields)}
  }
}
`;

export const ACTIVATE_OR_DEACTIVATE_ROLE = gql`
  mutation activateOrDeactivateRole($roleUid: String) {
    activateOrDeactivateRole(roleUid: $roleUid) {
        ${responseGqlFields(roleFields)}
    }
  }
`;

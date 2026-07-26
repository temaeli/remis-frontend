import gql from 'graphql-tag';

export const permissionFields = `
    #id
    uid
    name
    displayName
    `;

export const LIST_ALL_PERMISSIONS = gql`
    query getPermissions{
      getPermissions{
        permissions{
          ${permissionFields}
        }
        groupName
      }
    }
`;

export const ASSIGN_PERMISSIONS_TO_ROLE = gql`
  mutation assignPermissionsToRole($roleDto: RoleDtoInput, $roleUid: String) {
    assignPermissionsToRole(roleDto: $roleDto, roleUid: $roleUid) {
      code
      data {
        description
        id
        active
        isDeleted
        name
      }
      status
    }
  }
`;

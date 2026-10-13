export interface Permission {
  id?: string;
  uid?: string;
  name?: string;
  displayName?: string;
  groupName?: string;
  service?: string;
}

export interface PermissionGroup {
  groupName?: string;
  permissions?: Permission[];
}

export interface Role {
  id?: string;
  uid?: string;
  name?: string;
  description?: string;
  active?: boolean;
  canBeEdited?: boolean;
  /** Given to everyone who registers themselves on the portal. */
  external?: boolean;
  permissionList?: Permission[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface RoleDtoInput {
  uid?: string;
  name?: string;
  description?: string;
  external?: boolean;
  permissionList?: { id: string }[];
}

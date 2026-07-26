export interface Permission {
  id?: number;
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
  id?: number;
  uid?: string;
  name?: string;
  description?: string;
  active?: boolean;
  canBeEdited?: boolean;
  permissionList?: Permission[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface RoleDtoInput {
  uid?: string;
  name?: string;
  description?: string;
  permissionList?: { id: number }[];
}

import { IdentityType } from '../identity-types/identity-type.interface';

/**
 * A named entity — an organisation and the like — in the DBA-owned
 * `remis_core_schema`.
 *
 * Keyed on a uuid, so `id` is a string and there is no `uid` column: the public
 * identifier is the primary key. There is also no `updatedAt` or `deletedAt` —
 * that schema records only creation.
 */
export interface BusinessName {
  id?: string;
  uid?: string;
  assignedNumber?: string;
  name?: string;
  description?: string;
  identityType?: IdentityType;
  isPublic?: boolean;
  active?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface BusinessNameDtoInput {
  uid?: string;
  assignedNumber?: string;
  name: string;
  description: string;
  identityTypeUid: string;
  isPublic?: boolean;
}

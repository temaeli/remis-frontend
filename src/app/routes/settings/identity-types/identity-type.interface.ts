/**
 * How a person or an organisation is identified — the classification a
 * `BusinessName` and a person record both point at.
 *
 * Lives in the DBA-owned `remis_core_schema`, so it is keyed on a uuid and has no
 * `updatedAt` or `deletedAt`: that schema records only creation.
 */
export interface IdentityType {
  id?: string;
  uid?: string;
  assignedNumber?: string;
  name?: string;
  description?: string;
  active?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface IdentityTypeDtoInput {
  uid?: string;
  assignedNumber?: string;
  name: string;
  description: string;
}

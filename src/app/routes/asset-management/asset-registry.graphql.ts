/**
 * The columns every table in the asset registry shares, mirroring
 * `AssetBaseEntity` on the backend: an assigned number, a name and a description
 * on top of the audit fields.
 *
 * Deliberately does not use `baseGqlFields`. These tables live in the DBA-owned
 * `remis_core_schema`, whose audit block has no `updatedAt` or `deletedAt` — asking
 * for them makes the whole query fail. `id` is a uuid string here, not a number.
 */
export const assetRegistryGqlFields = `
  id
  uid
  isDeleted
  active
  createdAt
  assignedNumber
  name
  description
`;

/** Parent reference, kept shallow so nested selections do not fan out. */
export const assetRefGqlFields = `
  id
  uid
  assignedNumber
  name
`;

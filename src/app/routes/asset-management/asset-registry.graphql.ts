/**
 * The columns every table in the asset registry shares, mirroring
 * `AssetBaseEntity` on the backend: an assigned number, a name and a description
 * on top of the audit fields.
 *
 * Deliberately does not use `baseGqlFields`. These tables live in the DBA-owned
 * `remis_core_schema`, whose audit block has no `updatedAt` or `deletedAt` — asking
 * for them makes the whole query fail.
 *
 * `uid` is aliased onto `id`. These tables have no uid column; the uuid primary
 * key already is the public identifier, and it carries exactly the value uid used
 * to hold. Aliasing keeps `entity.uid` working everywhere — routing, forms, grids
 * — without a schema field behind it.
 */
export const assetRegistryGqlFields = `
  id
  uid: id
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
  uid: id
  assignedNumber
  name
`;

/**
 * The columns every table in the asset registry shares, mirroring
 * `AssetBaseEntity` on the backend: an assigned number, a name and a description
 * on top of the audit fields.
 *
 * Deliberately does not use `baseGqlFields`. These tables live in the DBA-owned
 * `remis_core_schema`, whose audit block has no `updatedAt` or `deletedAt` — asking
 * for them makes the whole query fail.
 *
 * There is no `uid` field: these tables have no uid column, and the uuid primary
 * key is the public identifier. Components read `id` — row actions, parent
 * selectors and detail navigation all key on it. The one place the name `uid`
 * survives is the mutation input and the query arguments, which the backend still
 * calls `uid` and parses into a uuid.
 */
export const assetRegistryGqlFields = `
  id
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
  assignedNumber
  name
`;

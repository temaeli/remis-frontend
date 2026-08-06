/**
 * The columns every table in the project registry repeats, mirroring
 * `CoreNamedEntity` on the backend.
 *
 * Deliberately does not use `baseGqlFields`. These tables live in the DBA-owned
 * `remis_core_schema`, whose audit block has no `updatedAt` or `deletedAt` —
 * asking for them fails the whole query rather than just omitting them.
 *
 * `uid` is aliased onto `id` because there is no uid column: the uuid primary key
 * is the public identifier, and the alias keeps `entity.uid` working for the
 * shared grid and view helpers.
 */
export const projectRegistryGqlFields = `
  id
  uid: id
  assignedNumber
  name
  description
  active
  isDeleted
  createdAt
`;

/** Parent reference, kept shallow so nested selections do not fan out. */
export const projectRefGqlFields = `
  id
  uid: id
  assignedNumber
  name
`;

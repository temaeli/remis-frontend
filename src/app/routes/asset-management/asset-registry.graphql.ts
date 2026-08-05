import { baseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * The columns every table in the asset registry shares, mirroring
 * `AssetBaseEntity` on the backend: an assigned number, a name and a description
 * on top of the standard audit fields.
 */
export const assetRegistryGqlFields = `
  ${baseGqlFields}
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

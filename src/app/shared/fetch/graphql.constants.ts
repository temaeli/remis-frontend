export const baseMinimalGqlFields = `
  id
  uid
  active
  createdAt
`;

export const baseGqlFields = `
  id
  uid
  isDeleted
  active
  updatedAt
  createdAt
  deletedAt
`;

/**
 * Deliberately does not select `sort`. The backend returns Spring Data's own
 * `Sort`, which exposes only `sorted`, `unsorted` and `empty` — it has no
 * `getOrders()`, so the `orders { direction … }` selection this file inherited
 * from the gasco fork names a field that does not exist and fails the whole
 * query. Nothing here reads the sort back anyway: the grid sorts through
 * MatSort and sends the order out via `pageableParam`.
 */
export const basePaginationGqlFields = `
  size
  number
  first
  last
  totalElements
  totalPages
`;

export const baseGqlResponseFields = `
  code
  message
  status
`;

export const plainResponseGqlFields = `
  data
  code
  message
  status
`;

export const pageGqlFields = (gqlFields: string) => `
   content{
    ${gqlFields}
   }
  ${basePaginationGqlFields}
`;

export const responseGqlFields = (gqlFields: string) => `
   data{
    ${gqlFields}
   }

  ${baseGqlResponseFields}
`;

export const responseListGqlFields = (gqlFields: string) => `
   dataList{
    ${gqlFields}
   }
  ${baseGqlResponseFields}
`;

export const booleanResponseGqlFields = plainResponseGqlFields;

export const stringResponseGqlFields = plainResponseGqlFields;

export const listStringResponseGqlFields = plainResponseGqlFields;

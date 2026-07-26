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

export const Order = `
 orders{
    direction
    ignoreCase
    nullHandlingHint
    property
  }
`;

export const basePaginationGqlFields = `
  size
  number
  first
  last
  totalElements
  totalPages
  sort{
   ${Order}
  }
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

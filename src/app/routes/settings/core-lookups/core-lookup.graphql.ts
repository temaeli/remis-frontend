import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

import { CoreLookupOperations } from './core-lookup.interface';

/**
 * The columns every one of these tables repeats, mirroring `CoreNamedEntity` on
 * the backend.
 *
 * Deliberately does not use `baseGqlFields`. These tables live in the DBA-owned
 * `remis_core_schema`, whose audit block has no `updatedAt` or `deletedAt` —
 * asking for them fails the whole query rather than just omitting them.
 *
 * `uid` is aliased onto `id` because there is no uid column: the uuid primary key
 * is the public identifier, and the alias keeps `entity.uid` working for the
 * shared grid and view helpers.
 */
export const coreLookupGqlFields = `
  id
  uid: id
  assignedNumber
  name
  description
  active
  isDeleted
  createdAt
`;

/** A related record, kept shallow so nested selections do not fan out. */
export const coreLookupRefGqlFields = `
  id
  uid: id
  assignedNumber
  name
`;

/**
 * Builds the five documents for one lookup table.
 *
 * Every controller under `modules.setting.billing` and `modules.setting.reference`
 * publishes the same operations off the same names — `allGfsCodes`,
 * `allGfsCodesPageable`, `findGfsCode`, `saveGfsCode`, `deleteGfsCode` — and SPQR
 * names the mutation input after the DTO, so all five follow from the entity and
 * its plural.
 */
export const buildCoreLookupGql = (
  entity: string,
  entityPlural: string,
  extraGqlFields = '',
): CoreLookupOperations => {
  const fields = `${coreLookupGqlFields}${extraGqlFields}`;

  return {
    all: gql`
      query all${entityPlural} {
        all${entityPlural} {
          ${fields}
        }
      }
    `,

    allPageable: gql`
      query all${entityPlural}Pageable($pageableParam: PageableParamInput, $active: Boolean) {
        all${entityPlural}Pageable(pageableParam: $pageableParam, active: $active) {
          ${pageGqlFields(fields)}
        }
      }
    `,

    find: gql`
      query find${entity}($uid: String) {
        find${entity}(uid: $uid) {
          ${responseGqlFields(fields)}
        }
      }
    `,

    save: gql`
      mutation save${entity}($input: ${entity}DtoInput) {
        save${entity}(input: $input) {
          ${responseGqlFields(fields)}
        }
      }
    `,

    delete: gql`
      mutation delete${entity}($uid: String) {
        delete${entity}(uid: $uid) {
          ${responseGqlFields(fields)}
        }
      }
    `,
  };
};

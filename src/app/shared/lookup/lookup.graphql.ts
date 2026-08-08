import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

import { LookupOperations, LookupSchema } from './lookup.interface';

/**
 * The audit block each schema actually carries.
 *
 * The core one deliberately does not use `baseGqlFields`: those tables record
 * only creation, so asking for `updatedAt` or `deletedAt` fails the whole query
 * rather than just omitting them. `uid` is aliased onto `id` because there is no
 * uid column — the uuid primary key is the public identifier, and the alias keeps
 * `entity.uid` working for the shared grid and view helpers.
 */
export const auditGqlFields: Record<LookupSchema, string> = {
  core: `
  id
  uid: id
  active
  isDeleted
  createdAt
`,
  uaa: `
  id
  uid
  active
  createdAt
`,
};

/** The three descriptive columns every `remis_core_schema` lookup table repeats. */
export const namedGqlFields = `
  assignedNumber
  name
  description
`;

/** A related record, kept shallow so nested selections do not fan out. */
export const lookupRefGqlFields = `
  id
  uid: id
  assignedNumber
  name
`;

export interface LookupGqlOptions {
  schema?: LookupSchema;
  saveArg?: 'input' | 'dto';
  descriptiveGqlFields?: string;
  extraGqlFields?: string;
}

/**
 * Builds the five documents for one lookup table.
 *
 * Every controller these screens sit on publishes the same operations off the
 * same names — `allGfsCodes`, `allGfsCodesPageable`, `findGfsCode`,
 * `saveGfsCode`, `deleteGfsCode` — and SPQR names the mutation input after the
 * DTO, so all five follow from the entity and its plural.
 *
 * The one thing that is not uniform is the save argument's name, which SPQR takes
 * from the DTO parameter. The variable stays `$input` either way, so callers do
 * not have to care which controller they are talking to.
 */
export const buildLookupGql = (
  entity: string,
  entityPlural: string,
  options: LookupGqlOptions = {},
): LookupOperations => {
  const { schema = 'core', saveArg = 'input' } = options;
  const descriptive = options.descriptiveGqlFields ?? namedGqlFields;
  const fields = `${auditGqlFields[schema]}${descriptive}${options.extraGqlFields ?? ''}`;

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
        save${entity}(${saveArg}: $input) {
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

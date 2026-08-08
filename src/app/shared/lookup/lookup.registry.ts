import { Subject } from 'rxjs';

import { buildLookupGql } from './lookup.graphql';
import { LookupConfig, LookupModule } from './lookup.interface';

/**
 * Every lookup a module has defined, keyed by slug.
 *
 * The two generic screens are lazy-loaded by route and carry only their slug in
 * `data.lookup`, so they need somewhere to look the rest up. A module's registry
 * fills this in as it is evaluated, which happens when its routes are built —
 * always before any of its components can load.
 */
const registry = new Map<string, LookupModule>();

/**
 * Turns a config into the module the screens consume: the five documents, the
 * change subject, the identifier its schema implies, and the permission sets
 * `PermissionSeeder` generates from its name.
 */
export const defineLookup = (config: LookupConfig): LookupModule => {
  const lookup: LookupModule = {
    ...config,
    gql: buildLookupGql(config.entity, config.entityPlural, {
      schema: config.schema,
      saveArg: config.saveArg,
      descriptiveGqlFields: config.descriptiveGqlFields,
      extraGqlFields: config.extraGqlFields,
    }),
    changed$: new Subject(),
    idKey: config.schema === 'uaa' ? 'uid' : 'id',
    viewPermissions: [`ROLE_VIEW_ALL_${config.permission}`, `ROLE_VIEW_${config.permission}`],
    upsertPermissions: [`ROLE_CREATE_${config.permission}`, `ROLE_UPDATE_${config.permission}`],
    deletePermissions: [`ROLE_DELETE_${config.permission}`],
  };

  registry.set(lookup.slug, lookup);
  return lookup;
};

/**
 * The lookup a generated route is for. Throws rather than rendering an empty
 * screen: a miss means the module's registry was never imported, which is a
 * wiring mistake and not something a user should be shown.
 */
export const getLookup = (slug: string): LookupModule => {
  const lookup = registry.get(slug);
  if (!lookup) throw new Error(`No lookup registered for '${slug}'.`);
  return lookup;
};

/** Keyed by slug — everything registered so far. */
export const registeredLookups = (): ReadonlyMap<string, LookupModule> => registry;

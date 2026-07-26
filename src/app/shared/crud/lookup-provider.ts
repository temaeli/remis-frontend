import { DocumentNode } from 'graphql';

/**
 * Contract entities expose so other modules can drop them into select-field
 * configs without importing raw GraphQL documents. Eliminates the leaky seam
 * where `incident.form.ts` reaches into `working-stations/working-station.graphql`
 * by name.
 */
export interface LookupProvider<_T = any> {
  query: DocumentNode | any;
  labelKey: string;
  valueKey: string;
  /** Default GraphQL variables (e.g. `{ active: true }`) forwarded with the lookup query. */
  variables?: Record<string, any>;
}

/**
 * Adapter — turns a LookupProvider into the `optionsVariables` shape that
 * generic-form select fields already understand.
 */
export function lookupOptions(provider: LookupProvider) {
  return {
    fetchParameter: { query: provider.query, variables: provider.variables },
    labelKey: provider.labelKey,
    valueKey: provider.valueKey,
  };
}

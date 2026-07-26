import { getFields, valueIncludes } from '@core/helpers';
import { FetchParameter, SearchField, SearchOperationType, SearchState } from './fetch.interface';
import { PageableParam, SearchCombinationType } from './fetch.interface';
import { ApolloClient } from '@apollo/client';
import { INITIAL_PAGE_PARAMETER, PAGEABLE_PARAM_KEYS } from './fetch.constants';

export function getApolloOptions(fp: FetchParameter) {
  let states: SearchState[] = [];
  const inputs = fp.variables;

  const params = fp?.pageableParam ?? fp?.variables?.pageableParam;
  const inputsParam = inputs?.['pageableParam'];

  const options: Partial<ApolloClient.QueryOptions & ApolloClient.MutateOptions> = {
    fetchPolicy: fp.fetchPolicy as any ?? 'network-only',
  };

  if (fp.query) (options as ApolloClient.QueryOptions).query = fp.query;
  if (fp.mutation) (options as ApolloClient.MutateOptions).mutation = fp.mutation;

  if (!Array.isArray(fp.searchStates)) {
    if (fp.searchStates?.['key']) states = [(fp.searchStates as any)];
    else states = getFields(fp.searchStates);
  } else states = fp.searchStates;

  const searchFields: SearchField[] = [
    ...(params?.searchFields ?? []),
    ...(statesToSearchFields(states) ?? []),
  ] as any;

  const pageableParam: PageableParam = {
    ...INITIAL_PAGE_PARAMETER,
    size: params?.size ?? inputsParam?.size ?? 10,
    sortBy: params?.sortBy ?? inputsParam?.sortBy?.sortBy ?? 'id',
    sortDirection: params?.sortDirection ?? inputsParam?.sortBy?.sortDirection ?? 'DESC',
    first: params?.first ?? inputsParam?.first ?? 0,

    searchCombinationType:
      params?.searchCombinationType ??
      inputsParam?.SearchCombinationType ??
      SearchCombinationType.And,
  };

  if (searchFields.length) pageableParam.searchFields = searchFields;
  else delete pageableParam.searchFields;

  if (inputs || pageableParam) {
    const keys = [...getQueryKeys(fp.query ?? fp.mutation)];
    let pi = undefined;
    const variables: Record<string, any> = {};
    const paged = (pi = keys?.findIndex((k) => valueIncludes(k, PAGEABLE_PARAM_KEYS))) > -1;

    if (paged) (variables[keys[pi]] = pageableParam) && keys.splice(pi, 1);
    if (Array.isArray(inputs)) keys?.forEach((key: any, i) => (variables[key] = inputs[key]));
    else if (typeof inputs === 'object') keys?.forEach((key) => (variables[key] = inputs[key]));
    options.variables = variables;
  }

  if (fp.handleException === false) options.errorPolicy = 'ignore';

  return options;
}

export function statesToSearchFields(states: SearchState[]): Partial<SearchField[]> {
  const isValue = (s: any) => !!s.value || s.value === false || s.value === 0;
  states = states?.filter((s) => isValue(s)) ?? [];

  const searchFields = states?.map((state) => ({
    fieldName: state.key,
    fieldValue: typeof state.value === 'string' ? state.value.trim() : state.value,
    searchType: state?.searchType ?? SearchOperationType.Like,
  }));

  return searchFields as any;
}

export function getQueryKeys(query: any): string[] {
  const keys = query?.definitions[0]?.variableDefinitions?.map((x: any) => x?.variable?.name?.value);
  return keys ?? [];
}

import { LookupProvider } from '@shared/crud';
import { WasteCategory } from './waste-category.interface';
import { GET_ALL_WASTE_CATEGORIES } from './waste-category.graphql';

export const wasteCategoryLookupProvider: LookupProvider<WasteCategory> = {
  query: GET_ALL_WASTE_CATEGORIES,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};

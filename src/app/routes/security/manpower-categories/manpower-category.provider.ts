import { LookupProvider } from '@shared/crud';
import { ManpowerCategory } from './manpower-category.interface';
import { GET_ALL_MANPOWER_CATEGORIES } from './manpower-category.graphql';

export const manpowerCategoryLookupProvider: LookupProvider<ManpowerCategory> = {
  query: GET_ALL_MANPOWER_CATEGORIES,
  labelKey: 'name',
  valueKey: 'uid',
};

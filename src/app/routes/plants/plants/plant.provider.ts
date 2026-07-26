import { LookupProvider } from '@shared/crud';
import { Plant } from './plant.interface';
import { ALL_PLANT } from './plant.graphql';

export const plantLookupProvider: LookupProvider<Plant> = {
  query: ALL_PLANT,
  labelKey: 'name',
  valueKey: 'uid',
};

import { LookupProvider } from '@shared/crud';
import { PowerGenerator } from './power-generator.interface';
import { GET_ALL_POWER_GENERATORS } from './power-generator.graphql';

export const powerGeneratorLookupProvider: LookupProvider<PowerGenerator> = {
  query: GET_ALL_POWER_GENERATORS,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};

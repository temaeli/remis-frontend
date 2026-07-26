import { LookupProvider } from '@shared/crud';
import { WaterUse } from './water-use.interface';
import { GET_ALL_WATER_USES } from './water-use.graphql';

export const waterUseLookupProvider: LookupProvider<WaterUse> = {
  query: GET_ALL_WATER_USES,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};

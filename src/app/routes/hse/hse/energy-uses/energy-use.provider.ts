import { LookupProvider } from '@shared/crud';
import { EnergyUse } from './energy-use.interface';
import { GET_ALL_ENERGY_USES } from './energy-use.graphql';

export const energyUseLookupProvider: LookupProvider<EnergyUse> = {
  query: GET_ALL_ENERGY_USES,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};

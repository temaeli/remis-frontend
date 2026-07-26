import { LookupProvider } from '@shared/crud';
import { EmissionSubstance } from './emission-substance.interface';
import { GET_ALL_EMISSION_SUBSTANCES } from './emission-substance.graphql';

export const emissionSubstanceLookupProvider: LookupProvider<EmissionSubstance> = {
  query: GET_ALL_EMISSION_SUBSTANCES,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};

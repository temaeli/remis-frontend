import { LookupProvider } from '@shared/crud';
import { PowerGeneratorTank } from './tank.interface';
import { GET_POWER_GENERATOR_TANKS_BY_GENERATOR } from './tank.graphql';

/**
 * Generic tank lookup. Consumers must supply `variables.generatorUid` either
 * as a string (locked-generator mode) or a BehaviorSubject (cascading mode
 * driven by a parent select). See refuel.form.ts for both usages.
 */
export const powerGeneratorTankByGeneratorLookupProvider: LookupProvider<PowerGeneratorTank> = {
  query: GET_POWER_GENERATOR_TANKS_BY_GENERATOR,
  labelKey: 'name',
  valueKey: 'uid',
};

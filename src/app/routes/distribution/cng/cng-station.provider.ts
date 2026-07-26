import { LookupProvider } from '@shared/crud';
import { CngStation } from './cng-station.interface';
import { ALL_CNG_STATIONS } from './cng-station.graphql';

export const cngStationLookupProvider: LookupProvider<CngStation> = {
  query: ALL_CNG_STATIONS,
  labelKey: 'name',
  valueKey: 'uid',
};

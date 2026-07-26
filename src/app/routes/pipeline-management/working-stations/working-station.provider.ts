import { LookupProvider } from '@shared/crud';
import { WorkingStation } from './working-station.interface';
import { GET_ALL_WORKING_STATIONS } from './working-station.graphql';

export const workingStationLookupProvider: LookupProvider<WorkingStation> = {
  query: GET_ALL_WORKING_STATIONS,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};

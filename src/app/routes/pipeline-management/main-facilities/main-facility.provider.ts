import { LookupProvider } from '@shared/crud';
import { MainFacility } from './main-facility.interface';
import { GET_ALL_MAIN_FACILITIES } from './main-facility.graphql';

export const mainFacilityLookupProvider: LookupProvider<MainFacility> = {
  query: GET_ALL_MAIN_FACILITIES,
  labelKey: 'name',
  valueKey: 'uid',
};

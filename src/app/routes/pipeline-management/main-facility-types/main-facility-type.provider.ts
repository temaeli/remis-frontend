import { LookupProvider } from '@shared/crud';
import { MainFacilityType } from './main-facility-type.interface';
import { GET_ALL_MAIN_FACILITY_TYPES } from './main-facility-type.graphql';

export const mainFacilityTypeLookupProvider: LookupProvider<MainFacilityType> = {
  query: GET_ALL_MAIN_FACILITY_TYPES,
  labelKey: 'name',
  valueKey: 'uid',
};

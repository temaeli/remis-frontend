import { LookupProvider } from '@shared/crud';
import { InspectionType } from './inspection-type.interface';
import { GET_ALL_INSPECTION_TYPES } from './inspection-type.graphql';

export const inspectionTypeLookupProvider: LookupProvider<InspectionType> = {
  query: GET_ALL_INSPECTION_TYPES,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};

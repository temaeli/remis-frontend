import { LookupProvider } from '@shared/crud';
import { WasteGroup } from './waste-group.interface';
import { GET_ALL_WASTE_GROUPS } from './waste-group.graphql';

export const wasteGroupLookupProvider: LookupProvider<WasteGroup> = {
  query: GET_ALL_WASTE_GROUPS,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};

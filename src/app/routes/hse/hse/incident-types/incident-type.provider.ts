import { LookupProvider } from '@shared/crud';
import { IncidentType } from './incident-type.interface';
import { GET_ALL_INCIDENT_TYPES } from './incident-type.graphql';

export const incidentTypeLookupProvider: LookupProvider<IncidentType> = {
  query: GET_ALL_INCIDENT_TYPES,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};

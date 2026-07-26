import { LookupProvider } from '@shared/crud';
import { SecurityIncidentType } from './security-incident-type.interface';
import { ALL_SECURITY_INCIDENT_TYPES } from './security-incident-type.graphql';

export const securityIncidentTypeLookupProvider: LookupProvider<SecurityIncidentType> = {
  query: ALL_SECURITY_INCIDENT_TYPES,
  labelKey: 'name',
  valueKey: 'uid',
};

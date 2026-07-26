import { LookupProvider } from '@shared/crud';
import { SecurityIncident } from './security-incident.interface';
import { ALL_SECURITY_INCIDENTS_PAGEABLE } from './security-incident.graphql';

export const securityIncidentLookupProvider: LookupProvider<SecurityIncident> = {
  query: ALL_SECURITY_INCIDENTS_PAGEABLE,
  labelKey: 'referenceNumber',
  valueKey: 'uid',
  variables: { active: true, pageableParam: { size: 1000 } },
};

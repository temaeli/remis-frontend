import { LookupProvider } from '@shared/crud';
import { SecurityContractor } from './security-contractor.interface';
import { ALL_SECURITY_CONTRACTORS } from './security-contractor.graphql';

export const securityContractorLookupProvider: LookupProvider<SecurityContractor> = {
  query: ALL_SECURITY_CONTRACTORS,
  labelKey: 'name',
  valueKey: 'uid',
};

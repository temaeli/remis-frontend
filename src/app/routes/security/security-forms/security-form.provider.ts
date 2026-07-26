import { LookupProvider } from '@shared/crud';
import { SecurityForm } from './security-form.interface';
import { ALL_SECURITY_FORMS } from './security-form.graphql';

export const securityFormLookupProvider: LookupProvider<SecurityForm> = {
  query: ALL_SECURITY_FORMS,
  labelKey: 'name',
  valueKey: 'uid',
};

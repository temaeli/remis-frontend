import { LookupProvider } from '@shared/crud';
import { SecurityGuard } from './security-guard.interface';
import { ALL_SECURITY_GUARDS_PAGEABLE } from './security-guard.graphql';

export const securityGuardLookupProvider: LookupProvider<SecurityGuard> = {
  query: ALL_SECURITY_GUARDS_PAGEABLE,
  labelKey: 'fullName',
  valueKey: 'uid',
  variables: { active: true, pageableParam: { size: 1000 } },
};

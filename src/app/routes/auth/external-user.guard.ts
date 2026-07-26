import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard to prevent external users from accessing internal routes
 * External users (with client_id) are redirected to /gas-nomination/external
 * Internal users are allowed to proceed
 */
export const externalUserGuard = (route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Check userType computed signal - 'external' if user has client_id, 'internal' otherwise
  const userType = auth.userType();

  // If user is external, redirect them to external portal
  if (userType === 'external') {
    return router.parseUrl('/portal');
  }

  // Internal users can proceed
  return true;
};

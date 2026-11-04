import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Keeps external users (applicants, `isStaff === false`) out of the staff
 * screens: they are sent to their own portal instead. Staff pass through.
 *
 * Sits on every staff route, including /home and /staff-landing, so an
 * external user who follows a staff link, or lands on `**`, ends up on the
 * portal rather than a screen they cannot use.
 */
export const externalUserGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.userType() === 'external' ? router.parseUrl('/portal') : true;
};

/** The other way round: only external users open /portal; staff go to their modules. */
export const portalGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.userType() === 'external' ? true : router.parseUrl('/staff-landing');
};

/**
 * No dedicated external-user portal currently exists, so this guard is a
 * pass-through for both user types. Kept as a named guard (rather than
 * removed from routes) so a future external-facing destination can be
 * reinstated here without touching route definitions.
 */
export const externalUserGuard = () => true;

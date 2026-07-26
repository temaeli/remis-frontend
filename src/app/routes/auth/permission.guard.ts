import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Track denied routes to prevent infinite loops
const deniedRoutes = new Map<string, number>();
const DENIAL_COOLDOWN = 1000; // 1 second cooldown

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions = route.data['permissions'] as string[];
  const currentUser = authService.user$.value;
  const userPermissions = currentUser?.permissions || [];

  // If no permissions required, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    deniedRoutes.delete(state.url);
    return true;
  }

  // Check if user has at least one of the required permissions
  const hasPermission = requiredPermissions?.some((perm) => userPermissions?.includes(perm));

  if (!hasPermission) {
    const now = Date.now();
    const lastDenial = deniedRoutes.get(state.url);

    // Prevent logging and navigation within cooldown period
    if (!lastDenial || now - lastDenial > DENIAL_COOLDOWN) {
      deniedRoutes.set(state.url, now);

      // Only navigate if not already on safe route
      if (state.url !== '/home' && state.url !== '/') {
        console.warn(`Access denied. Required permissions: ${requiredPermissions?.join(', ')}`);
        router.navigateByUrl('/home', { replaceUrl: true }).catch(() => {
          // Silently catch navigation errors to prevent further loops
        });
      }
    }

    return false;
  }

  // Access granted, clear the denial record
  deniedRoutes.delete(state.url);
  return true;
};

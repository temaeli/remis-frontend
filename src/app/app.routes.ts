import { Settings } from './routes/settings/settings';
import { AuthLayoutComponent } from './routes/auth/auth-layout';
import { TypedRoutes } from '@core';
import { UserModuleComp } from './routes/user/user';
import { externalUserGuard } from './routes/auth/external-user.guard';
import { permissionGuard } from './routes/auth/permission.guard';
import { ResetComponent } from '@routes/auth/register/reset/reset.component';
import { LandManagement } from './routes/land-management/land-management';

export const APP_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./routes/auth/auth.routes'),
  },

  {
    path: 'password-reset/:token',
    component: AuthLayoutComponent,
    children: [{ path: '', component: ResetComponent }],
  },
  {
    path: 'staff-landing',
    canActivate: [externalUserGuard],
    loadComponent: () => import('./routes/staff-landing/staff-landing').then((m) => m.StaffLanding),
    title: 'Modules',
  },
  {
    path: 'home',
    title: 'Home',
    canActivate: [externalUserGuard],
    loadComponent: () => import('./routes/home/home').then((m) => m.Home),
  },
  {
    path: 'user',
    title: 'User',
    component: UserModuleComp,
    data: { isMenu: false, icon: 'user' },
    canActivate: [externalUserGuard],
    loadChildren: () => import('./routes/user/user.routes'),
  },

  {
    path: 'land-management',
    title: 'Land Management',
    component: LandManagement,
    canActivate: [externalUserGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'map',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_LAND_MANAGEMENT_MODULE'],
      // description:
      //   'Register parcels, track status and acquisition history, and control allocation to projects or sale.',
    },
    loadChildren: () => import('./routes/land-management/land-management.routes'),
  },

  {
    path: 'settings',
    title: 'Settings',
    component: Settings,
    canActivate: [externalUserGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'settings',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_SETTINGS_MODULE'],
    },
    loadChildren: () => import('./routes/settings/settings.routes'),
  },

  { path: '**', redirectTo: 'home' },
];

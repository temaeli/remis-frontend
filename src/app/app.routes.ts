import { Settings } from './routes/settings/settings';
import { AuthLayoutComponent } from './routes/auth/auth-layout';
import { TypedRoutes } from '@core';
import { UserModuleComp } from './routes/user/user';
import { externalUserGuard } from './routes/auth/external-user.guard';
import { permissionGuard } from './routes/auth/permission.guard';
import { ResetComponent } from '@routes/auth/register/reset/reset.component';
import { ProjectManagement } from './routes/project-management/project-management';
import { AssetManagement } from './routes/asset-management/asset-management';

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
    path: 'asset-management',
    title: 'Asset Management',
    component: AssetManagement,
    canActivate: [externalUserGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'map',
      visibleFor: ['internal'],
      // ROLE_VIEW_LAND_MANAGEMENT_MODULE is kept alongside the new permission so
      // roles already granted the old module tile do not lose access on rename.
      permissions: ['ROLE_VIEW_ASSET_REGISTRY_MODULE', 'ROLE_VIEW_LAND_MANAGEMENT_MODULE'],
    //   description:
    //     'Classify assets by type, category and subcategory, register them, and record land registrations and verifications.',
    },
    loadChildren: () => import('./routes/asset-management/asset-management.routes'),
  },

  {
    path: 'project-management',
    title: 'Project Management',
    component: ProjectManagement,
    canActivate: [externalUserGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'suitcase',
      visibleFor: ['internal'],
      permissions: ['ROLE_VIEW_PROJECT_DEVELOPMENT_MODULE'],
    //   description:
    //     'Classify projects by category and subcategory, keep the register, link projects to one another, and record costs and master plans.',
    },
    loadChildren: () => import('./routes/project-management/project-management.routes'),
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

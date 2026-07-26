import { Settings } from './routes/settings/settings';
import { AuthLayoutComponent } from './routes/auth/auth-layout';
import { TypedRoutes } from '@core';
import { UserModuleComp } from './routes/user/user';
import { ClientRegistration } from './routes/client-registration/client-registration';
import { Distribution } from './routes/distribution/distribution';
import { PlantsManagement } from './routes/plants/plants.module';
import { PipelineManagementWrapper } from './routes/pipeline-management/pipeline-management-wrapper';
import { ReportsWrapper } from './routes/reports/reports-wrapper';
import { HseWrapper } from './routes/hse/hse-wrapper';
import { SecurityWrapper } from './routes/security/security-wrapper';
import { ConstructionWrapper } from './routes/construction/construction-wrapper';
import { externalUserGuard } from './routes/auth/external-user.guard';
import { authGuard } from './routes/auth/auth-guard';
import { permissionGuard } from './routes/auth/permission.guard';
import { InquiriesManagement } from './routes/inquiries/inquiries.module';
import { Portal } from '@routes/portal/portal';
import { GasNomination } from '@routes/gas-nomination/gas-nomination';
import { ComplianceManagement } from '@routes/compliance/compliance.module';
import { ResetComponent } from '@routes/auth/register/reset/reset.component';

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
    component: AuthLayoutComponent,
    canActivate: [externalUserGuard],
    children: [{ path: '', loadComponent: () => import('./routes/home/home').then((m) => m.Home) }],
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
    path: 'anonymous',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'inquiry',
        loadComponent: () =>
          import('./routes/inquiries/inquiries/inquiry-form').then((m) => m.InquiryForm),
        title: 'Lodge Feedback / Complaint',
        data: { icon: 'inquiry' },
      },
    ],
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
      permissions: ['SETTINGS_MODULE'],
    },
    loadChildren: () => import('./routes/settings/settings.routes'),
  },
  {
    path: 'gas-nomination',
    title: 'Nomination',
    component: GasNomination,
    canActivate: [authGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'natural_gas',
      visibleFor: ['internal', 'external'],
      permissions: ['NOMINATION_MODULE'],
    },
    loadChildren: () => import('./routes/gas-nomination/gas-nomination.routes'),
  },
  {
    path: 'portal',
    title: 'Portal',
    component: Portal,
    canActivate: [authGuard],
    data: { icon: 'natural_gas', visibleFor: ['external'] },
    loadChildren: () => import('./routes/portal/portal.routes'),
  },
  {
    path: 'distribution',
    title: 'Distribution',
    component: Distribution,
    canActivate: [authGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'natural_gas',
      visibleFor: ['internal'],
      permissions: ['DISTRIBUTION_MODULE'],
    },
    loadChildren: () => import('./routes/distribution/distribution.routes'),
  },
  {
    path: 'construction',
    title: 'Construction',
    component: ConstructionWrapper,
    canActivate: [authGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'hammer',
      visibleFor: ['internal'],
      permissions: ['CONSTRUCTION_MODULE'],
    },
    loadChildren: () => import('./routes/construction/construction.routes'),
  },
  {
    path: 'client-registration',
    title: 'Customer Registration',
    component: ClientRegistration,
    canActivate: [authGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'registrations',
      visibleFor: ['internal'],
      permissions: ['CUSTOMER_REGISTRATION_MODULE'],
    },
    loadChildren: () => import('./routes/client-registration/client-registration.routes'),
  },

  {
    path: 'plants-management',
    title: 'Plants Management',
    component: PlantsManagement,
    canActivate: [externalUserGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'factory',
      visibleFor: ['internal'],
      permissions: ['PLANTS_MANAGEMENT_MODULE'],
    },
    loadChildren: () => import('./routes/plants/plants.routes'),
  },

  {
    path: 'inquiries-management',
    title: 'Feedback / Complaint',
    component: InquiriesManagement,
    canActivate: [externalUserGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'inquiry',
      visibleFor: ['internal'],
      permissions: ['INQUIRIES_MANAGEMENT_MODULE'],
    },
    loadChildren: () => import('./routes/inquiries/inquiries.routes'),
  },

  {
    path: 'pipeline-management',
    title: 'Pipeline Management',
    component: PipelineManagementWrapper,
    canActivate: [externalUserGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'network',
      visibleFor: ['internal'],
      permissions: ['PIPELINE_MANAGEMENT_MODULE'],
    },
    loadChildren: () => import('./routes/pipeline-management/pipeline-management.routes'),
  },

  {
    path: 'reports',
    title: 'Reports',
    component: ReportsWrapper,
    canActivate: [externalUserGuard, permissionGuard],
    data: {
      isMenu: true,
      icon: 'report',
      visibleFor: ['internal'],
      permissions: ['REPORTS_MODULE'],
    },
    loadChildren: () => import('./routes/reports/reports.routes'),
  },

  {
    path: 'hse',
    title: 'HSE',
    component: HseWrapper,
    canActivate: [externalUserGuard],
    data: {
      isMenu: true,
      icon: 'helmet',
      visibleFor: ['internal'],
      permissions: ['HSE_MODULE'],
    },
    loadChildren: () => import('./routes/hse/hse.routes'),
  },

  {
    path: 'security',
    title: 'Security',
    component: SecurityWrapper,
    canActivate: [externalUserGuard],
    data: {
      isMenu: true,
      icon: 'shield_pending',
      visibleFor: ['internal'],
      permissions: ['SECURITY_MODULE'],
    },
    loadChildren: () => import('./routes/security/security.routes'),
  },

  {
    path: 'compliance',
    title: 'Compliance',
    component: ComplianceManagement,
    canActivate: [authGuard, externalUserGuard],
    data: {
      isMenu: true,
      icon: 'certificate',
      visibleFor: ['internal'],
      permissions: ['COMPLIANCE_MODULE'],
    },
    loadChildren: () => import('./routes/compliance/compliance.routes'),
  },

  { path: '**', redirectTo: 'home' },
];

import { TypedRoutes } from '@core';
import { permissionGuard } from '@routes/auth/permission.guard';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const COMPLIANCE_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    data: { isMenu: true, name: 'Dashboard', icon: 'dashboard' },
    loadComponent: () =>
      import('./compliance-dashboard/compliance-dashboard').then((m) => m.ComplianceDashboard),
  },

  // ---contract-registration---
  {
    path: 'contract-registrations',
    data: {
      isMenu: true,
      name: 'Contracts',
      icon: 'contract',
      permissions: ['ROLE_VIEW_CONTRACT_REGISTRATION', 'ROLE_VIEW_ALL_CONTRACT_REGISTRATION'],
    },
    loadComponent: () =>
      import('./contract-registrations/contract-registrations.component').then(
        (m) => m.ContractRegistrationsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'contract-registrations', 'contractRegistrationUid'),
    data: { permissions: ['ROLE_VIEW_CONTRACT_REGISTRATION'] },
    loadComponent: () =>
      import('./contract-registrations/contract-registration.component').then(
        (m) => m.ContractRegistrationComponent,
      ),
  },

  // ---case-registrations---
  {
    path: 'case-registrations',
    data: {
      isMenu: true,
      name: 'Cases',
      icon: 'case',
      permissions: ['ROLE_VIEW_CASE_REGISTRATION', 'ROLE_VIEW_ALL_CASE_REGISTRATION'],
    },
    loadComponent: () =>
      import('./case-registrations/case-registrations.component').then(
        (m) => m.CaseRegistrationsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'case-registrations', 'caseRegistrationUid'),
    data: { permissions: ['ROLE_VIEW_CASE_REGISTRATION'] },
    loadComponent: () =>
      import('./case-registrations/case-registration.component').then(
        (m) => m.CaseRegistrationComponent,
      ),
  },

  // ---insurance-registration---
  {
    path: 'insurance-registrations',
    data: {
      isMenu: true,
      name: 'Insurance',
      icon: 'insurance',
      permissions: ['ROLE_VIEW_INSURANCE_REGISTRATION', 'ROLE_VIEW_ALL_INSURANCE_REGISTRATION'],
    },
    loadComponent: () =>
      import('./insurance-registrations/insurance-registrations.component').then(
        (m) => m.InsuranceRegistrationsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'insurance-registrations', 'insuranceRegistrationUid'),
    data: { permissions: ['ROLE_VIEW_INSURANCE_REGISTRATION'] },
    loadComponent: () =>
      import('./insurance-registrations/insurance-registration.component').then(
        (m) => m.InsuranceRegistrationComponent,
      ),
  },

  // ---licence-registration---
  {
    path: 'licence-registrations',
    data: {
      isMenu: true,
      name: 'Licences',
      icon: 'licence',
      permissions: ['ROLE_VIEW_LICENCE_REGISTRATION', 'ROLE_VIEW_ALL_LICENCE_REGISTRATION'],
    },
    loadComponent: () =>
      import('./licence-registrations/licence-registrations.component').then(
        (m) => m.LicenceRegistrationsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'licence-registrations', 'licenceRegistrationUid'),
    data: { permissions: ['ROLE_VIEW_LICENCE_REGISTRATION'] },
    loadComponent: () =>
      import('./licence-registrations/licence-registration.component').then(
        (m) => m.LicenceRegistrationComponent,
      ),
  },

  // ---meeting-registration---
  {
    path: 'meeting-registrations',
    data: {
      isMenu: true,
      name: 'Meetings',
      icon: 'meeting',
      permissions: ['ROLE_VIEW_MEETING_REGISTRATION', 'ROLE_VIEW_ALL_MEETING_REGISTRATION'],
    },
    loadComponent: () =>
      import('./meeting-registrations/meeting-registrations.component').then(
        (m) => m.MeetingRegistrationsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'meeting-registrations', 'meetingRegistrationUid'),
    data: { permissions: ['ROLE_VIEW_MEETING_REGISTRATION'] },
    loadComponent: () =>
      import('./meeting-registrations/meeting-registration.component').then(
        (m) => m.MeetingRegistrationComponent,
      ),
  },

  // ---opinion-registration---
  {
    path: 'opinion-registrations',
    data: {
      isMenu: true,
      name: 'Opinions',
      icon: 'comment',
      permissions: ['ROLE_VIEW_OPINION_REGISTRATION', 'ROLE_VIEW_ALL_OPINION_REGISTRATION'],
    },
    loadComponent: () =>
      import('./opinion-registrations/opinion-registrations.component').then(
        (m) => m.OpinionRegistrationsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'opinion-registrations', 'opinionRegistrationUid'),

    data: { permissions: ['ROLE_VIEW_OPINION_REGISTRATION'] },
    loadComponent: () =>
      import('./opinion-registrations/opinion-registration.component').then(
        (m) => m.OpinionRegistrationComponent,
      ),
  },

  // ---policy-registration---
  {
    path: 'policy-registrations',
    data: {
      isMenu: true,
      name: 'Policies',
      icon: 'policy',
      permissions: ['ROLE_VIEW_POLICY_REGISTRATION', 'ROLE_VIEW_ALL_POLICY_REGISTRATION'],
    },
    loadComponent: () =>
      import('./policy-registrations/policy-registrations.component').then(
        (m) => m.PolicyRegistrationsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'policy-registrations', 'policyRegistrationUid'),
    data: { permissions: ['ROLE_VIEW_POLICY_REGISTRATION'] },
    loadComponent: () =>
      import('./policy-registrations/policy-registration.component').then(
        (m) => m.PolicyRegistrationComponent,
      ),
  },
];

export default COMPLIANCE_ROUTES;

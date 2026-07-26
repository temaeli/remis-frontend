import { TypedRoutes } from '@core';
import { matchRoute } from '@shared/components/view-component/view.helpers';

export const SECURITY_ROUTES: TypedRoutes = [
  {
    path: '',
    redirectTo: 'security-dashboard',
    pathMatch: 'full',
  },

  // Security Dashboard
  {
    path: 'security-dashboard',
    data: {
      isMenu: true,
      name: 'Security Dashboard',
      icon: 'dashboard',
      permissions: ['ROLE_VIEW_SECURITY_DASHBOARD'],
    },
    loadComponent: () =>
      import('./security-dashboard/security-dashboard').then((m) => m.SecurityDashboard),
  },

  // Configuration (group)
  {
    path: '',
    data: { name: 'Configuration', icon: 'settings', isMenu: true },
    children: [
      // Security Incident Types
      {
        path: 'security-incident-types',
        data: {
          isMenu: true,
          name: 'Security Incident Types',
          icon: 'category',
          permissions: ['ROLE_VIEW_SECURITY_INCIDENT_TYPE'],
        },
        loadComponent: () =>
          import('./security-incident-types/security-incident-types').then(
            (m) => m.SecurityIncidentTypes,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'security-incident-types', 'securityIncidentTypeUid'),
        data: { permissions: ['ROLE_VIEW_SECURITY_INCIDENT_TYPE'] },
        loadComponent: () =>
          import('./security-incident-types/security-incident-type-detail.component').then(
            (m) => m.SecurityIncidentTypeDetailComponent,
          ),
      },

      // Security Contractors
      {
        path: 'security-contractors',
        data: {
          isMenu: true,
          name: 'Security Contractors',
          icon: 'group',
          permissions: ['ROLE_VIEW_SECURITY_CONTRACTOR'],
        },
        loadComponent: () =>
          import('./security-contractors/security-contractors').then((m) => m.SecurityContractors),
      },
      {
        matcher: (url) => matchRoute(url, 'security-contractors', 'securityContractorUid'),
        data: { permissions: ['ROLE_VIEW_SECURITY_CONTRACTOR'] },
        loadComponent: () =>
          import('./security-contractors/security-contractor-detail.component').then(
            (m) => m.SecurityContractorDetailComponent,
          ),
      },

      // Manpower Categories
      {
        path: 'manpower-categories',
        data: {
          isMenu: true,
          name: 'Manpower Categories',
          icon: 'category',
          permissions: ['ROLE_VIEW_MANPOWER_CATEGORY'],
        },
        loadComponent: () =>
          import('./manpower-categories/manpower-categories').then((m) => m.ManpowerCategories),
      },
      {
        matcher: (url) => matchRoute(url, 'manpower-categories', 'manpowerCategoryUid'),
        data: { permissions: ['ROLE_VIEW_MANPOWER_CATEGORY'] },
        loadComponent: () =>
          import('./manpower-categories/manpower-category-detail.component').then(
            (m) => m.ManpowerCategoryDetailComponent,
          ),
      },

      // Workstation Man Hours (per-category rate per working station)
      {
        path: 'workstation-manhours',
        data: {
          isMenu: true,
          name: 'Workstation Man Hours',
          icon: 'schedule',
          permissions: ['ROLE_VIEW_WORKSTATION_MANHOUR'],
        },
        loadComponent: () =>
          import('./workstation-manhours/workstation-manhours').then((m) => m.WorkStationManHours),
      },
      {
        matcher: (url) => matchRoute(url, 'workstation-manhours', 'workStationManHourUid'),
        data: { permissions: ['ROLE_VIEW_WORKSTATION_MANHOUR'] },
        loadComponent: () =>
          import('./workstation-manhours/workstation-manhour-detail.component').then(
            (m) => m.WorkStationManHourDetailComponent,
          ),
      },
    ],
  },

  // Forms (group)
  {
    path: '',
    data: { name: 'Forms', icon: 'document_settings', isMenu: true },
    children: [
      // Security Forms
      {
        path: 'security-forms',
        data: {
          isMenu: true,
          name: 'Security Forms',
          icon: 'document_settings',
          permissions: ['ROLE_VIEW_ALL_SECURITY_FORM', 'ROLE_VIEW_SECURITY_FORM'],
        },
        loadComponent: () => import('./security-forms/security-forms').then((m) => m.SecurityForms),
      },
      {
        matcher: (url) => matchRoute(url, 'security-forms', 'securityFormUid'),
        data: { permissions: ['ROLE_VIEW_ALL_SECURITY_FORM', 'ROLE_VIEW_SECURITY_FORM'] },
        loadComponent: () =>
          import('./security-forms/security-form-detail.component').then(
            (m) => m.SecurityFormDetailComponent,
          ),
      },

      // Form Submissions
      {
        path: 'security-form-submissions',
        data: {
          isMenu: true,
          name: 'Fill Form',
          icon: 'assignment_turned_in',
          permissions: ['ROLE_VIEW_ALL_SECURITY_FORM_SUBMISSION'],
        },
        loadComponent: () =>
          import('./security-form-submissions/security-form-submissions').then(
            (m) => m.SecurityFormSubmissions,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'security-form-submissions', 'securityFormSubmissionUid'),
        data: { permissions: ['ROLE_VIEW_ALL_SECURITY_FORM_SUBMISSION'] },
        loadComponent: () =>
          import('./security-form-submissions/security-form-submission-detail.component').then(
            (m) => m.SecurityFormSubmissionDetailComponent,
          ),
      },
    ],
  },

  // Security Incidents
  {
    path: 'security-incidents',
    data: {
      isMenu: true,
      name: 'Security Incidents',
      icon: 'report',
      permissions: ['ROLE_VIEW_ALL_SECURITY_INCIDENT', 'ROLE_VIEW_SECURITY_INCIDENT'],
    },
    loadComponent: () =>
      import('./security-incidents/security-incidents').then((m) => m.SecurityIncidents),
  },
  {
    matcher: (url) => matchRoute(url, 'security-incidents', 'securityIncidentUid'),
    data: { permissions: ['ROLE_VIEW_ALL_SECURITY_INCIDENT', 'ROLE_VIEW_SECURITY_INCIDENT'] },
    loadComponent: () =>
      import('./security-incidents/security-incident-detail.component').then(
        (m) => m.SecurityIncidentDetailComponent,
      ),
  },

  // ---security-reports---
  {
    path: 'security-reports',
    data: {
      isMenu: true,
      name: 'Security Reports',
      icon: 'shield_star',
      permissions: [
        'ROLE_VIEW_ALL_SECURITY_REPORT',
        'ROLE_PROCESS_SECURITY_REPORT_AS_OFFICER',
        'ROLE_PROCESS_SECURITY_REPORT_AS_SHIFT_SUPERVISOR',
        'ROLE_PROCESS_SECURITY_REPORT_AS_SUPERINTENDENT',
        'ROLE_PROCESS_SECURITY_REPORT_AS_PLANT_MANAGER',
      ],
    },
    loadComponent: () =>
      import('../plants/security-reports/security-reports.component').then(
        (m) => m.SecurityReportsComponent,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'security-reports', 'securityReportUid'),
    data: { permissions: ['ROLE_VIEW_SECURITY_REPORT'] },
    loadComponent: () =>
      import('../plants/security-reports/security-report.component').then(
        (m) => m.SecurityReportComponent,
      ),
  },

  // Security Investigations
  {
    path: 'security-investigations',
    data: {
      isMenu: true,
      name: 'Investigations',
      icon: 'policy',
      permissions: ['ROLE_VIEW_ALL_SECURITY_INVESTIGATION', 'ROLE_VIEW_SECURITY_INVESTIGATION'],
    },
    loadComponent: () =>
      import('./security-investigations/security-investigations').then(
        (m) => m.SecurityInvestigations,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'security-investigations', 'securityInvestigationUid'),
    data: {
      permissions: ['ROLE_VIEW_ALL_SECURITY_INVESTIGATION', 'ROLE_VIEW_SECURITY_INVESTIGATION'],
    },
    loadComponent: () =>
      import('./security-investigations/security-investigation-detail.component').then(
        (m) => m.SecurityInvestigationDetailComponent,
      ),
  },

  // Security Action Items
  // (no menu entry; managed in-context from the Investigation detail view)
  {
    matcher: (url) => matchRoute(url, 'security-action-items', 'securityActionItemUid'),
    data: { permissions: ['ROLE_VIEW_ALL_SECURITY_ACTION_ITEM'] },
    loadComponent: () =>
      import('./security-action-items/security-action-item-detail.component').then(
        (m) => m.SecurityActionItemDetailComponent,
      ),
  },

  // Security Gate Passes
  {
    path: 'security-gate-passes',
    data: {
      isMenu: true,
      name: 'Gate Passes',
      icon: 'shield_passed',
      permissions: ['ROLE_VIEW_ALL_SECURITY_GATE_PASS'],
    },
    loadComponent: () =>
      import('./security-gate-passes/security-gate-passes').then((m) => m.SecurityGatePasses),
  },
  {
    matcher: (url) => matchRoute(url, 'security-gate-passes', 'securityGatePassUid'),
    data: { permissions: ['ROLE_VIEW_ALL_SECURITY_GATE_PASS'] },
    loadComponent: () =>
      import('./security-gate-passes/security-gate-pass-detail.component').then(
        (m) => m.SecurityGatePassDetailComponent,
      ),
  },

  // Security Access Events
  {
    path: 'security-access-events',
    data: {
      isMenu: true,
      name: 'Access Events',
      icon: 'password',
      permissions: ['ROLE_VIEW_ALL_SECURITY_ACCESS_EVENT'],
    },
    loadComponent: () =>
      import('./security-access-events/security-access-events').then((m) => m.SecurityAccessEvents),
  },
  {
    matcher: (url) => matchRoute(url, 'security-access-events', 'securityAccessEventUid'),
    data: { permissions: ['ROLE_VIEW_ALL_SECURITY_ACCESS_EVENT', 'ROLE_VIEW_SECURITY_ACCESS_EVENT'] },
    loadComponent: () =>
      import('./security-access-events/security-access-event-detail.component').then(
        (m) => m.SecurityAccessEventDetailComponent,
      ),
  },

  // Security Intelligence Reports
  {
    path: 'security-intelligence-reports',
    data: {
      isMenu: true,
      name: 'Intelligence Reports',
      icon: 'star',
      permissions: ['ROLE_VIEW_SECURITY_INTELLIGENCE'],
    },
    loadComponent: () =>
      import('./security-intelligence-reports/security-intelligence-reports').then(
        (m) => m.SecurityIntelligenceReports,
      ),
  },
  {
    matcher: (url) =>
      matchRoute(url, 'security-intelligence-reports', 'securityIntelligenceReportUid'),
    data: { permissions: ['ROLE_VIEW_SECURITY_INTELLIGENCE'] },
    loadComponent: () =>
      import('./security-intelligence-reports/security-intelligence-report-detail.component').then(
        (m) => m.SecurityIntelligenceReportDetailComponent,
      ),
  },

  // Security Vetting Records
  {
    path: 'security-vetting-records',
    data: {
      isMenu: true,
      name: 'Vetting Records',
      icon: 'reports',
      permissions: ['ROLE_VIEW_SECURITY_VETTING'],
    },
    loadComponent: () =>
      import('./security-vetting-records/security-vetting-records').then(
        (m) => m.SecurityVettingRecords,
      ),
  },
  {
    matcher: (url) => matchRoute(url, 'security-vetting-records', 'securityVettingRecordUid'),
    data: { permissions: ['ROLE_VIEW_SECURITY_VETTING'] },
    loadComponent: () =>
      import('./security-vetting-records/security-vetting-record-detail.component').then(
        (m) => m.SecurityVettingRecordDetailComponent,
      ),
  },

  // Guard Management (group)
  {
    path: '',
    data: { name: 'Guard Management', icon: 'note_book', isMenu: true },
    children: [
      // Security Guards
      {
        path: 'security-guards',
        data: {
          isMenu: true,
          name: 'Security Guards',
          icon: 'note_book',
          permissions: ['ROLE_VIEW_ALL_SECURITY_GUARD'],
        },
        loadComponent: () =>
          import('./security-guards/security-guards').then((m) => m.SecurityGuards),
      },

      {
        matcher: (url) => matchRoute(url, 'security-guards', 'securityGuardUid'),
        data: { permissions: ['ROLE_VIEW_ALL_SECURITY_GUARD'] },
        loadComponent: () =>
          import('./security-guards/security-guard-detail.component').then(
            (m) => m.SecurityGuardDetailComponent,
          ),
      },

      // Guard Rosters
      {
        path: 'security-guard-rosters',
        data: {
          isMenu: true,
          name: 'Guard Rosters',
          icon: 'calendar_month',
          permissions: ['ROLE_VIEW_ALL_SECURITY_GUARD_ROSTER'],
        },
        loadComponent: () =>
          import('./security-guard-rosters/security-guard-rosters').then(
            (m) => m.SecurityGuardRosters,
          ),
      },
      {
        matcher: (url) => matchRoute(url, 'security-guard-rosters', 'securityGuardRosterUid'),
        data: { permissions: ['ROLE_VIEW_ALL_SECURITY_GUARD_ROSTER'] },
        loadComponent: () =>
          import('./security-guard-rosters/security-guard-roster-detail.component').then(
            (m) => m.SecurityGuardRosterDetailComponent,
          ),
      },

      // Guard Attendance
      {
        path: 'security-guard-attendances',
        data: {
          isMenu: true,
          name: 'Guard Attendance',
          icon: 'user',
          permissions: ['ROLE_VIEW_ALL_SECURITY_GUARD_ATTENDANCE'],
        },
        loadComponent: () =>
          import('./security-guard-attendances/security-guard-attendances').then(
            (m) => m.SecurityGuardAttendances,
          ),
      },
    ],
  },

  // Manpower Attendances
  {
    path: 'manpower-attendances',
    data: {
      isMenu: true,
      name: 'Manpower Attendances',
      icon: 'user',
      permissions: ['ROLE_VIEW_MANPOWER_ATTENDANCE'],
    },
    loadComponent: () =>
      import('./manpower-attendances/manpower-attendances').then((m) => m.ManpowerAttendances),
  },
  {
    matcher: (url) => matchRoute(url, 'manpower-attendances', 'manpowerAttendanceUid'),
    data: { permissions: ['ROLE_VIEW_MANPOWER_ATTENDANCE'] },
    loadComponent: () =>
      import('./manpower-attendances/manpower-attendance-detail.component').then(
        (m) => m.ManpowerAttendanceDetailComponent,
      ),
  },

  // Attachments (shared viewer: details + content tabs)
  {
    matcher: (url) => matchRoute(url, 'attachments', 'attachmentUid'),
    loadComponent: () =>
      import('@shared/components/attachment-viewer/attachment-detail.component').then(
        (m) => m.AttachmentDetailComponent,
      ),
  },
];

export default SECURITY_ROUTES;

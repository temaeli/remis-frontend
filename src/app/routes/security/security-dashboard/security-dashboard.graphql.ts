import { gql } from 'apollo-angular';

export const SECURITY_DASHBOARD_COUNTS = gql`
  query securityDashboardCounts {
    securityDashboardCounts {
      activeGuards
      deniedAccessEvents
      gatePassesPendingApproval
      gatePassesApproved
      gatePassesClosed
      gatePassesUnclosed
      incidentsAwaitingReview
      openActionItems
      openIncidents
      rostersAwaitingApproval
      totalIncidents
      totalInvestigations
    }
  }
`;

export const SECURITY_OCCURRENCE_LOG_FEED = gql`
  query securityOccurrenceLogFeed {
    securityOccurrenceLogFeed {
      uid
      referenceNumber
      form { uid name }
      station { uid name }
      periodStart
      periodEnd
      status
      createdAt
    }
  }
`;

export const SECURITY_GUARD_INITIATED_INCIDENTS = gql`
  query securityGuardInitiatedIncidents {
    securityGuardInitiatedIncidents {
      uid
      referenceNumber
      incidentType { uid name }
      station { uid name }
      location
      severity
      reportedByName
      status
      createdAt
    }
  }
`;

export interface SecurityOccurrenceLogEntry {
  uid: string;
  referenceNumber: string;
  form?: { uid: string; name: string };
  station?: { uid: string; name: string };
  periodStart?: string;
  periodEnd?: string;
  status: string;
  createdAt: string;
}

export interface SecurityGuardInitiatedIncident {
  uid: string;
  referenceNumber: string;
  incidentType?: { uid: string; name: string };
  station?: { uid: string; name: string };
  location?: string;
  severity?: string;
  reportedByName?: string;
  status: string;
  createdAt: string;
}

export interface SecurityDashboardDto {
  activeGuards?: number;
  deniedAccessEvents?: number;
  gatePassesPendingApproval?: number;
  gatePassesApproved?: number;
  gatePassesClosed?: number;
  gatePassesUnclosed?: number;
  incidentsAwaitingReview?: number;
  openActionItems?: number;
  openIncidents?: number;
  rostersAwaitingApproval?: number;
  totalIncidents?: number;
  totalInvestigations?: number;
}

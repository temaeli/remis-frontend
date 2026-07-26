import { gql } from '@apollo/client/core';

export const CLIENTS_STATUS_BREAKDOWN = gql`
  query ClientsStatusBreakdown {
    clientsStatusBreakdown {
      status
      count
    }
  }
`;

export const CLIENTS_BY_STREAM_TYPE = gql`
  query ClientsByStreamType {
    clientsByStreamType {
      streamType
      count
    }
  }
`;

export const CUSTOMERS_BY_CATEGORY = gql`
  query CustomersByCategory {
    customersByCategory {
      category
      count
    }
  }
`;

export const CUSTOMER_REGISTRATION_DASHBOARD = gql`
  query CustomerRegistrationDashboard {
    totalClients
    activeClients
    inactiveClients
    pendingApprovalClients
    totalCustomers
    totalGasInstallations
    clientsStatusBreakdown {
      status
      count
    }
    clientsByStreamType {
      streamType
      count
    }
    customersByCategory {
      category
      count
    }
  }
`;

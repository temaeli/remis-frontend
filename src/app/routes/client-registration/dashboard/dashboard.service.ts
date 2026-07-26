import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';

export interface ClientStatusBreakdown {
  status: string;
  count: number;
}

export interface ClientByStreamType {
  streamType: string;
  count: number;
}

export interface CustomerByCategory {
  category: string;
  count: number;
}

export interface CustomerRegistrationDashboardData {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  pendingApprovalClients: number;
  totalCustomers: number;
  totalGasInstallations: number;
  clientsStatusBreakdown: ClientStatusBreakdown[];
  clientsByStreamType: ClientByStreamType[];
  customersByCategory: CustomerByCategory[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private dashboardData = signal<CustomerRegistrationDashboardData | null>(null);
  private loading = signal(false);
  private error = signal<string | null>(null);

  // Export signals for template use
  isLoading = this.loading.asReadonly();
  hasError = computed(() => this.error() !== null);

  // Dashboard metrics
  totalClients = computed(() => this.dashboardData()?.totalClients ?? 0);
  activeClients = computed(() => this.dashboardData()?.activeClients ?? 0);
  inactiveClients = computed(() => this.dashboardData()?.inactiveClients ?? 0);
  pendingApprovalClients = computed(() => this.dashboardData()?.pendingApprovalClients ?? 0);
  totalCustomers = computed(() => this.dashboardData()?.totalCustomers ?? 0);
  totalGasInstallations = computed(() => this.dashboardData()?.totalGasInstallations ?? 0);

  // Breakdown data
  clientsStatusBreakdown = computed(() => this.dashboardData()?.clientsStatusBreakdown ?? []);
  clientsByStreamType = computed(() => this.dashboardData()?.clientsByStreamType ?? []);
  customersByCategory = computed(() => this.dashboardData()?.customersByCategory ?? []);

  async loadDashboardData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Dummy data - using mock data until backend endpoints are implemented
      const dummyData: CustomerRegistrationDashboardData = {
        totalClients: 156,
        activeClients: 142,
        inactiveClients: 8,
        pendingApprovalClients: 6,
        totalCustomers: 1250,
        totalGasInstallations: 89,
        clientsStatusBreakdown: [
          { status: 'APPROVED', count: 142 },
          { status: 'PENDING', count: 6 },
          { status: 'REJECTED', count: 8 },
        ],
        clientsByStreamType: [
          { streamType: 'UP', count: 78 },
          { streamType: 'DOWN', count: 78 },
        ],
        customersByCategory: [
          { category: 'Industrial', count: 456 },
          { category: 'Commercial', count: 378 },
          { category: 'Residential', count: 299 },
          { category: 'Institutional', count: 117 },
        ],
      };

      this.dashboardData.set(dummyData);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard data load error:', err);
    } finally {
      this.loading.set(false);
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { FetchService } from '@shared/fetch/fetch.service';
import {
  DISTRIBUTION_CUSTOMERS_BY_CATEGORY,
  DISTRIBUTION_REPORTS_BY_REGION,
  CONSTRUCTION_SOP_DASHBOARD,
} from './dashboard.graphql';

export interface CustomerCategoryBreakdown {
  categoryUid: string;
  category: string;
  code: string;
  count: number;
}

export interface RegionBreakdown {
  region: string;
  reports: number;
  approvedReports: number;
  totalConsumptionMmscf: number;
  lostTimeInjuries: number;
  nearMissCount: number;
  firstAidCases: number;
  preventiveMaintenanceCompleted: number;
  correctiveMaintenanceCompleted: number;
}

export interface ConstructionSopStatusBreakdown {
  status: string;
  count: number;
  openNonConformities: number;
}

export interface SopUsage {
  sopCatalogUid: string;
  sopCode: string;
  totalRecords: number;
  openRecords: number;
  approvedRecords: number;
}

export interface SopRecordSnapshot {
  uid: string;
  referenceNumber: string;
  sopCode: string;
  location: string;
  executionDate: string;
  status: string;
  fieldEngineerFullName: string;
  supervisorFullName: string;
  openNonConformities: number;
}

export interface ConstructionSopDashboardSummary {
  totalRecords: number;
  openRecords: number;
  approvedRecords: number;
  rejectedRecords: number;
  openNonConformities: number;
  dueSoonNonConformities: number;
  overdueNonConformities: number;
  averageDaysToApprove: number;
  statusBreakdown: ConstructionSopStatusBreakdown[];
  usageBySop: SopUsage[];
  recentRecords: SopRecordSnapshot[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private fs = inject(FetchService);

  private customerCategories = signal<CustomerCategoryBreakdown[]>([]);
  private regions = signal<RegionBreakdown[]>([]);
  private constructionSopSummary = signal<ConstructionSopDashboardSummary | null>(null);
  private loading = signal(false);
  private error = signal<string | null>(null);

  isLoading = this.loading.asReadonly();
  hasError = computed(() => this.error() !== null);

  // Customer categories
  customerCategoryBreakdown = this.customerCategories.asReadonly();
  totalCustomers = computed(() => this.customerCategories().reduce((sum, c) => sum + c.count, 0));

  // Weekly reports by region
  regionBreakdown = this.regions.asReadonly();
  totalWeeklyReports = computed(() => this.regions().reduce((sum, r) => sum + r.reports, 0));
  approvedWeeklyReports = computed(() =>
    this.regions().reduce((sum, r) => sum + r.approvedReports, 0),
  );

  // Construction SOP dashboard
  totalConstructionSops = computed(() => this.constructionSopSummary()?.totalRecords ?? 0);
  openConstructionSops = computed(() => this.constructionSopSummary()?.openRecords ?? 0);
  approvedConstructionSops = computed(() => this.constructionSopSummary()?.approvedRecords ?? 0);
  rejectedConstructionSops = computed(() => this.constructionSopSummary()?.rejectedRecords ?? 0);
  openNonConformities = computed(() => this.constructionSopSummary()?.openNonConformities ?? 0);
  dueSoonNonConformities = computed(
    () => this.constructionSopSummary()?.dueSoonNonConformities ?? 0,
  );
  overdueNonConformities = computed(
    () => this.constructionSopSummary()?.overdueNonConformities ?? 0,
  );
  averageDaysToApprove = computed(() => this.constructionSopSummary()?.averageDaysToApprove ?? 0);
  constructionSopBreakdown = computed(() => this.constructionSopSummary()?.statusBreakdown ?? []);
  sopUsage = computed(() => this.constructionSopSummary()?.usageBySop ?? []);
  recentSopRecords = computed(() => this.constructionSopSummary()?.recentRecords ?? []);

  async loadDashboardData(from?: string, to?: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [customerCategories, regions, constructionSopSummary] = await Promise.all([
        this.fs.fetch({ query: DISTRIBUTION_CUSTOMERS_BY_CATEGORY }),
        this.fs.fetch({ query: DISTRIBUTION_REPORTS_BY_REGION, variables: { from, to } }),
        this.fs.fetch({ query: CONSTRUCTION_SOP_DASHBOARD, variables: { from, to } }),
      ]);

      this.customerCategories.set(customerCategories ?? []);
      this.regions.set(regions ?? []);
      this.constructionSopSummary.set(constructionSopSummary ?? null);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard data load error:', err);
    } finally {
      this.loading.set(false);
    }
  }
}

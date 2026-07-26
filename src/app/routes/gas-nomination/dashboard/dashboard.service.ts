import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { FetchService } from '@shared/fetch/fetch.service';
import {
  NOMINATION_STATUS_BREAKDOWN,
  NOMINATIONS_BY_CLIENT,
  NOMINATIONS_BY_PLANT,
} from './dashboard.graphql';

export interface NominationStatusBreakdown {
  status: string;
  count: number;
  totalQuantityMmscfd: number;
}

export interface NominationsByClient {
  clientUid: string;
  clientName: string;
  clientStreamType: string;
  nominations: number;
  totalRequestedMmscfd: number;
  belowMinimumCount: number;
  aboveMaximumCount: number;
  lateCount: number;
}

export interface NominationsByPlant {
  plantUid: string;
  plantCode: string;
  plantName: string;
  batches: number;
  totalAllocatedMmscfd: number;
  totalUpstreamerConfirmedMmscfd: number;
  pendingUpstreamerReply: number;
}

const PROBLEM_STATUSES = ['LATE', 'REJECTED'];

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private fs = inject(FetchService);

  private statusBreakdown = signal<NominationStatusBreakdown[]>([]);
  private byClient = signal<NominationsByClient[]>([]);
  private byPlant = signal<NominationsByPlant[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  isLoading = this.loading.asReadonly();
  hasError = computed(() => this.error() !== null);

  nominationStatusBreakdown = this.statusBreakdown.asReadonly();
  nominationsByClient = this.byClient.asReadonly();
  nominationsByPlant = this.byPlant.asReadonly();

  // Derived summary metrics — the backend has no single dashboard-summary
  // query, so these are rolled up client-side from the three breakdowns.
  totalNominations = computed(() =>
    this.statusBreakdown().reduce((sum, s) => sum + s.count, 0),
  );
  totalRequestedQuantity = computed(() =>
    this.statusBreakdown().reduce((sum, s) => sum + (s.totalQuantityMmscfd ?? 0), 0),
  );
  problemNominations = computed(() =>
    this.statusBreakdown()
      .filter((s) => PROBLEM_STATUSES.includes(s.status))
      .reduce((sum, s) => sum + s.count, 0),
  );
  completedNominations = computed(
    () => this.statusBreakdown().find((s) => s.status === 'COMPLETED')?.count ?? 0,
  );
  totalNominationBatches = computed(() => this.byPlant().reduce((sum, p) => sum + p.batches, 0));
  pendingUpstreamerReplies = computed(() =>
    this.byPlant().reduce((sum, p) => sum + p.pendingUpstreamerReply, 0),
  );

  async loadDashboardData(from?: string, to?: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [statusBreakdown, byClient, byPlant] = await Promise.all([
        this.fs.fetch({ query: NOMINATION_STATUS_BREAKDOWN, variables: { from, to } }),
        this.fs.fetch({ query: NOMINATIONS_BY_CLIENT, variables: { from, to } }),
        this.fs.fetch({ query: NOMINATIONS_BY_PLANT, variables: { from, to } }),
      ]);

      this.statusBreakdown.set(statusBreakdown ?? []);
      this.byClient.set(byClient ?? []);
      this.byPlant.set(byPlant ?? []);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard data load error:', err);
    } finally {
      this.loading.set(false);
    }
  }
}

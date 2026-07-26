import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-client-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);

  // Export service signals for template use
  totalNominations = this.dashboardService.totalNominations;
  totalRequestedQuantity = this.dashboardService.totalRequestedQuantity;
  problemNominations = this.dashboardService.problemNominations;
  completedNominations = this.dashboardService.completedNominations;
  totalNominationBatches = this.dashboardService.totalNominationBatches;
  pendingUpstreamerReplies = this.dashboardService.pendingUpstreamerReplies;

  nominationStatusBreakdown = this.dashboardService.nominationStatusBreakdown;
  nominationsByClient = this.dashboardService.nominationsByClient;
  nominationsByPlant = this.dashboardService.nominationsByPlant;

  isLoading = this.dashboardService.isLoading;

  readonly periodLabel: string;
  private readonly from: string;
  private readonly to: string;

  constructor() {
    const now = new Date();
    const year = now.getFullYear();
    this.from = `${year}-01-01`;
    this.to = now.toISOString().slice(0, 10);
    this.periodLabel = `${year} Year to Date`;
  }

  ngOnInit(): void {
    this.dashboardService.loadDashboardData(this.from, this.to);
  }
}

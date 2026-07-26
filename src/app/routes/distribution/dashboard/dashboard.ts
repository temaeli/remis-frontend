import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard.service';

const SOP_STATUS_BAR_CLASS: Record<string, string> = {
  OPEN: 'bg-blue-500',
  IN_PROGRESS: 'bg-sky-500',
  SUBMITTED: 'bg-amber-500',
  REVIEWED: 'bg-indigo-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
};

@Component({
  selector: 'app-distribution-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);

  // Customer categories
  totalCustomers = this.dashboardService.totalCustomers;
  customerCategoryBreakdown = this.dashboardService.customerCategoryBreakdown;

  // Construction SOPs
  totalConstructionSops = this.dashboardService.totalConstructionSops;
  openConstructionSops = this.dashboardService.openConstructionSops;
  approvedConstructionSops = this.dashboardService.approvedConstructionSops;
  rejectedConstructionSops = this.dashboardService.rejectedConstructionSops;
  openNonConformities = this.dashboardService.openNonConformities;
  dueSoonNonConformities = this.dashboardService.dueSoonNonConformities;
  overdueNonConformities = this.dashboardService.overdueNonConformities;
  averageDaysToApprove = this.dashboardService.averageDaysToApprove;
  constructionSopBreakdown = this.dashboardService.constructionSopBreakdown;
  sopUsage = this.dashboardService.sopUsage;
  recentSopRecords = this.dashboardService.recentSopRecords;

  // Weekly reports by region
  totalWeeklyReports = this.dashboardService.totalWeeklyReports;
  approvedWeeklyReports = this.dashboardService.approvedWeeklyReports;
  regionBreakdown = this.dashboardService.regionBreakdown;

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

  sopStatusBarClass(status: string): string {
    return SOP_STATUS_BAR_CLASS[status] ?? 'bg-gray-400';
  }
}

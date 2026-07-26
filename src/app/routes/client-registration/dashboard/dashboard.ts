import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-client-registration-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);

  // Export service signals for template use
  totalClients = this.dashboardService.totalClients;
  activeClients = this.dashboardService.activeClients;
  inactiveClients = this.dashboardService.inactiveClients;
  pendingApprovalClients = this.dashboardService.pendingApprovalClients;
  totalCustomers = this.dashboardService.totalCustomers;
  totalGasInstallations = this.dashboardService.totalGasInstallations;

  clientsStatusBreakdown = this.dashboardService.clientsStatusBreakdown;
  clientsByStreamType = this.dashboardService.clientsByStreamType;
  customersByCategory = this.dashboardService.customersByCategory;

  isLoading = this.dashboardService.isLoading;

  ngOnInit(): void {
    this.dashboardService.loadDashboardData();
  }
}

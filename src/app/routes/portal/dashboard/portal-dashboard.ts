import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  DashboardService,
  NominationStatusBreakdown,
} from '../../gas-nomination/dashboard/dashboard.service';
import { signal, computed } from '@angular/core';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-4xl font-bold text-gray-900">My Nominations Dashboard</h1>
          <p class="text-gray-600 mt-2 text-lg">Quick overview of your gas nominations</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex items-center justify-center h-96">
          <div class="text-center">
            <mat-spinner diameter="50" class="mx-auto mb-4" />
            <p class="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>

        <!-- Content -->
        <div *ngIf="!isLoading()" class="space-y-8">
          <!-- Metrics Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Nominated Card -->
            <div class="group">
              <mat-card
                class="h-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-l-4 border-blue-500"
              >
                <mat-card-content class="p-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                        Nominated
                      </p>
                      <p class="text-5xl font-bold text-blue-600 mt-3">{{ nominated() }}</p>
                      <p class="text-gray-500 text-xs mt-3">Pending nominations</p>
                    </div>
                    <div class="ml-4">
                      <div class="bg-blue-100 rounded-lg p-4">
                        <mat-icon class="text-blue-600 text-4xl">assignment</mat-icon>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Aggregated Card -->
            <div class="group">
              <mat-card
                class="h-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-l-4 border-green-500"
              >
                <mat-card-content class="p-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                        Aggregated
                      </p>
                      <p class="text-5xl font-bold text-green-600 mt-3">{{ aggregated() }}</p>
                      <p class="text-gray-500 text-xs mt-3">Approved nominations</p>
                    </div>
                    <div class="ml-4">
                      <div class="bg-green-100 rounded-lg p-4">
                        <mat-icon class="text-green-600 text-4xl">check_circle</mat-icon>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Submitted Card -->
            <div class="group">
              <mat-card
                class="h-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-l-4 border-purple-500"
              >
                <mat-card-content class="p-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                        Submitted
                      </p>
                      <p class="text-5xl font-bold text-purple-600 mt-3">{{ submitted() }}</p>
                      <p class="text-gray-500 text-xs mt-3">Total submitted</p>
                    </div>
                    <div class="ml-4">
                      <div class="bg-purple-100 rounded-lg p-4">
                        <mat-icon class="text-purple-600 text-4xl">send</mat-icon>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Summary Section -->
          <mat-card class="shadow-md bg-white">
            <mat-card-content class="p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-8">Summary</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Nominations -->
                <div
                  class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-700 text-sm font-medium">Total Nominations</p>
                      <p class="text-3xl font-bold text-blue-600 mt-2">{{ totalNominations() }}</p>
                    </div>
                    <mat-icon class="text-blue-300 text-4xl">inventory_2</mat-icon>
                  </div>
                </div>

                <!-- Requested Qty -->
                <div
                  class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-700 text-sm font-medium">Requested Qty</p>
                      <p class="text-3xl font-bold text-green-600 mt-2">
                        {{ totalRequestedQuantity() | number: '1.0-1' }}
                      </p>
                      <p class="text-gray-600 text-xs mt-1">MMscfd</p>
                    </div>
                    <mat-icon class="text-green-300 text-4xl">trending_up</mat-icon>
                  </div>
                </div>

                <!-- Problem Items -->
                <div
                  class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-700 text-sm font-medium">Problem Items</p>
                      <p class="text-3xl font-bold text-red-600 mt-2">{{ problemNominations() }}</p>
                    </div>
                    <mat-icon class="text-red-300 text-4xl">warning</mat-icon>
                  </div>
                </div>

                <!-- Batches -->
                <div
                  class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-700 text-sm font-medium">Batches</p>
                      <p class="text-3xl font-bold text-yellow-600 mt-2">
                        {{ totalNominationBatches() }}
                      </p>
                    </div>
                    <mat-icon class="text-yellow-300 text-4xl">layers</mat-icon>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Footer Info -->
          <div class="text-center text-gray-600 text-sm">
            <p>Last updated: {{ currentDate | date: 'medium' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      mat-card {
        border: none;
      }

      mat-card-content {
        padding: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  currentDate = new Date();

  isLoading = this.dashboardService.isLoading;
  totalNominations = this.dashboardService.totalNominations;
  totalRequestedQuantity = this.dashboardService.totalRequestedQuantity;
  problemNominations = this.dashboardService.problemNominations;
  totalNominationBatches = this.dashboardService.totalNominationBatches;

  // Derived signals for the three main metrics
  nominated = computed(() => {
    const breakdown =
      this.dashboardService.nominationStatusBreakdown() as NominationStatusBreakdown[];
    return breakdown.find((b: NominationStatusBreakdown) => b.status === 'NOMINATED')?.count ?? 0;
  });

  aggregated = computed(() => {
    const breakdown =
      this.dashboardService.nominationStatusBreakdown() as NominationStatusBreakdown[];
    return breakdown.find((b: NominationStatusBreakdown) => b.status === 'APPROVED')?.count ?? 0;
  });

  submitted = computed(() => {
    const breakdown =
      this.dashboardService.nominationStatusBreakdown() as NominationStatusBreakdown[];
    return breakdown.find((b: NominationStatusBreakdown) => b.status === 'SUBMITTED')?.count ?? 0;
  });

  ngOnInit(): void {
    this.dashboardService.loadDashboardData();
  }
}

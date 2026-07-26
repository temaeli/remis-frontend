import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

import { CngStore } from '../cng/cng.store';
import { CngService } from '../cng/cng.service';
import { CngMonthlyReport, DistributionReportStatus } from '../cng/cng.interface';

@Component({
  selector: 'app-cng-monthly-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">CNG Monthly Reports</h1>
        <button mat-raised-button color="primary" (click)="createNew()">
          <mat-icon>add</mat-icon>
          New Report
        </button>
      </div>

      <!-- Loading State -->
      <mat-spinner *ngIf="isLoading()" diameter="50" class="mx-auto"></mat-spinner>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded p-4 mb-4">
        <p class="text-red-700">{{ error() }}</p>
      </div>

      <!-- Reports Table -->
      <mat-card *ngIf="!isLoading() && reports().length > 0">
        <table mat-table [dataSource]="reports()" class="w-full">
          <!-- Year Column -->
          <ng-container matColumnDef="year">
            <th mat-header-cell *matHeaderCellDef>Year</th>
            <td mat-cell *matCellDef="let element">{{ element.year }}</td>
          </ng-container>

          <!-- Month Column -->
          <ng-container matColumnDef="month">
            <th mat-header-cell *matHeaderCellDef>Month</th>
            <td mat-cell *matCellDef="let element">{{ element.month }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let element">
              <span
                [ngClass]="{
                  'bg-blue-100 text-blue-800': element.status === 'DRAFT',
                  'bg-yellow-100 text-yellow-800': element.status === 'SUBMITTED',
                  'bg-purple-100 text-purple-800': element.status === 'REVIEWED',
                  'bg-green-100 text-green-800': element.status === 'APPROVED',
                  'bg-red-100 text-red-800': element.status === 'REJECTED',
                }"
                class="px-2 py-1 rounded text-sm"
              >
                {{ element.status }}
              </span>
            </td>
          </ng-container>

          <!-- Created By Column -->
          <ng-container matColumnDef="createdBy">
            <th mat-header-cell *matHeaderCellDef>Created By</th>
            <td mat-cell *matCellDef="let element">{{ element.createdBy?.fullName }}</td>
          </ng-container>

          <!-- Date Column -->
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let element">{{ element.createdAt | date: 'short' }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let element">
              <button
                mat-icon-button
                color="primary"
                (click)="viewReport(element)"
                title="View"
              >
                <mat-icon>visibility</mat-icon>
              </button>
              <button
                *ngIf="element.status === 'DRAFT'"
                mat-icon-button
                color="primary"
                (click)="editReport(element)"
                title="Edit"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="downloadPdf(element.uid)"
                title="Download PDF"
              >
                <mat-icon>picture_as_pdf</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="downloadExcel(element.uid)"
                title="Download Excel"
              >
                <mat-icon>table_chart</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && reports().length === 0" class="text-center text-gray-500 py-8">
        <p>No monthly reports found. Create one to get started.</p>
      </div>
    </div>
  `,
})
export class CngMonthlyReportsComponent implements OnInit {
  private store = inject(CngStore);
  private cngService = inject(CngService);
  private router = inject(Router);

  reports = this.store.monthlyReports;
  isLoading = this.store.isLoadingMonthlyReports;
  error = this.store.monthlyReportsError;

  displayedColumns = ['year', 'month', 'status', 'createdBy', 'createdAt', 'actions'];

  ngOnInit(): void {
    // Load current user's station
    const station = this.store.myCngStation();
    if (station) {
      this.store.loadMonthlyReportsByStation(station.uid);
    }
  }

  createNew(): void {
    this.router.navigate(['/distribution/cng-monthly-report/new']);
  }

  viewReport(report: CngMonthlyReport): void {
    this.router.navigate(['/distribution/cng-monthly-report', report.uid]);
  }

  editReport(report: CngMonthlyReport): void {
    this.router.navigate(['/distribution/cng-monthly-report', report.uid]);
  }

  downloadPdf(uid: string): void {
    this.cngService.cngMonthlyReportPdf(uid).subscribe({
      next: (response) => {
        this.cngService.downloadPdf(response.data, `monthly-report-${uid}.pdf`);
      },
      error: (err) => {
        console.error('Error downloading PDF:', err);
      },
    });
  }

  downloadExcel(uid: string): void {
    this.cngService.cngMonthlyReportXlsx(uid).subscribe({
      next: (response) => {
        this.cngService.downloadXlsx(response.data, `monthly-report-${uid}.xlsx`);
      },
      error: (err) => {
        console.error('Error downloading Excel:', err);
      },
    });
  }
}

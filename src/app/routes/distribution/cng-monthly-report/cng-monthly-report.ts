import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { take } from 'rxjs/operators';

import { CngService } from '../cng/cng.service';
import { CngStore } from '../cng/cng.store';
import { CngMonthlyReportDtoInput, CngProductionSummary } from '../cng/cng.interface';

@Component({
  selector: 'app-cng-monthly-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">{{ isNew ? 'New Monthly Report' : 'Monthly Report' }}</h1>
        <button mat-icon-button routerLink="/distribution/cng-monthly-reports" title="Back">
          <mat-icon>arrow_back</mat-icon>
        </button>
      </div>

      <!-- Loading State -->
      <mat-spinner *ngIf="isLoading" diameter="50" class="mx-auto"></mat-spinner>

      <!-- Tabs -->
      <mat-tab-group *ngIf="!isLoading && form">
        <!-- Report Details Tab -->
        <mat-tab label="Report Details">
          <mat-card [formGroup]="form" class="mt-4">
            <div class="grid grid-cols-2 gap-4 p-6">
              <!-- Year -->
              <mat-form-field appearance="outline">
                <mat-label>Year *</mat-label>
                <input matInput formControlName="year" type="number" />
              </mat-form-field>

              <!-- Month -->
              <mat-form-field appearance="outline">
                <mat-label>Month *</mat-label>
                <mat-select formControlName="month">
                  <mat-option value="">-- Select --</mat-option>
                  <mat-option *ngFor="let m of months" [value]="m.value">
                    {{ m.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Executive Summary -->
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Executive Summary</mat-label>
                <textarea matInput formControlName="executiveSummary" rows="3"></textarea>
              </mat-form-field>

              <!-- HSE Narrative -->
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>HSE Narrative</mat-label>
                <textarea matInput formControlName="hseNarrative" rows="3"></textarea>
              </mat-form-field>

              <!-- Facilities Narrative -->
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Facilities Narrative</mat-label>
                <textarea matInput formControlName="facilitiesNarrative" rows="3"></textarea>
              </mat-form-field>

              <!-- Administration Narrative -->
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Administration Narrative</mat-label>
                <textarea matInput formControlName="administrationNarrative" rows="3"></textarea>
              </mat-form-field>

              <!-- Training Narrative -->
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Training Narrative</mat-label>
                <textarea matInput formControlName="trainingNarrative" rows="3"></textarea>
              </mat-form-field>

              <!-- TANESCO Power Units -->
              <mat-form-field appearance="outline">
                <mat-label>TANESCO Power Units</mat-label>
                <input matInput formControlName="tanescoPowerUnits" type="number" />
              </mat-form-field>

              <!-- Potable Water (m³) -->
              <mat-form-field appearance="outline">
                <mat-label>Potable Water (m³)</mat-label>
                <input matInput formControlName="potableWaterM3" type="number" />
              </mat-form-field>

              <!-- Prepared By -->
              <mat-form-field appearance="outline">
                <mat-label>Prepared By</mat-label>
                <input matInput formControlName="preparedByName" type="text" />
              </mat-form-field>

              <!-- Reviewed By -->
              <mat-form-field appearance="outline">
                <mat-label>Reviewed By</mat-label>
                <input matInput formControlName="reviewedByName" type="text" />
              </mat-form-field>
            </div>
          </mat-card>
        </mat-tab>

        <!-- HSE Statistics Tab -->
        <mat-tab label="HSE Statistics">
          <div class="mt-4">
            <!-- TODO: Implement HSE Statistics sub-table -->
            <p class="text-gray-500">HSE Statistics management - To be implemented</p>
          </div>
        </mat-tab>

        <!-- Maintenance Summary Tab -->
        <mat-tab label="Maintenance Summary">
          <div class="mt-4">
            <!-- TODO: Implement Maintenance Summary sub-table -->
            <p class="text-gray-500">Maintenance Summary management - To be implemented</p>
          </div>
        </mat-tab>

        <!-- Production Summary Tab -->
        <mat-tab label="Production Summary">
          <div class="mt-4">
            <mat-card *ngIf="productionSummary">
              <table mat-table [dataSource]="[productionSummary]" class="w-full">
                <ng-container matColumnDef="metric">
                  <th mat-header-cell *matHeaderCellDef>Metric</th>
                  <td mat-cell *matCellDef="let element">{{ element }}</td>
                </ng-container>

                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef>Value</th>
                  <td mat-cell *matCellDef="let element">{{ element }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['metric', 'value']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['metric', 'value'];"></tr>
              </table>
            </mat-card>
            <p *ngIf="!productionSummary" class="text-gray-500">
              Production summary will be auto-rolled up from daily reports
            </p>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Actions -->
      <div *ngIf="!isLoading && form" class="flex gap-2 justify-end mt-6">
        <button mat-button routerLink="/distribution/cng-monthly-reports">Cancel</button>
        <button
          mat-raised-button
          color="primary"
          (click)="saveReport()"
          [disabled]="form.invalid || isSubmitting"
        >
          <span *ngIf="!isSubmitting">Save Report</span>
          <span *ngIf="isSubmitting">Saving...</span>
        </button>
      </div>
    </div>
  `,
})
export class CngMonthlyReportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cngService = inject(CngService);
  private store = inject(CngStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form: FormGroup | null = null;
  isLoading = false;
  isSubmitting = false;
  isNew = true;
  uid: string | null = null;
  productionSummary: CngProductionSummary | null = null;

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid');
    this.isNew = !this.uid || this.uid === 'new';

    this.initializeForm();

    if (!this.isNew && this.uid) {
      this.loadReport(this.uid);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      year: [new Date().getFullYear(), [Validators.required]],
      month: [new Date().getMonth() + 1, [Validators.required]],
      executiveSummary: [''],
      hseNarrative: [''],
      facilitiesNarrative: [''],
      administrationNarrative: [''],
      trainingNarrative: [''],
      tanescoPowerUnits: [0],
      potableWaterM3: [0],
      preparedByName: [''],
      reviewedByName: [''],
    });
  }

  private loadReport(uid: string): void {
    this.isLoading = true;
    this.cngService
      .findCngMonthlyReport(uid)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          const report = response.data;
          this.form?.patchValue(report);

          // Load production summary
          if (report.station?.uid) {
            this.cngService
              .cngProductionSummary(report.station.uid, report.year, report.month)
              .pipe(take(1))
              .subscribe({
                next: (summary) => {
                  this.productionSummary = summary;
                },
                error: (err) => {
                  console.error('Error loading production summary:', err);
                },
              });
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading report:', err);
          this.isLoading = false;
        },
      });
  }

  saveReport(): void {
    if (!this.form || this.form.invalid) return;

    this.isSubmitting = true;
    const dto: CngMonthlyReportDtoInput = this.form.value;

    if (!this.isNew && this.uid) {
      dto.uid = this.uid;
    }

    this.cngService
      .saveCngMonthlyReport(dto)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          const station = this.store.myCngStation();
          if (station) {
            this.store.loadMonthlyReportsByStation(station.uid);
          }
          this.router.navigate(['/distribution/cng-monthly-reports']);
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error saving report:', err);
          this.isSubmitting = false;
        },
      });
  }
}

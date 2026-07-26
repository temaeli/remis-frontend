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
import { take } from 'rxjs/operators';

import { CngService } from '../cng/cng.service';
import { CngStore } from '../cng/cng.store';
import { CngStationType, CngStationDtoInput } from '../cng/cng.interface';

@Component({
  selector: 'app-cng-station',
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">{{ isNew ? 'New CNG Station' : 'Edit CNG Station' }}</h1>
        <button mat-icon-button routerLink="/distribution/cng-stations" title="Back">
          <mat-icon>arrow_back</mat-icon>
        </button>
      </div>

      <!-- Loading State -->
      <mat-spinner *ngIf="isLoading" diameter="50" class="mx-auto"></mat-spinner>

      <!-- Form -->
      <mat-card *ngIf="!isLoading && form" [formGroup]="form">
        <div class="grid grid-cols-2 gap-4 p-6">
          <!-- Name -->
          <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Station Name *</mat-label>
            <input matInput formControlName="name" type="text" />
          </mat-form-field>

          <!-- Code -->
          <mat-form-field appearance="outline">
            <mat-label>Code (Auto-generated if blank)</mat-label>
            <input matInput formControlName="code" type="text" />
          </mat-form-field>

          <!-- Type -->
          <mat-form-field appearance="outline">
            <mat-label>Station Type</mat-label>
            <mat-select formControlName="stationType">
              <mat-option value="">-- Select --</mat-option>
              <mat-option value="MOTHER">Mother Station</mat-option>
              <mat-option value="DAUGHTER">Daughter Station</mat-option>
              <mat-option value="FILLING">Filling Station</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Region -->
          <mat-form-field appearance="outline">
            <mat-label>Region</mat-label>
            <input matInput formControlName="region" type="text" />
          </mat-form-field>

          <!-- Location -->
          <mat-form-field appearance="outline">
            <mat-label>Location</mat-label>
            <input matInput formControlName="location" type="text" />
          </mat-form-field>

          <!-- Contact -->
          <mat-form-field appearance="outline">
            <mat-label>Contact</mat-label>
            <input matInput formControlName="contact" type="text" />
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end p-6 border-t">
          <button mat-button routerLink="/distribution/cng-stations">Cancel</button>
          <button
            mat-raised-button
            color="primary"
            (click)="saveStation()"
            [disabled]="form.invalid || isSubmitting"
          >
            <span *ngIf="!isSubmitting">Save Station</span>
            <span *ngIf="isSubmitting">Saving...</span>
          </button>
        </div>
      </mat-card>
    </div>
  `,
})
export class CngStationComponent implements OnInit {
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

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid');
    this.isNew = !this.uid || this.uid === 'new';

    this.initializeForm();

    if (!this.isNew && this.uid) {
      this.loadStation(this.uid);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: [''],
      stationType: [''],
      region: [''],
      location: [''],
      contact: [''],
      description: [''],
    });
  }

  private loadStation(uid: string): void {
    this.isLoading = true;
    this.cngService
      .findCngStation(uid)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          const station = response.data;
          this.form?.patchValue(station);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading station:', err);
          this.isLoading = false;
        },
      });
  }

  saveStation(): void {
    if (!this.form || this.form.invalid) return;

    this.isSubmitting = true;
    const dto: CngStationDtoInput = this.form.value;

    if (!this.isNew && this.uid) {
      dto.uid = this.uid;
    }

    this.cngService
      .saveCngStation(dto)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.store.loadCngStations();
          this.router.navigate(['/distribution/cng-stations']);
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error saving station:', err);
          this.isSubmitting = false;
        },
      });
  }
}

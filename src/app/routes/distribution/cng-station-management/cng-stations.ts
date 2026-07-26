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
import { CngStation, CngStationType } from '../cng/cng.interface';

@Component({
  selector: 'app-cng-stations',
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
        <h1 class="text-3xl font-bold">CNG Stations</h1>
        <button mat-raised-button color="primary" (click)="createNew()">
          <mat-icon>add</mat-icon>
          New Station
        </button>
      </div>

      <!-- Loading State -->
      <mat-spinner *ngIf="isLoading()" diameter="50" class="mx-auto"></mat-spinner>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded p-4 mb-4">
        <p class="text-red-700">{{ error() }}</p>
      </div>

      <!-- Stations Table -->
      <mat-card *ngIf="!isLoading() && stations().length > 0">
        <table mat-table [dataSource]="stations()" class="w-full">
          <!-- Code Column -->
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let element">{{ element.code }}</td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let element">{{ element.name }}</td>
          </ng-container>

          <!-- Type Column -->
          <ng-container matColumnDef="stationType">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let element">{{ element.stationType }}</td>
          </ng-container>

          <!-- Region Column -->
          <ng-container matColumnDef="region">
            <th mat-header-cell *matHeaderCellDef>Region</th>
            <td mat-cell *matCellDef="let element">{{ element.region }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let element">
              <button
                mat-icon-button
                color="primary"
                (click)="editStation(element)"
                title="Edit"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                (click)="deleteStation(element.uid)"
                title="Delete"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && stations().length === 0" class="text-center text-gray-500 py-8">
        <p>No CNG stations found. Create one to get started.</p>
      </div>
    </div>
  `,
})
export class CngStationsComponent implements OnInit {
  private store = inject(CngStore);
  private router = inject(Router);

  stations = this.store.cngStations;
  isLoading = this.store.isLoadingStations;
  error = this.store.stationsError;

  displayedColumns = ['code', 'name', 'stationType', 'region', 'actions'];

  ngOnInit(): void {
    this.store.loadCngStations();
  }

  createNew(): void {
    this.router.navigate(['/distribution/cng-station/new']);
  }

  editStation(station: CngStation): void {
    this.router.navigate(['/distribution/cng-station', station.uid]);
  }

  deleteStation(uid: string): void {
    if (confirm('Are you sure you want to delete this station?')) {
      // TODO: Implement delete via service
      console.log('Delete station:', uid);
    }
  }
}

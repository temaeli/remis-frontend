import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { downloadBlob } from '@shared/components/details/util/base-64/base-64.helpers';

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}
import {
  GET_MONTHLY_FUEL_BALANCE,
  GENERATE_MONTHLY_FUEL_BALANCE_REPORT,
} from './tank.graphql';

interface FuelBalance {
  yearMonth?: string;
  fuelOnloaded?: number;
  fuelConsumedEquipment?: number;
  fuelConsumedGenerators?: number;
  totalFuelConsumed?: number;
  totalRunHours?: number;
  balance?: number;
  hasGenerators?: boolean;
}

const MONTHS = [
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

@Component({
  selector: 'tank-monthly-balance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="p-1 flex flex-col gap-3">
      <div class="flex items-end gap-3 flex-wrap">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="min-w-[140px]">
          <mat-label>Year</mat-label>
          <mat-select [(value)]="year" (selectionChange)="load()">
            <mat-option *ngFor="let y of years" [value]="y">{{ y }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="min-w-[180px]">
          <mat-label>Month</mat-label>
          <mat-select [(value)]="month" (selectionChange)="load()">
            <mat-option *ngFor="let m of months" [value]="m.value">{{ m.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <button
          mat-raised-button
          color="primary"
          [disabled]="loading || downloading || !balance"
          (click)="download()"
        >
          <mat-icon>download</mat-icon>
          {{ downloading ? 'Downloading…' : 'Download PDF' }}
        </button>
      </div>

      <div *ngIf="loading" class="py-8 text-center faded text-sm">Loading fuel balance…</div>

      <div
        *ngIf="!loading && !balance"
        class="py-8 text-center faded text-sm"
      >
        No fuel activity recorded for {{ periodLabel() }}.
      </div>

      <div
        *ngIf="!loading && balance"
        class="rounded-lg border border-gray-100 bg-white p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-wider faded">Period</span>
          <span class="text-sm font-medium">{{ balance.yearMonth }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-wider faded">Fuel Onloaded (L)</span>
          <span class="text-sm font-medium tabular-nums">
            {{ (balance.fuelOnloaded ?? 0) | number: '1.0-2' }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-wider faded">Consumed by Equipment (L)</span>
          <span class="text-sm font-medium tabular-nums">
            {{ (balance.fuelConsumedEquipment ?? 0) | number: '1.0-2' }}
          </span>
        </div>
        <div class="flex flex-col" *ngIf="balance.hasGenerators">
          <span class="text-xs uppercase tracking-wider faded">Consumed by Generators (L)</span>
          <span class="text-sm font-medium tabular-nums">
            {{ (balance.fuelConsumedGenerators ?? 0) | number: '1.0-2' }}
          </span>
        </div>
        <div class="flex flex-col" *ngIf="balance.hasGenerators">
          <span class="text-xs uppercase tracking-wider faded">Total Generator Run Hours</span>
          <span class="text-sm font-medium tabular-nums">
            {{ (balance.totalRunHours ?? 0) | number: '1.0-2' }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-wider faded">Total Consumed (L)</span>
          <span class="text-sm font-medium tabular-nums">
            {{ (balance.totalFuelConsumed ?? 0) | number: '1.0-2' }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-wider faded">Closing Balance (L)</span>
          <span
            class="text-lg font-semibold tabular-nums"
            [class.text-danger]="(balance.balance ?? 0) < 0"
            [class.text-success]="(balance.balance ?? 0) >= 0"
          >
            {{ (balance.balance ?? 0) | number: '1.0-2' }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class TankMonthlyBalanceComponent extends BaseComponent implements OnInit {
  @Input() tankUid = '';
  @Input() tankName = 'tank';

  readonly months = MONTHS;
  readonly years: number[] = Array.from(
    { length: new Date().getFullYear() - 2020 + 1 },
    (_, i) => new Date().getFullYear() - i,
  );

  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;

  balance: FuelBalance | null = null;
  loading = false;
  downloading = false;

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  periodLabel(): string {
    const m = this.months.find((it) => it.value === this.month);
    return `${m?.label ?? this.month} ${this.year}`;
  }

  async load(): Promise<void> {
    if (!this.tankUid) return;
    this.loading = true;
    this.balance = null;
    try {
      const res = await this.fs.fetch({
        query: GET_MONTHLY_FUEL_BALANCE,
        variables: { input: { tankUid: this.tankUid, year: this.year, month: this.month } },
      });
      this.balance = res ?? null;
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async download(): Promise<void> {
    if (!this.tankUid || this.downloading) return;
    this.downloading = true;
    try {
      const base64: string | null = await this.fs.fetch({
        notify: true,
        query: GENERATE_MONTHLY_FUEL_BALANCE_REPORT,
        variables: { input: { tankUid: this.tankUid, year: this.year, month: this.month } },
      });
      if (!base64) return;
      const blob = base64ToBlob(base64, 'application/pdf');
      const period = `${this.year}-${String(this.month).padStart(2, '0')}`;
      const safeName = (this.tankName || 'tank').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
      downloadBlob(blob, `${safeName}-fuel-balance-${period}.pdf`);
    } finally {
      this.downloading = false;
      this.cdr.detectChanges();
    }
  }
}

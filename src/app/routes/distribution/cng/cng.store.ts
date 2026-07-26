import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  CngStation,
  CngDailyReport,
  CngMonthlyReport,
  CngProductionSummary,
} from './cng.interface';
import { CngService } from './cng.service';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CngStore {
  private cngService = inject(CngService);

  // ==================== CNG STATION SIGNALS ====================
  
  cngStations = signal<CngStation[]>([]);
  selectedCngStation = signal<CngStation | null>(null);
  myCngStation = signal<CngStation | null>(null);
  isLoadingStations = signal(false);
  stationsError = signal<string | null>(null);

  // ==================== CNG DAILY REPORT SIGNALS ====================
  
  dailyReports = signal<CngDailyReport[]>([]);
  selectedDailyReport = signal<CngDailyReport | null>(null);
  isLoadingDailyReports = signal(false);
  dailyReportsError = signal<string | null>(null);

  // ==================== CNG MONTHLY REPORT SIGNALS ====================
  
  monthlyReports = signal<CngMonthlyReport[]>([]);
  selectedMonthlyReport = signal<CngMonthlyReport | null>(null);
  isLoadingMonthlyReports = signal(false);
  monthlyReportsError = signal<string | null>(null);
  productionSummary = signal<CngProductionSummary | null>(null);

  // ==================== COMPUTED SIGNALS ====================

  hasStations = computed(() => this.cngStations().length > 0);
  hasDailyReports = computed(() => this.dailyReports().length > 0);
  hasMonthlyReports = computed(() => this.monthlyReports().length > 0);

  constructor() {
    // Load user's CNG station on initialization
    this.loadMyCngStation();
  }

  // ==================== CNG STATION METHODS ====================

  /**
   * Load all CNG stations
   */
  loadCngStations(): void {
    this.isLoadingStations.set(true);
    this.stationsError.set(null);

    this.cngService
      .allCngStations()
      .pipe(take(1))
      .subscribe({
        next: (stations) => {
          this.cngStations.set(stations);
          this.isLoadingStations.set(false);
        },
        error: (err) => {
          this.stationsError.set(err?.message || 'Failed to load CNG stations');
          this.isLoadingStations.set(false);
        },
      });
  }

  /**
   * Load the current user's assigned CNG station
   */
  loadMyCngStation(): void {
    this.cngService
      .myCngStation()
      .pipe(take(1))
      .subscribe({
        next: (station) => {
          this.myCngStation.set(station);
        },
        error: (err) => {
          console.error('Failed to load user CNG station:', err);
        },
      });
  }

  /**
   * Select a CNG station
   */
  selectCngStation(station: CngStation | null): void {
    this.selectedCngStation.set(station);
  }

  /**
   * Create or update a CNG station
   */
  saveCngStation(station: CngStation | null): void {
    if (station) {
      this.selectedCngStation.set(station);
    }
  }

  /**
   * Clear CNG station selection
   */
  clearSelectedStation(): void {
    this.selectedCngStation.set(null);
  }

  // ==================== CNG DAILY REPORT METHODS ====================

  /**
   * Load daily reports for a specific station
   */
  loadDailyReportsByStation(stationUid: string): void {
    this.isLoadingDailyReports.set(true);
    this.dailyReportsError.set(null);

    this.cngService
      .cngDailyReportsByStation(stationUid)
      .pipe(take(1))
      .subscribe({
        next: (reports) => {
          this.dailyReports.set(reports);
          this.isLoadingDailyReports.set(false);
        },
        error: (err) => {
          this.dailyReportsError.set(err?.message || 'Failed to load daily reports');
          this.isLoadingDailyReports.set(false);
        },
      });
  }

  /**
   * Select a daily report
   */
  selectDailyReport(report: CngDailyReport | null): void {
    this.selectedDailyReport.set(report);
  }

  /**
   * Clear daily report selection
   */
  clearSelectedDailyReport(): void {
    this.selectedDailyReport.set(null);
  }

  // ==================== CNG MONTHLY REPORT METHODS ====================

  /**
   * Load monthly reports for a specific station
   */
  loadMonthlyReportsByStation(stationUid: string): void {
    this.isLoadingMonthlyReports.set(true);
    this.monthlyReportsError.set(null);

    this.cngService
      .cngMonthlyReportsByStation(stationUid)
      .pipe(take(1))
      .subscribe({
        next: (reports) => {
          this.monthlyReports.set(reports);
          this.isLoadingMonthlyReports.set(false);
        },
        error: (err) => {
          this.monthlyReportsError.set(err?.message || 'Failed to load monthly reports');
          this.isLoadingMonthlyReports.set(false);
        },
      });
  }

  /**
   * Load production summary for a specific month
   */
  loadProductionSummary(stationUid: string, year: number, month: number): void {
    this.cngService
      .cngProductionSummary(stationUid, year, month)
      .pipe(take(1))
      .subscribe({
        next: (summary) => {
          this.productionSummary.set(summary);
        },
        error: (err) => {
          console.error('Failed to load production summary:', err);
        },
      });
  }

  /**
   * Select a monthly report
   */
  selectMonthlyReport(report: CngMonthlyReport | null): void {
    this.selectedMonthlyReport.set(report);
  }

  /**
   * Clear monthly report selection
   */
  clearSelectedMonthlyReport(): void {
    this.selectedMonthlyReport.set(null);
  }

  // ==================== CLEAR ALL STATE ====================

  /**
   * Clear all CNG-related state
   */
  clearAll(): void {
    this.cngStations.set([]);
    this.selectedCngStation.set(null);
    this.myCngStation.set(null);
    this.stationsError.set(null);

    this.dailyReports.set([]);
    this.selectedDailyReport.set(null);
    this.dailyReportsError.set(null);

    this.monthlyReports.set([]);
    this.selectedMonthlyReport.set(null);
    this.monthlyReportsError.set(null);
    this.productionSummary.set(null);
  }
}

# CNG Distribution Module - Frontend Implementation

This document provides a comprehensive guide to the CNG Distribution Module frontend implementation, including all GraphQL APIs, services, and components.

## Overview

The CNG Distribution Module provides a complete frontend implementation for managing:
- **CNG Stations** - Create, read, update, and delete CNG stations
- **Daily Reports (RPT-DL-04)** - Detailed daily operational reports with cumulative meter readings
- **Monthly Reports (RPT-MT)** - Comprehensive monthly summaries with production rollups
- **PDF & Excel Exports** - Generate and download formatted reports

## Architecture

### Files Structure

```
gasco-frontend/src/app/routes/distribution/cng/
├── cng.interface.ts         # All TypeScript interfaces and DTOs
├── cng.graphql.ts           # GraphQL queries and mutations
├── cng.service.ts           # GraphQL service layer with API methods
├── cng.store.ts             # Angular signals-based state management
└── README.md                # This file

Components (under distribution/):
├── cng-station-management/
│   ├── cng-stations.ts      # List view with CRUD operations
│   └── cng-station.ts       # Detail/edit view
├── cng-daily-report/        # Updated daily report components
├── cng-monthly-report/
│   ├── cng-monthly-reports.ts    # List view
│   └── cng-monthly-report.ts     # Detail/edit view
```

### Technology Stack

- **State Management**: Angular signals (no RxJS state library)
- **API Layer**: Apollo GraphQL client
- **Forms**: ReactiveFormsModule with FormBuilder
- **UI**: Angular Material 20+
- **Data Export**: Base64 decoding and file download utility

## Service Layer (`cng.service.ts`)

The `CngService` provides all GraphQL operations as RxJS Observables.

### CNG Station Operations

```typescript
// Create or update a station
saveCngStation(dto: CngStationDtoInput): Observable<Response<CngStation>>

// Get all stations (non-paginated)
allCngStations(): Observable<CngStation[]>

// Get paginated stations
allCngStationsPageable(pageableParam: PageableParam, active?: boolean): Observable<Page<CngStation>>

// Get specific station by UID
findCngStation(uid: string): Observable<Response<CngStation>>

// Delete a station
deleteCngStation(uid: string): Observable<Response<CngStation>>

// User assignment
assignUserToCngStation(userUid: string, stationUid: string): Observable<Response<UserCngStation>>

// Get users at a station
cngStationUsers(stationUid: string): Observable<UserCngStation[]>

// Get current user's assigned station
myCngStation(): Observable<CngStation>

// Get specific user's assigned station
cngStationForUser(userUid: string): Observable<CngStation>
```

### Daily Report Operations

```typescript
// Save (create/update) daily report
saveCngDailyReport(dto: CngDailyReportDtoInput): Observable<Response<CngDailyReport>>

// Workflow operations
submitCngDailyReport(dto: WorkflowActionDtoInput): Observable<Response<CngDailyReport>>
approveCngDailyReport(dto: WorkflowActionDtoInput): Observable<Response<CngDailyReport>>
rejectCngDailyReport(dto: WorkflowActionDtoInput): Observable<Response<CngDailyReport>>

// Queries
allCngDailyReportsPageable(pageableParam: PageableParam, active?: boolean): Observable<Page<CngDailyReport>>
findCngDailyReport(uid: string): Observable<Response<CngDailyReport>>
cngDailyReportsByStation(stationUid: string): Observable<CngDailyReport[]>

// Export operations
cngDailyReportPdf(uid: string): Observable<Response<string>>   // Returns base64 PDF
cngDailyReportXlsx(uid: string): Observable<Response<string>>  // Returns base64 Excel

// Delete
deleteCngDailyReport(uid: string): Observable<Response<CngDailyReport>>
```

### Monthly Report Operations

```typescript
// Save (create/update) monthly report
saveCngMonthlyReport(dto: CngMonthlyReportDtoInput): Observable<Response<CngMonthlyReport>>

// Workflow operations
submitCngMonthlyReport(dto: WorkflowActionDtoInput): Observable<Response<CngMonthlyReport>>
reviewCngMonthlyReport(dto: WorkflowActionDtoInput): Observable<Response<CngMonthlyReport>>
approveCngMonthlyReport(dto: WorkflowActionDtoInput): Observable<Response<CngMonthlyReport>>
rejectCngMonthlyReport(dto: WorkflowActionDtoInput): Observable<Response<CngMonthlyReport>>

// Queries
allCngMonthlyReportsPageable(pageableParam: PageableParam, active?: boolean): Observable<Page<CngMonthlyReport>>
findCngMonthlyReport(uid: string): Observable<Response<CngMonthlyReport>>
cngMonthlyReportsByStation(stationUid: string): Observable<CngMonthlyReport[]>

// Production summary (auto-rolled up from daily reports)
cngProductionSummary(stationUid: string, year: number, month: number): Observable<CngProductionSummary>

// Export operations
cngMonthlyReportPdf(uid: string): Observable<Response<string>>   // Returns base64 PDF
cngMonthlyReportXlsx(uid: string): Observable<Response<string>>  // Returns base64 Excel

// Delete
deleteCngMonthlyReport(uid: string): Observable<Response<CngMonthlyReport>>
```

### File Download Utilities

```typescript
// Download from base64-encoded data
downloadFile(base64Data: string, filename: string, mimeType: string): void

// Convenience methods
downloadPdf(base64Data: string, filename: string): void
downloadXlsx(base64Data: string, filename: string): void
```

## State Management (`cng.store.ts`)

Uses Angular signals for reactive state management.

### Available Signals

```typescript
// CNG Station state
cngStations: Signal<CngStation[]>
selectedCngStation: Signal<CngStation | null>
myCngStation: Signal<CngStation | null>
isLoadingStations: Signal<boolean>
stationsError: Signal<string | null>

// Daily Report state
dailyReports: Signal<CngDailyReport[]>
selectedDailyReport: Signal<CngDailyReport | null>
isLoadingDailyReports: Signal<boolean>
dailyReportsError: Signal<string | null>

// Monthly Report state
monthlyReports: Signal<CngMonthlyReport[]>
selectedMonthlyReport: Signal<CngMonthlyReport | null>
isLoadingMonthlyReports: Signal<boolean>
monthlyReportsError: Signal<string | null>
productionSummary: Signal<CngProductionSummary | null>

// Computed signals
hasStations: Signal<boolean>
hasDailyReports: Signal<boolean>
hasMonthlyReports: Signal<boolean>
```

### Store Methods

```typescript
// Station operations
loadCngStations(): void
loadMyCngStation(): void
selectCngStation(station: CngStation | null): void
saveCngStation(station: CngStation | null): void
clearSelectedStation(): void

// Daily report operations
loadDailyReportsByStation(stationUid: string): void
selectDailyReport(report: CngDailyReport | null): void
clearSelectedDailyReport(): void

// Monthly report operations
loadMonthlyReportsByStation(stationUid: string): void
loadProductionSummary(stationUid: string, year: number, month: number): void
selectMonthlyReport(report: CngMonthlyReport | null): void
clearSelectedMonthlyReport(): void

// Global
clearAll(): void
```

## Data Models

### CngStation
```typescript
interface CngStation {
  uid: string;
  code: string;                        // Auto-generated if omitted
  name: string;
  stationType: 'MOTHER' | 'DAUGHTER' | 'FILLING';
  region?: string;
  location?: string;
  contact?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User;
}
```

### CngDailyReport - Key Fields
```typescript
interface CngDailyReport {
  // Identification
  uid: string;
  stationUid: string;
  reportDate: string;        // yyyy-MM-dd, unique per station+date
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';

  // Station availability (optional)
  unplannedDowntimeHours?: number;
  plannedOperatingHours?: number;
  availabilityPercent?: number;

  // Customers served (optional)
  customersTubeTrailers?: number;
  customersBuses?: number;
  customersCars?: number;
  customersBajaj?: number;

  // Gas consumption - Cumulative readings (operator inputs)
  // Leave *Prev blank → server auto-carries yesterday's *Today
  fmsMeterPrevScm?: number;
  fmsMeterTodayScm?: number;
  fuelGasPrevScm?: number;
  fuelGasTodayScm?: number;
  cascadeStoredKg?: number;

  // Derived totals (read-only in response, can be overridden if needed)
  fmsMeterReadingScm?: number;      // today - prev
  fuelGasUsedScm?: number;          // today - prev
  totalGasDispensedScm?: number;
  totalGasDispensedKg?: number;
  compressedGasStoredScm?: number;
  gasVentedScm?: number;

  // Other fields
  operationMaintenanceActivities?: string;
  preparedByName?: string;
  reviewedByName?: string;

  // Repeating sections (arrays with orderIndex)
  dispensers?: Array<{
    nozzleLabel: string;
    dispensedKg: number;
    orderIndex?: number;
  }>;

  equipmentRuns?: Array<{
    equipmentType: 'GAS_COMPRESSOR' | 'AIR_COMPRESSOR' | 'GAS_ENGINE' | 'GAS_DRIER';
    label: string;
    prevHours: number;
    todayHours: number;
    last24Hours: number;
    kwh?: number;        // for GAS_ENGINE
    dewPoint?: number;   // for GAS_DRIER
    statusNote?: string;
    orderIndex?: number;
  }>;

  hseRecords?: Array<{
    metric: string;
    todayCount: number;
    yearToDateCount: number;
    orderIndex?: number;
  }>;

  personnel?: Array<{
    category: string;
    headcount: number;
    orderIndex?: number;
  }>;
}
```

### CngMonthlyReport - Key Fields
```typescript
interface CngMonthlyReport {
  uid: string;
  stationUid: string;
  year: number;
  month: number;                  // 1-12
  status: WorkflowStatus;
  
  // Narratives
  executiveSummary?: string;
  hseNarrative?: string;
  facilitiesNarrative?: string;
  administrationNarrative?: string;
  trainingNarrative?: string;

  // Monthly meter figures
  tanescoPowerUnits?: number;    // For production table
  potableWaterM3?: number;

  // Child tables
  hseStats?: Array<{
    item: string;
    numberOfCases: number;
    description?: string;
    orderIndex?: number;
  }>;

  maintenanceSummaries?: Array<{
    workOrderCategory: string;
    issued: number;
    closed: number;
    inProgress: number;
    orderIndex?: number;
  }>;
}
```

### CngProductionSummary (Auto Roll-up)
```typescript
interface CngProductionSummary {
  daysReported: number;
  totalGasDispensedKg: number;
  avgGasDispensedKgPerDay: number;
  totalFuelGasScm: number;
  totalGasVentedScm: number;
  customersTubeTrailers: number;
  customersBuses: number;
  customersCars: number;
  customersBajaj: number;
}
```

## Routes

Three new routes have been added to `distribution.routes.ts`:

```typescript
// List CNG stations
/distribution/cng-stations

// View/edit CNG station
/distribution/cng-station/{uid}

// List monthly reports
/distribution/cng-monthly-reports

// View/edit monthly report
/distribution/cng-monthly-report/{uid}
```

Existing route updated:
- `/distribution/cng-daily-reports` - Updated for new daily report structure

## Usage Examples

### In a Component

```typescript
import { inject } from '@angular/core';
import { CngService } from './cng/cng.service';
import { CngStore } from './cng/cng.store';
import { CngDailyReportDtoInput } from './cng/cng.interface';

export class MyComponent {
  private cngService = inject(CngService);
  private cngStore = inject(CngStore);

  // Load all stations
  loadStations() {
    this.cngStore.loadCngStations();
  }

  // Save a daily report
  saveDailyReport() {
    const dto: CngDailyReportDtoInput = {
      reportDate: '2026-07-01',
      fmsMeterTodayScm: 1500,
      fmsMeterPrevScm: 1200,
      fuelGasTodayScm: 500,
      fuelGasPrevScm: 450,
      totalGasDispensedKg: 200,
      dispensers: [
        { nozzleLabel: 'Nozzle 1', dispensedKg: 100 },
        { nozzleLabel: 'Nozzle 2', dispensedKg: 100 },
      ],
      // ... other fields
    };

    this.cngService.saveCngDailyReport(dto).subscribe({
      next: (response) => {
        console.log('Report saved:', response.data);
      },
      error: (err) => {
        console.error('Error saving report:', err);
      },
    });
  }

  // Download PDF
  downloadPdf(uid: string) {
    this.cngService.cngDailyReportPdf(uid).subscribe({
      next: (response) => {
        this.cngService.downloadPdf(response.data, `daily-report-${uid}.pdf`);
      },
      error: (err) => {
        console.error('Error downloading PDF:', err);
      },
    });
  }

  // Access store signals in template
  stations = this.cngStore.cngStations;
  isLoading = this.cngStore.isLoadingStations;
  error = this.cngStore.stationsError;
}
```

### In Templates

```html
<!-- Display stations -->
<div *ngFor="let station of stations()">
  <h3>{{ station.name }}</h3>
  <p>{{ station.stationType }} - {{ station.region }}</p>
</div>

<!-- Show loading state -->
<mat-spinner *ngIf="isLoading()"></mat-spinner>

<!-- Show errors -->
<div *ngIf="error()" class="error-message">
  {{ error() }}
</div>
```

## GraphQL Queries and Mutations

All GraphQL operations are defined in `cng.graphql.ts`. The service automatically wraps them with proper variables and response handling.

### Daily Report PDF/Excel

The PDF and Excel exports return base64-encoded data in the response:
```
{
  status: true,
  message: "Report generated successfully",
  data: "JVBERi0xLjQKJazcIA0KMSAwIG9iago..."
}
```

Decode and download using:
```typescript
this.cngService.cngDailyReportPdf(uid).subscribe(res => {
  this.cngService.downloadPdf(res.data, 'report.pdf');
});
```

## Permissions

Standard CRUD permissions for each module:
- **CNG_STATION**: `CREATE`, `UPDATE`, `VIEW_ALL`, `VIEW`, `DELETE`
- **CNG_MONTHLY_REPORT**: `CREATE`, `UPDATE`, `VIEW_ALL`, `VIEW`, `DELETE`
- **CNG_REPORT** (daily): Existing permission set

## Configuration Settings

The backend exposes these configurable conversion factors via Settings:
- `cng.gas.density.kg.per.scm` (default: 0.695)
- `cng.summary.scm.per.kg` (default: 1.5)
- `cng.scm.to.mmscf.factor` (default: 35.3147)

These are used in spreadsheet calculations but don't need to be accessed from the frontend.

## Error Handling

All service methods return typed Observables. Errors should be handled in subscription:

```typescript
this.cngService.saveCngDailyReport(dto).subscribe({
  next: (response) => { /* handle success */ },
  error: (err) => {
    const message = err?.error?.message || 'An error occurred';
    // Handle error (show notification, etc.)
  },
});
```

## Notes

- **Station derivation**: Daily and monthly reports automatically derive the station from the signed-in user. Pass `stationUid` only for staff with multi-station override rights.
- **Cumulative readings**: When saving daily reports, leave previous readings blank to auto-carry yesterday's value.
- **Order preservation**: Child arrays (dispensers, equipment runs, etc.) maintain order via `orderIndex`.
- **Base64 encoding**: PDF and Excel files are base64-encoded; use the provided download utilities to handle decoding and file generation.
- **Unique constraints**: 
  - Daily reports: unique per station + date
  - Monthly reports: unique per station + year + month

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { FetchService } from '@shared/fetch/fetch.service';

import {
  CngStation,
  CngStationDtoInput,
  UserCngStation,
  CngDailyReport,
  CngDailyReportDtoInput,
  CngMonthlyReport,
  CngMonthlyReportDtoInput,
  CngProductionSummary,
  WorkflowActionDtoInput,
  PageableParam,
  Page,
  Response,
} from './cng.interface';

import {
  // Station queries and mutations
  SAVE_CNG_STATION,
  ALL_CNG_STATIONS,
  ALL_CNG_STATIONS_PAGEABLE,
  FIND_CNG_STATION,
  DELETE_CNG_STATION,
  ASSIGN_USER_TO_CNG_STATION,
  CNG_STATION_USERS,
  MY_CNG_STATION,
  CNG_STATION_FOR_USER,
  // Daily report queries and mutations
  SAVE_CNG_DAILY_REPORT,
  SUBMIT_CNG_DAILY_REPORT,
  APPROVE_CNG_DAILY_REPORT,
  REJECT_CNG_DAILY_REPORT,
  ALL_CNG_DAILY_REPORTS,
  ALL_CNG_DAILY_REPORTS_PAGEABLE,
  FIND_CNG_DAILY_REPORT,
  CNG_DAILY_REPORTS_BY_STATION,
  DELETE_CNG_DAILY_REPORT,
  CNG_DAILY_REPORT_PDF,
  CNG_DAILY_REPORT_XLSX,
  // Monthly report queries and mutations
  SAVE_CNG_MONTHLY_REPORT,
  SUBMIT_CNG_MONTHLY_REPORT,
  REVIEW_CNG_MONTHLY_REPORT,
  APPROVE_CNG_MONTHLY_REPORT,
  REJECT_CNG_MONTHLY_REPORT,
  ALL_CNG_MONTHLY_REPORTS_PAGEABLE,
  FIND_CNG_MONTHLY_REPORT,
  CNG_MONTHLY_REPORTS_BY_STATION,
  DELETE_CNG_MONTHLY_REPORT,
  CNG_PRODUCTION_SUMMARY,
  CNG_MONTHLY_REPORT_PDF,
  CNG_MONTHLY_REPORT_XLSX,
} from './cng.graphql';

@Injectable({
  providedIn: 'root',
})
export class CngService {
  private fs = inject(FetchService);

  // ==================== CNG STATION OPERATIONS ====================

  saveCngStation(dto: CngStationDtoInput): Observable<Response<CngStation>> {
    return this.fs.fetch$({ mutation: SAVE_CNG_STATION, variables: { dto } });
  }

  allCngStations(): Observable<CngStation[]> {
    return this.fs.fetch$({ query: ALL_CNG_STATIONS });
  }

  allCngStationsPageable(
    pageableParam?: PageableParam,
    active?: boolean,
  ): Observable<CngStation[]> {
    // Backend does not expose PageableParam as GraphQL InputType, using non-pageable query
    return this.fs.fetch$({ query: ALL_CNG_STATIONS_PAGEABLE });
  }

  findCngStation(uid: string): Observable<Response<CngStation>> {
    return this.fs.fetch$({ query: FIND_CNG_STATION, variables: { uid } });
  }

  deleteCngStation(uid: string): Observable<Response<CngStation>> {
    return this.fs.fetch$({ mutation: DELETE_CNG_STATION, variables: { uid } });
  }

  assignUserToCngStation(userUid: string, stationUid: string): Observable<Response<UserCngStation>> {
    return this.fs.fetch$({ mutation: ASSIGN_USER_TO_CNG_STATION, variables: { userUid, stationUid } });
  }

  cngStationUsers(stationUid: string): Observable<UserCngStation[]> {
    return this.fs.fetch$({ query: CNG_STATION_USERS, variables: { stationUid } });
  }

  myCngStation(): Observable<CngStation> {
    return this.fs.fetch$({ query: MY_CNG_STATION });
  }

  cngStationForUser(userUid: string): Observable<CngStation> {
    return this.fs.fetch$({ query: CNG_STATION_FOR_USER, variables: { userUid } });
  }

  // ==================== CNG DAILY REPORT OPERATIONS ====================

  saveCngDailyReport(dto: CngDailyReportDtoInput): Observable<Response<CngDailyReport>> {
    return this.fs.fetch$({ mutation: SAVE_CNG_DAILY_REPORT, variables: { dto } });
  }

  submitCngDailyReport(dto: WorkflowActionDtoInput): Observable<Response<CngDailyReport>> {
    return this.fs.fetch$({ mutation: SUBMIT_CNG_DAILY_REPORT, variables: { dto } });
  }

  approveCngDailyReport(dto: WorkflowActionDtoInput): Observable<Response<CngDailyReport>> {
    return this.fs.fetch$({ mutation: APPROVE_CNG_DAILY_REPORT, variables: { dto } });
  }

  rejectCngDailyReport(dto: WorkflowActionDtoInput): Observable<Response<CngDailyReport>> {
    return this.fs.fetch$({ mutation: REJECT_CNG_DAILY_REPORT, variables: { dto } });
  }

  allCngDailyReports(): Observable<CngDailyReport[]> {
    return this.fs.fetch$({ query: ALL_CNG_DAILY_REPORTS });
  }

  allCngDailyReportsPageable(
    pageableParam?: PageableParam,
    active?: boolean,
  ): Observable<CngDailyReport[]> {
    // Backend does not expose PageableParam as GraphQL InputType, using non-pageable query
    return this.fs.fetch$({ query: ALL_CNG_DAILY_REPORTS_PAGEABLE });
  }

  findCngDailyReport(uid: string): Observable<Response<CngDailyReport>> {
    return this.fs.fetch$({ query: FIND_CNG_DAILY_REPORT, variables: { uid } });
  }

  cngDailyReportsByStation(stationUid: string): Observable<CngDailyReport[]> {
    return this.fs.fetch$({ query: CNG_DAILY_REPORTS_BY_STATION, variables: { stationUid } });
  }

  deleteCngDailyReport(uid: string): Observable<Response<CngDailyReport>> {
    return this.fs.fetch$({ mutation: DELETE_CNG_DAILY_REPORT, variables: { uid } });
  }

  cngDailyReportPdf(uid: string): Observable<Response<string>> {
    return this.fs.fetch$({ query: CNG_DAILY_REPORT_PDF, variables: { uid } });
  }

  cngDailyReportXlsx(uid: string): Observable<Response<string>> {
    return this.fs.fetch$({ query: CNG_DAILY_REPORT_XLSX, variables: { uid } });
  }

  // ==================== CNG MONTHLY REPORT OPERATIONS ====================

  saveCngMonthlyReport(dto: CngMonthlyReportDtoInput): Observable<Response<CngMonthlyReport>> {
    return this.fs.fetch$({ mutation: SAVE_CNG_MONTHLY_REPORT, variables: { dto } });
  }

  submitCngMonthlyReport(dto: WorkflowActionDtoInput): Observable<Response<CngMonthlyReport>> {
    return this.fs.fetch$({ mutation: SUBMIT_CNG_MONTHLY_REPORT, variables: { dto } });
  }

  reviewCngMonthlyReport(dto: WorkflowActionDtoInput): Observable<Response<CngMonthlyReport>> {
    return this.fs.fetch$({ mutation: REVIEW_CNG_MONTHLY_REPORT, variables: { dto } });
  }

  approveCngMonthlyReport(dto: WorkflowActionDtoInput): Observable<Response<CngMonthlyReport>> {
    return this.fs.fetch$({ mutation: APPROVE_CNG_MONTHLY_REPORT, variables: { dto } });
  }

  rejectCngMonthlyReport(dto: WorkflowActionDtoInput): Observable<Response<CngMonthlyReport>> {
    return this.fs.fetch$({ mutation: REJECT_CNG_MONTHLY_REPORT, variables: { dto } });
  }

  allCngMonthlyReportsPageable(
    stationUid: string,
  ): Observable<CngMonthlyReport[]> {
    // Backend does not expose PageableParam as GraphQL InputType; using cngMonthlyReportsByStation instead
    return this.fs.fetch$({ query: ALL_CNG_MONTHLY_REPORTS_PAGEABLE, variables: { stationUid } });
  }

  findCngMonthlyReport(uid: string): Observable<Response<CngMonthlyReport>> {
    return this.fs.fetch$({ query: FIND_CNG_MONTHLY_REPORT, variables: { uid } });
  }

  cngMonthlyReportsByStation(stationUid: string): Observable<CngMonthlyReport[]> {
    return this.fs.fetch$({ query: CNG_MONTHLY_REPORTS_BY_STATION, variables: { stationUid } });
  }

  deleteCngMonthlyReport(uid: string): Observable<Response<CngMonthlyReport>> {
    return this.fs.fetch$({ mutation: DELETE_CNG_MONTHLY_REPORT, variables: { uid } });
  }

  cngProductionSummary(
    stationUid: string,
    year: number,
    month: number,
  ): Observable<CngProductionSummary> {
    return this.fs.fetch$({ query: CNG_PRODUCTION_SUMMARY, variables: { stationUid, year, month } });
  }

  cngMonthlyReportPdf(uid: string): Observable<Response<string>> {
    return this.fs.fetch$({ query: CNG_MONTHLY_REPORT_PDF, variables: { uid } });
  }

  cngMonthlyReportXlsx(uid: string): Observable<Response<string>> {
    return this.fs.fetch$({ query: CNG_MONTHLY_REPORT_XLSX, variables: { uid } });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Download a file from base64-encoded data
   * @param base64Data The base64-encoded file data
   * @param filename The name of the file to download
   * @param mimeType The MIME type of the file
   */
  downloadFile(base64Data: string, filename: string, mimeType: string): void {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Download a PDF report
   */
  downloadPdf(base64Data: string, filename: string): void {
    this.downloadFile(
      base64Data,
      filename || 'report.pdf',
      'application/pdf',
    );
  }

  /**
   * Download an Excel report
   */
  downloadXlsx(base64Data: string, filename: string): void {
    this.downloadFile(
      base64Data,
      filename || 'report.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class NominationReportService {
  private http = inject(HttpClient);

  private readonly BASE = `${environment.SERVER_URL}/reports/nominations`;

  downloadNominationReport(plantNominationUid: string, letter = false): Observable<Blob> {
    return this.http.get(`${this.BASE}/${plantNominationUid}/pdf`, {
      params: { letter },
      responseType: 'blob',
    });
  }
}

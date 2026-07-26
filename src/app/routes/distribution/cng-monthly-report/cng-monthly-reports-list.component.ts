import { Component, inject, signal } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_CNG_MONTHLY_REPORTS_PAGEABLE } from '../cng/cng-monthly-report.graphql';
import { CngService } from '../cng/cng.service';
import {
  cngMonthlyReportUpsertBtn,
  cngMonthlyReportTableBtns,
  cngMonthlyReport$,
} from '../cng/cng-monthly-report.form';

@Component({
  selector: 'cng-monthly-reports',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      @if (gridParameter()) {
        <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter()!" />
      } @else if (noStationAssigned()) {
        <div class="flex items-center justify-center h-96">
          <div class="text-center">
            <p class="text-lg font-semibold text-gray-700 mb-2">No CNG Station Assigned</p>
            <p class="text-gray-600">You need to be assigned to a CNG station to view monthly reports.</p>
            <p class="text-gray-500 text-sm mt-2">Please contact your administrator to assign you to a station.</p>
          </div>
        </div>
      } @else {
        <div class="flex items-center justify-center h-96">
          <div class="text-center">
            <p class="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class CngMonthlyReportsComponent extends BaseComponent {
  override title = 'CNG Monthly Reports';
  override subtitle = 'Manage Monthly Reports';
  override actionButtons: ActionButton[] = [cngMonthlyReportUpsertBtn(this)];

  private cngService = inject(CngService);

  keyColumns: GridKeyColumn[] = ['index as S/n','stationName', 'year', 'month', 'status', 'actions'];

  gridParameter = signal<GridParameter | null>(null);
  noStationAssigned = signal(false);

  constructor() {
    super();
    // Fetch current user's station and initialize grid with stationUid
    this.cngService.myCngStation().subscribe({
      next: (station) => {
        if (station?.uid) {
          this.gridParameter.set({
            title: 'CNG Monthly Reports',
            icon: 'assessment',
            keyColumns: this.keyColumns,
            actionButtons: cngMonthlyReportTableBtns(this),
            reloadActions$: [cngMonthlyReport$],
            fetchParameter: {
              query: ALL_CNG_MONTHLY_REPORTS_PAGEABLE,
              variables: { stationUid: station.uid },
            },
            gridOptions: DEFAULT_TABLE_OPTIONS,
            viewDetailsClicks: 1,
            rowClickActions: [
              {
                callback: (data: any) => navigateRelativeTo(this, 'cng-monthly-report', data.uid),
              },
            ],
          });
        } else {
          this.noStationAssigned.set(true);
        }
      },
      error: () => {
        this.noStationAssigned.set(true);
      },
    });
  }
}

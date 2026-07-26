import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  cngDailyReportUpsertBtn,
  cngDailyReportTableBtns,
  cngDailyReport$,
} from './cng-daily-report.form';
import { ALL_CNG_DAILY_REPORTS, ALL_CNG_DAILY_REPORTS_PAGEABLE } from './cng-daily-report.graphql';
import { CngService } from '@routes/distribution/cng/cng.service';

@Component({
  selector: 'app-cng-daily-reports',
  imports: [CommonModule, DataGridComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class CngDailyReportsComponent extends BaseComponent {
  private cngService = inject(CngService);

  override title = 'CNG Daily Reports';
  override subtitle = 'Daily Station Reports Management';
  override actionButtons: ActionButton[] = [cngDailyReportUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index as S/n',
    'reportDate',
    'stationName',
    'compressedVolumeSm3',
    'salesQuantitySm3',
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: cngDailyReportTableBtns(this, this.cngService),
    reloadActions$: [cngDailyReport$],
    fetchParameter: {
      query: ALL_CNG_DAILY_REPORTS_PAGEABLE,
    },
  };
}

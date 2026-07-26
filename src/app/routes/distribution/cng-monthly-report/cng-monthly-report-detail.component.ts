import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_CNG_MONTHLY_REPORT } from '../cng/cng-monthly-report.graphql';
import {
  cngMonthlyReportUpsertBtn,
  cngMonthlyReportDeleteBtn,
  cngMonthlyReportDownloadPdfBtn,
  cngMonthlyReportDownloadXlsxBtn,
  cngMonthlyReportWorkflowBtns,
  cngMonthlyReport$,
} from '../cng/cng-monthly-report.form';
import { CngService } from '../cng/cng.service';

@Component({
  selector: 'cng-monthly-report-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent, MatTabsModule],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="cngMonthlyReport"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class CngMonthlyReportDetailComponent extends BaseComponent implements OnInit {
  override title = 'CNG Monthly Report';
  override subtitle = 'Report Details';

  private cngService = inject(CngService);

  cngMonthlyReport: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    cngMonthlyReportUpsertBtn(this),
    ...cngMonthlyReportWorkflowBtns(this),
    cngMonthlyReportDownloadPdfBtn(this.cngService),
    cngMonthlyReportDownloadXlsxBtn(this.cngService),
    cngMonthlyReportDeleteBtn(this),
  ];

  private cngMonthlyReportUid = this.route.snapshot?.paramMap?.get('cngMonthlyReportUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_CNG_MONTHLY_REPORT,
    successFn: (res) => {
      const { year, month } = res?.data || {};
      if (year && month) {
        this.title = `${year}-${String(month).padStart(2, '0')}`;
      }
    },
    variables: { uid: this.cngMonthlyReportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(cngMonthlyReport$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.cngMonthlyReport = await this.fs.fetch(this.fetchParameter);
    const viewReport = formatEntityDates(this.cngMonthlyReport);

    this.contents = [
      {
        type: 'details',
        name: 'Report',
        label: 'Report Details',
        icon: 'description',
        showUndefined: false,
        entity: viewReport,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}

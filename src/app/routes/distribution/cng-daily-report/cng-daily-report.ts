import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { FIND_CNG_DAILY_REPORT } from './cng-daily-report.graphql';
import {
  cngDailyReport$,
  cngDailyReportEditBtn,
  cngDailyReportSubmitBtn,
  cngDailyReportApproveBtn,
  cngDailyReportDeleteBtn,
  cngDailyReportDownloadPdfBtn,
  cngDailyReportDownloadXlsxBtn,
} from './cng-daily-report.form';
import { CngDailyReport } from './cng-daily-report.interface';
import { CngService } from '@routes/distribution/cng/cng.service';

@Component({
  selector: 'cng-daily-report',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="cngDailyReport"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class CngDailyReportComponent extends BaseComponent implements OnInit {
  override title = 'CNG Daily Report';
  override subtitle = 'CNG Daily Report Details';

  private cngService = inject(CngService);

  cngDailyReport: CngDailyReport | undefined;
  cngDailyReportUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    cngDailyReportEditBtn(this),
    cngDailyReportSubmitBtn(this),
    cngDailyReportApproveBtn(this),
    cngDailyReportDownloadPdfBtn(this.cngService),
    cngDailyReportDownloadXlsxBtn(this.cngService),
    cngDailyReportDeleteBtn(this),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_CNG_DAILY_REPORT,
    successFn: (res) => {
      const reportDate = (res as any)?.reportDate ?? (res as any)?.data?.reportDate;
      if (reportDate) this.title = `Daily Report — ${reportDate}`;
    },
    variables: { uid: this.cngDailyReportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(cngDailyReport$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.cngDailyReport = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['updatedAt', 'deletedAt', 'createdAt'],
        entity: this.cngDailyReport,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}

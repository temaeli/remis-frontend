import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_DISTRIBUTION_WEEKLY_REPORT } from './distribution-weekly-report.graphql';
import {
  distributionWeeklyReport$,
  distributionWeeklyReportEditBtn,
  distributionWeeklyReportSubmitBtn,
  distributionWeeklyReportReviewBtn,
  distributionWeeklyReportApproveBtn,
  distributionWeeklyReportRejectBtn,
  distributionWeeklyReportDeleteBtn,
} from './distribution-weekly-report.form';

@Component({
  selector: 'distribution-weekly-report-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [showBackBtn]="true"
        [actionButtons]="actionButtons"
        [data]="report"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class DistributionWeeklyReportDetailComponent extends BaseComponent implements OnInit {
  override title = 'Weekly Report';
  override subtitle = 'Distribution Weekly Operation Report';

  report: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    distributionWeeklyReportEditBtn(this),
    distributionWeeklyReportSubmitBtn(this),
    distributionWeeklyReportReviewBtn(this),
    distributionWeeklyReportApproveBtn(this),
    distributionWeeklyReportRejectBtn(this),
    distributionWeeklyReportDeleteBtn(this),
  ];

  private reportUid = this.route.snapshot?.paramMap?.get('weeklyReportUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_DISTRIBUTION_WEEKLY_REPORT,
    successFn: (res) => {
      const { weekStartDate, weekEndDate } = res?.data || res || {};
      if (weekStartDate) this.title = `${weekStartDate} — ${weekEndDate ?? ''}`;
    },
    variables: { uid: this.reportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(distributionWeeklyReport$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.report = await this.fs.fetch(this.fetchParameter);
    const viewReport = formatEntityDates(this.report);

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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_INTELLIGENCE_REPORT } from './security-intelligence-report.graphql';
import {
  securityIntelligenceReportUpsertBtn,
  securityIntelligenceReport$,
} from './security-intelligence-report.form';
import { approvalHistoryContent, SECURITY_SUBJECT } from '../shared/security-approval-history';

@Component({
  selector: 'security-intelligence-report-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="report"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityIntelligenceReportDetailComponent extends BaseComponent implements OnInit {
  override title = 'Intelligence Report';
  override subtitle = 'Intelligence Report Details';

  report: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [securityIntelligenceReportUpsertBtn(this)];

  private reportUid = this.route.snapshot?.paramMap?.get('securityIntelligenceReportUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_INTELLIGENCE_REPORT,
    successFn: (res) => (this.title = res?.data?.referenceNumber ?? this.title),
    variables: { uid: this.reportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityIntelligenceReport$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.report = await this.fs.fetch(this.fetchParameter);
    const view = formatEntityDates(this.report);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: view,
        fetchParameter: this.fetchParameter,
      },
      approvalHistoryContent(SECURITY_SUBJECT.INTELLIGENCE, this.reportUid),
    ];

    this.cdr.detectChanges();
  }
}

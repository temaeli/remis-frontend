import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_VETTING_RECORD } from './security-vetting-record.graphql';
import {
  securityVettingRecordUpsertBtn,
  securityVettingRecord$,
} from './security-vetting-record.form';
import { approvalHistoryContent, SECURITY_SUBJECT } from '../shared/security-approval-history';

@Component({
  selector: 'security-vetting-record-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="record"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityVettingRecordDetailComponent extends BaseComponent implements OnInit {
  override title = 'Vetting Record';
  override subtitle = 'Vetting Record Details';

  record: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [securityVettingRecordUpsertBtn(this)];

  private recordUid = this.route.snapshot?.paramMap?.get('securityVettingRecordUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_VETTING_RECORD,
    successFn: (res) => (this.title = res?.data?.referenceNumber ?? this.title),
    variables: { uid: this.recordUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityVettingRecord$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.record = await this.fs.fetch(this.fetchParameter);
    const view = formatEntityDates(this.record);

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
      approvalHistoryContent(SECURITY_SUBJECT.VETTING, this.recordUid),
    ];

    this.cdr.detectChanges();
  }
}

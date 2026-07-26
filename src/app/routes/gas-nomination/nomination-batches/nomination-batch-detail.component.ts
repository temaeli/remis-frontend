import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import {
  approvalHistoryContent,
  NOMINATION_BATCH_SUBJECT,
} from './nomination-batch-approval-history';
import { ALL_NOMINATION_BATCHES } from './nomination-batch.graphql';

@Component({
  selector: 'app-nomination-batch-detail',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [showBackBtn]="true"
        [goBackUrl]="'/gas-nomination'"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class NominationBatchDetailComponent extends BaseComponent implements OnInit {
  override title = 'Nomination Batch';
  override subtitle = 'Nomination Batch Details';

  batch: any;
  batchUid: string | null = this.route.snapshot?.paramMap?.get('batchUid');

  override contents: ContentParameter[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: ALL_NOMINATION_BATCHES,
    variables: {},
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
  }

  async setContents() {
    if (!this.batchUid) return;

    // Fetch all batches and find the one matching batchUid
    const allBatches = await this.fs.fetch(this.fetchParameter);
    this.batch = allBatches?.find((b: any) => b?.uid === this.batchUid);

    if (!this.batch) {
      return;
    }

    this.title = `Batch: ${this.batch?.referenceNumber || this.batchUid}`;

    this.contents = [
      {
        type: 'details',
        label: 'Details',
        name: 'Details',
        icon: 'notes',
        showUndefined: false,
        entity: this.batch,
        fetchParameter: this.fetchParameter,
      },
      approvalHistoryContent(NOMINATION_BATCH_SUBJECT.NOMINATION_BATCH, this.batchUid),
    ];

    this.cdr.detectChanges();
  }
}

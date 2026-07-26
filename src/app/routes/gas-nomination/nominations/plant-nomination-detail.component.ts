import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import {
  approvalHistoryContent,
  PLANT_NOMINATION_SUBJECT,
} from './plant-nomination-approval-history';
import { PLANT_NOMINATIONS } from '../nomination-batches/nomination-batch.graphql';

@Component({
  selector: 'app-plant-nomination-detail',
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
export class PlantNominationDetailComponent extends BaseComponent implements OnInit {
  override title = 'Plant Nomination';
  override subtitle = 'Plant Nomination Details';

  nomination: any;
  nominationUid: string | null = this.route.snapshot?.paramMap?.get('nominationUid');
  batchUid: string | null = this.route.snapshot?.queryParamMap?.get('batchUid');

  override contents: ContentParameter[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: PLANT_NOMINATIONS,
    variables: { batchUid: this.batchUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
  }

  async setContents() {
    if (!this.nominationUid) return;

    // Fetch plant nominations by batch
    const nominations = await this.fs.fetch(this.fetchParameter);
    this.nomination = nominations?.find((n: any) => n?.uid === this.nominationUid);

    if (!this.nomination) {
      return;
    }

    this.title = `${this.nomination?.plant?.name || 'Plant'} Nomination`;
    this.subtitle = `Date: ${this.nomination?.nominationDate ? new Date(this.nomination.nominationDate).toLocaleDateString() : 'N/A'}`;

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        label: 'Details',
        showUndefined: true,
        entity: this.nomination,
        fetchParameter: this.fetchParameter,
      },
      approvalHistoryContent(PLANT_NOMINATION_SUBJECT.PLANT_NOMINATION, this.nominationUid),
    ];

    this.cdr.detectChanges();
  }
}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { approvalHistoryContent, GSA_SUBJECT } from './gsa-approval-history';
import { ALL_GAS_SALES_AGREEMENTS } from './gas-sales-agreement.graphql';

@Component({
  selector: 'app-gsa-detail',
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
export class GsaDetailComponent extends BaseComponent implements OnInit {
  override title = 'Gas Sales Agreement';
  override subtitle = 'Agreement Details';

  gsa: any;
  gsaUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: ALL_GAS_SALES_AGREEMENTS,
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
  }

  async setContents() {
    if (!this.gsaUid) return;

    // Fetch all GSAs and find the matching one
    const gsas = await this.fs.fetch(this.fetchParameter);
    this.gsa = gsas?.find((g: any) => g?.uid === this.gsaUid);

    if (!this.gsa) {
      return;
    }

    this.title = this.gsa?.contractNumber || 'Gas Sales Agreement';
    this.subtitle = `${this.gsa?.client?.user?.fullName || 'Customer'} - ${this.gsa?.contractName || ''}`;

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        label: 'Details',
        showUndefined: false,
        entity: this.gsa,
        fetchParameter: this.fetchParameter,
        hiddenKeys: [
          'id',
          'isDeleted',
          'deletedAt',
          'deletedBy',
          'deletedId',
          'migrated',
          'createdById',
          'updatedBy',
          'clientUid',
          'createdAt',
          'updatedAt',
          'submittedAt',
          'activatedAt',
        ],
      },
      approvalHistoryContent(GSA_SUBJECT.GAS_SALES_AGREEMENT, this.gsaUid),
    ];

    this.cdr.detectChanges();
  }
}

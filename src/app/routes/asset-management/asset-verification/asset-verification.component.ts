import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { AssetVerification } from '../asset-registry.interface';
import { FIND_ASSET_VERIFICATION } from './asset-verification.graphql';
import { assetVerification$, assetVerificationUpsertBtn } from './asset-verification.form';

@Component({
  selector: 'app-asset-verification',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="assetVerification"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class AssetVerificationComponent extends BaseComponent implements OnInit {
  override title = 'Asset Verification';
  override subtitle = 'Asset Verification Details';

  assetVerification: AssetVerification | undefined;
  assetVerificationUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [assetVerificationUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_ASSET_VERIFICATION,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.assetVerificationUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(assetVerification$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.assetVerification = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Verification Details',
        label: 'Verification Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['updatedAt', 'deletedAt'],
        entity: this.assetVerification,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}

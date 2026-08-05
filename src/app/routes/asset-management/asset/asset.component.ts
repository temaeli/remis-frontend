import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { Asset } from '../asset-registry.interface';
import { LAND_REGISTRATIONS_BY_ASSET } from '../land-registration/land-registration.graphql';
import {
  landRegistration$,
  landRegistrationTableBtns,
  landRegistrationUpsertBtn,
} from '../land-registration/land-registration.form';
import { ASSET_VERIFICATIONS_BY_ASSET } from '../asset-verification/asset-verification.graphql';
import {
  assetVerification$,
  assetVerificationTableBtns,
  assetVerificationUpsertBtn,
} from '../asset-verification/asset-verification.form';
import { FIND_ASSET } from './asset.graphql';
import { asset$, assetStatusBtn, assetUpsertBtn } from './asset.form';

@Component({
  selector: 'app-asset',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="asset"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class AssetComponent extends BaseComponent implements OnInit {
  override title = 'Asset';
  override subtitle = 'Asset Details';

  asset: Asset | undefined;
  assetUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [assetUpsertBtn(this), assetStatusBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_ASSET,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.assetUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(asset$.subscribe(() => this.setContents()));
    this.subs.add(landRegistration$.subscribe(() => this.setContents()));
    this.subs.add(assetVerification$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.asset = response?.data ?? response;

    const childColumns: GridKeyColumn[] = [
      'index',
      'assignedNumber',
      'name',
      'description',
      'createdAt',
      'actions',
    ];

    this.contents = [
      {
        type: 'details',
        name: 'Asset Details',
        label: 'Asset Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['updatedAt', 'deletedAt'],
        entity: this.asset,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Land Registrations',
        label: 'Land Registrations',
        icon: 'land_administration',
        keyColumns: childColumns,
        actionButtons: landRegistrationTableBtns(this),
        headerButtons: [landRegistrationUpsertBtn(this, this.assetUid ?? undefined)],
        fetchParameter: {
          query: LAND_REGISTRATIONS_BY_ASSET,
          variables: { assetUid: this.assetUid },
        },
      },
      {
        type: 'table',
        name: 'Verifications',
        label: 'Verifications',
        icon: 'check',
        keyColumns: childColumns,
        actionButtons: assetVerificationTableBtns(this),
        headerButtons: [assetVerificationUpsertBtn(this, this.assetUid ?? undefined)],
        fetchParameter: {
          query: ASSET_VERIFICATIONS_BY_ASSET,
          variables: { assetUid: this.assetUid },
        },
      },
    ];

    this.cdr.detectChanges();
  }
}

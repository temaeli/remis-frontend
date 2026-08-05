import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { AssetType } from '../asset-registry.interface';
import { ASSET_CATEGORIES_BY_TYPE } from '../asset-category/asset-category.graphql';
import {
  assetCategory$,
  assetCategoryTableBtns,
  assetCategoryUpsertBtn,
} from '../asset-category/asset-category.form';
import { FIND_ASSET_TYPE } from './asset-type.graphql';
import { assetType$, assetTypeUpsertBtn } from './asset-type.form';

@Component({
  selector: 'app-asset-type',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="assetType"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class AssetTypeComponent extends BaseComponent implements OnInit {
  override title = 'Asset Type';
  override subtitle = 'Asset Type Details';

  assetType: AssetType | undefined;
  assetTypeUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [assetTypeUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_ASSET_TYPE,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.assetTypeUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(assetType$.subscribe(() => this.setContents()));
    this.subs.add(assetCategory$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.assetType = response?.data ?? response;

    const keyColumns: GridKeyColumn[] = [
      'index',
      'assignedNumber',
      'name',
      'description',
      'active',
      'actions',
    ];

    this.contents = [
      {
        type: 'details',
        name: 'Asset Type Details',
        label: 'Asset Type Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['updatedAt', 'deletedAt'],
        entity: this.assetType,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Asset Categories',
        label: 'Asset Categories',
        icon: 'list',
        keyColumns,
        actionButtons: assetCategoryTableBtns(this),
        headerButtons: [assetCategoryUpsertBtn(this, this.assetTypeUid ?? undefined)],
        fetchParameter: {
          query: ASSET_CATEGORIES_BY_TYPE,
          variables: { assetTypeUid: this.assetTypeUid },
        },
      },
    ];

    this.cdr.detectChanges();
  }
}

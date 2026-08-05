import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { AssetSubcategory } from '../asset-registry.interface';
import { ASSETS_BY_SUBCATEGORY } from '../asset/asset.graphql';
import { asset$, assetTableBtns, assetUpsertBtn } from '../asset/asset.form';
import { FIND_ASSET_SUBCATEGORY } from './asset-subcategory.graphql';
import { assetSubcategory$, assetSubcategoryUpsertBtn } from './asset-subcategory.form';

@Component({
  selector: 'app-asset-subcategory',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="assetSubcategory"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class AssetSubcategoryComponent extends BaseComponent implements OnInit {
  override title = 'Asset Subcategory';
  override subtitle = 'Asset Subcategory Details';

  assetSubcategory: AssetSubcategory | undefined;
  assetSubcategoryUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [assetSubcategoryUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_ASSET_SUBCATEGORY,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.assetSubcategoryUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(assetSubcategory$.subscribe(() => this.setContents()));
    this.subs.add(asset$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.assetSubcategory = response?.data ?? response;

    const keyColumns: GridKeyColumn[] = [
      'index',
      'assignedNumber',
      'name',
      'status',
      'reserved',
      'active',
      'actions',
    ];

    this.contents = [
      {
        type: 'details',
        name: 'Asset Subcategory Details',
        label: 'Asset Subcategory Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['updatedAt', 'deletedAt'],
        entity: this.assetSubcategory,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Assets',
        label: 'Assets',
        icon: 'list',
        keyColumns,
        actionButtons: assetTableBtns(this),
        headerButtons: [assetUpsertBtn(this, this.assetSubcategoryUid ?? undefined)],
        fetchParameter: {
          query: ASSETS_BY_SUBCATEGORY,
          variables: { assetSubcategoryUid: this.assetSubcategoryUid },
        },
      },
    ];

    this.cdr.detectChanges();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { AssetCategory } from '../asset-registry.interface';
import { ASSET_SUBCATEGORIES_BY_CATEGORY } from '../asset-subcategory/asset-subcategory.graphql';
import {
  assetSubcategory$,
  assetSubcategoryTableBtns,
  assetSubcategoryUpsertBtn,
} from '../asset-subcategory/asset-subcategory.form';
import { FIND_ASSET_CATEGORY } from './asset-category.graphql';
import { assetCategory$, assetCategoryUpsertBtn } from './asset-category.form';

@Component({
  selector: 'app-asset-category',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="assetCategory"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class AssetCategoryComponent extends BaseComponent implements OnInit {
  override title = 'Asset Category';
  override subtitle = 'Asset Category Details';

  assetCategory: AssetCategory | undefined;
  assetCategoryUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [assetCategoryUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_ASSET_CATEGORY,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.assetCategoryUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(assetCategory$.subscribe(() => this.setContents()));
    this.subs.add(assetSubcategory$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.assetCategory = response?.data ?? response;

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
        name: 'Asset Category Details',
        label: 'Asset Category Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['updatedAt', 'deletedAt'],
        entity: this.assetCategory,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Asset Subcategories',
        label: 'Asset Subcategories',
        icon: 'list',
        keyColumns,
        actionButtons: assetSubcategoryTableBtns(this),
        headerButtons: [assetSubcategoryUpsertBtn(this, this.assetCategoryUid ?? undefined)],
        fetchParameter: {
          query: ASSET_SUBCATEGORIES_BY_CATEGORY,
          variables: { assetCategoryUid: this.assetCategoryUid },
        },
      },
    ];

    this.cdr.detectChanges();
  }
}

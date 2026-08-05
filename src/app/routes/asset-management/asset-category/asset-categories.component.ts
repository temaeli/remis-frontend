import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_ASSET_CATEGORIES_PAGEABLE } from './asset-category.graphql';
import {
  assetCategory$,
  assetCategoryTableBtns,
  assetCategoryUpsertBtn,
} from './asset-category.form';

@Component({
  selector: 'app-asset-categories',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class AssetCategoriesComponent extends BaseComponent {
  override title = 'Asset Categories';
  override subtitle = 'Second level of the asset classification hierarchy';
  override actionButtons: ActionButton[] = [assetCategoryUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    'assetType.name',
    'active',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    isPageable: true,
    actionButtons: assetCategoryTableBtns(this),
    reloadActions$: [assetCategory$],
    fetchParameter: { query: ALL_ASSET_CATEGORIES_PAGEABLE },
  };
}

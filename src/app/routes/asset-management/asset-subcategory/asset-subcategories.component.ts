import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_ASSET_SUBCATEGORIES_PAGEABLE } from './asset-subcategory.graphql';
import {
  assetSubcategory$,
  assetSubcategoryTableBtns,
  assetSubcategoryUpsertBtn,
} from './asset-subcategory.form';

@Component({
  selector: 'app-asset-subcategories',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class AssetSubcategoriesComponent extends BaseComponent {
  override title = 'Asset Subcategories';
  override subtitle = 'Divisions of an asset category — every asset is registered under one';
  override actionButtons: ActionButton[] = [assetSubcategoryUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    'assetCategory.name as Category',
    {
      field: 'active',
      valueFn: (row) => (row?.active ? 'Yes' : 'No'),
      valueClassMapper: (row) => (row?.active ? 'text-success' : 'text-danger'),
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    isPageable: true,
    actionButtons: assetSubcategoryTableBtns(this),
    reloadActions$: [assetSubcategory$],
    fetchParameter: { query: ALL_ASSET_SUBCATEGORIES_PAGEABLE },
  };
}

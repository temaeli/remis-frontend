import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_ASSETS_PAGEABLE } from './asset.graphql';
import { asset$, assetTableBtns, assetUpsertBtn } from './asset.form';

@Component({
  selector: 'app-assets',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class AssetsComponent extends BaseComponent {
  override title = 'Assets';
  override subtitle = 'Registered assets';
  override actionButtons: ActionButton[] = [assetUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'assetSubcategory.name as Sub Category',
    'status',
    {
      field: 'reserved',
      valueFn: (row) => (row?.reserved ? 'Yes' : 'No'),
      valueClassMapper: (row) => (row?.reserved ? 'text-success' : 'text-danger'),
    },
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
    actionButtons: assetTableBtns(this),
    reloadActions$: [asset$],
    fetchParameter: { query: ALL_ASSETS_PAGEABLE },
  };
}

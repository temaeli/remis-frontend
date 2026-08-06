import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_ASSET_TYPES_PAGEABLE } from './asset-type.graphql';
import { assetType$, assetTypeTableBtns, assetTypeUpsertBtn } from './asset-type.form';

@Component({
  selector: 'app-asset-types',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class AssetTypesComponent extends BaseComponent {
  override title = 'Asset Types';
  override subtitle = 'Broadest grouping of assets — land types carry land registrations';
  override actionButtons: ActionButton[] = [assetTypeUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    {
      field: 'forLand',
      valueFn: (row) => (row?.forLand ? 'Yes' : 'No'),
      valueClassMapper: (row) => (row?.forLand ? 'text-success' : 'text-danger'),
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
    actionButtons: assetTypeTableBtns(this),
    reloadActions$: [assetType$],
    fetchParameter: { query: ALL_ASSET_TYPES_PAGEABLE },
  };
}

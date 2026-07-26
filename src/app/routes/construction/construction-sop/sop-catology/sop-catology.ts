import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';

import { ALL_SOP_CATALOG_ENTRIES_PAGEABLE } from './sop-catology.graphql';
import {
  sopCatalogEntry$,
  sopCatalogEntryTableBtns,
  sopCatalogEntryUpsertBtn,
} from './sop-catology.form';

@Component({
  selector: 'app-sop-catology',
  imports: [CommonModule, DataGridComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SopCatology extends BaseComponent {
  override title = 'SOP Library';
  override subtitle = 'Standard Operating Procedure Library';
  override actionButtons: ActionButton[] = [sopCatalogEntryUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'name',
    'code',
    'description',
    {
      field: 'active',
      valueFn: (row) => (row?.active ? 'Active' : 'Inactive'),
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: sopCatalogEntryTableBtns(this),
    reloadActions$: [sopCatalogEntry$],
    fetchParameter: {
      query: ALL_SOP_CATALOG_ENTRIES_PAGEABLE,
    },
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'sop-catology', data.uid),
      },
    ],
  };
}

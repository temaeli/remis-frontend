import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_HSE_DRILLS } from './drill.graphql';
import { hseDrillUpsertBtn, hseDrillTableBtns, hseDrill$ } from './drill.form';

@Component({
  selector: 'hse-drills',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class HseDrills extends BaseComponent {
  override title = 'HSE Drills';
  override subtitle = 'Manage HSE Drills';
  override actionButtons: ActionButton[] = [hseDrillUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'category',
    'location',
    { field: 'financialYear', header: 'FY' },
    { field: 'quarter', header: 'Quarter' },
    { field: 'dateConducted', type: 'date' },
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'HSE Drills',
    icon: 'helmet',
    keyColumns: this.keyColumns,
    actionButtons: hseDrillTableBtns(this),
    reloadActions$: [hseDrill$],
    fetchParameter: { query: GET_ALL_HSE_DRILLS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'drills', data.uid),
      },
    ],
  };
}

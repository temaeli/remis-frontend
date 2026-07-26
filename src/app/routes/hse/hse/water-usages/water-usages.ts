import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_WATER_USAGES } from './water-usage.graphql';
import { waterUsageUpsertBtn, waterUsageViewBtn, waterUsage$ } from './water-usage.form';

@Component({
  selector: 'water-usages',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class WaterUsages extends BaseComponent {
  override title = 'Water Usages';
  override subtitle = 'Daily water meter readings';
  override actionButtons: ActionButton[] = [waterUsageUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'waterUse.name', header: 'Water Use' },
    { field: 'workingStation.name', header: 'Station' },
    { field: 'date', type: 'date', header: 'Month' },
    { field: 'amountUsed', header: 'Amount Used' },
    { field: 'submittedAt', type: 'dateTime', header: 'Submitted' },
    { field: 'approvedAt', type: 'dateTime', header: 'Approved' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Water Usages',
    icon: 'water',
    keyColumns: this.keyColumns,
    actionButtons: [waterUsageViewBtn(this)],
    reloadActions$: [waterUsage$],
    fetchParameter: { query: GET_ALL_WATER_USAGES },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'water-usages', data.uid),
      },
    ],
  };
}

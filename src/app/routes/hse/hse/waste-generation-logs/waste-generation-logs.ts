import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_WASTE_GENERATION_LOGS } from './waste-generation-log.graphql';
import {
  wasteGenerationLogUpsertBtn,
  wasteGenerationLogViewBtn,
  wasteGenerationLog$,
} from './waste-generation-log.form';

@Component({
  selector: 'waste-generation-logs',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class WasteGenerationLogs extends BaseComponent {
  override title = 'Waste Generation Logs';
  override subtitle = 'Daily waste generation records';
  override actionButtons: ActionButton[] = [wasteGenerationLogUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'wasteCategory.name', header: 'Category' },
    { field: 'workingStation.name', header: 'Station' },
    { field: 'date', type: 'date' },
    { field: 'amountGenerated', header: 'Generated' },
    { field: 'amountRecycled', header: 'Recycled' },
    { field: 'submittedAt', type: 'dateTime', header: 'Submitted' },
    { field: 'approvedAt', type: 'dateTime', header: 'Approved' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Waste Generation Logs',
    icon: 'delete',
    keyColumns: this.keyColumns,
    actionButtons: [wasteGenerationLogViewBtn(this)],
    reloadActions$: [wasteGenerationLog$],
    fetchParameter: { query: GET_ALL_WASTE_GENERATION_LOGS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'waste-generation-logs', data.uid),
      },
    ],
  };
}

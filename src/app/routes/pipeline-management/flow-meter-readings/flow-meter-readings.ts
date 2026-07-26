import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { processStatusFromTimestamps } from '@shared/crud';
import { GET_ALL_FLOW_METER_READINGS_PAGEABLE } from './flow-meter-reading.graphql';
import { displayClient } from './flow-meter-reading.interface';
import {
  flowMeterReading$,
  flowMeterReadingTableBtns,
  flowMeterReadingUpsertBtn,
} from './flow-meter-reading.form';

@Component({
  selector: 'flow-meter-readings',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class FlowMeterReadings extends BaseComponent {
  override title = 'Flow Meter Readings';
  override subtitle = 'Manage Flow Meter Readings';
  override actionButtons: ActionButton[] = [flowMeterReadingUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'pipeline.name', header: 'Pipeline' },
    {
      field: 'client',
      header: 'Client',
      valueFn: (row: any) => displayClient(row?.client),
    },
    { field: 'readingTime', header: 'Reading Time', type: 'date' },
    { field: 'amount', header: 'Flow (Sm³/h)' },
    {
      field: 'status',
      header: 'Approval Status',
      valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Flow Meter Readings',
    icon: 'dashboard',
    keyColumns: this.keyColumns,
    actionButtons: flowMeterReadingTableBtns(this),
    reloadActions$: [flowMeterReading$],
    fetchParameter: { query: GET_ALL_FLOW_METER_READINGS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'flow-meter-readings', data.uid),
      },
    ],
  };
}

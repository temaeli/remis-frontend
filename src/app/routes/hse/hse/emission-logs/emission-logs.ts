import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_EMISSION_LOGS } from './emission-log.graphql';
import {
  emissionLogUpsertBtn,
  emissionLogViewBtn,
  emissionLog$,
} from './emission-log.form';

@Component({
  selector: 'emission-logs',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class EmissionLogs extends BaseComponent {
  override title = 'Emission Logs';
  override subtitle = 'Daily emission records';
  override actionButtons: ActionButton[] = [emissionLogUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'emissionSubstance.name', header: 'Substance' },
    { field: 'workingStation.name', header: 'Station' },
    { field: 'date', type: 'date' },
    { field: 'amountEmitted', header: 'Amount Emitted' },
    { field: 'unitOfMeasure', header: 'Unit' },
    { field: 'submittedAt', type: 'dateTime', header: 'Submitted' },
    { field: 'approvedAt', type: 'dateTime', header: 'Approved' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Emission Logs',
    icon: 'cloud_download',
    keyColumns: this.keyColumns,
    actionButtons: [emissionLogViewBtn(this)],
    reloadActions$: [emissionLog$],
    fetchParameter: { query: GET_ALL_EMISSION_LOGS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'emission-logs', data.uid),
      },
    ],
  };
}

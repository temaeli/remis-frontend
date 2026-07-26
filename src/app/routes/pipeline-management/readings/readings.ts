import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_PIPELINE_READINGS } from './reading.graphql';
import { pipelineReadingUpsertBtn, pipelineReadingTableBtns, pipelineReading$ } from './reading.form';
import { ProcessStatus } from '@shared/crud';

@Component({
  selector: 'readings',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class Readings extends BaseComponent {
  override title = 'Pipeline Readings';
  override subtitle = 'Manage Pipeline Readings';
  override actionButtons: ActionButton[] = [pipelineReadingUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'pipelineSegment.segmentId', header: 'Segment' },
    { field: 'readingTime', header: 'Reading Time', type: 'dateTime' },
    'temperatureIn',
    'pressureIn',
    'temperatureOut',
    'pressureOut',
    'flowRate',
    {
      field: 'status',
      header: 'Approval Status',
      valueFn: (row: any) => row.status,
      valueClassMapper: (row: any) => {
        if (row.status === ProcessStatus.APPROVED) return 'text-success';
        if (row.status === ProcessStatus.SUBMITTED) return 'text-primary';
        if (row.status === ProcessStatus.DRAFT) return 'text-warning';
        if (row.status === ProcessStatus.REJECTED) return 'text-danger';
        return '';
      }
    },
    { field: 'createdAt', type: 'date' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Pipeline Readings',
    icon: 'dashboard',
    keyColumns: this.keyColumns,
    actionButtons: pipelineReadingTableBtns(this),
    reloadActions$: [pipelineReading$],
    fetchParameter: { query: GET_ALL_PIPELINE_READINGS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'readings', data.uid),
      },
    ],
  };
}

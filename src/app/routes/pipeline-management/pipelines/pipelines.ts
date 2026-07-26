import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_PIPELINES } from './pipeline.graphql';
import { pipelineUpsertBtn, pipelineTableBtns, pipeline$ } from './pipeline.form';

@Component({
  selector: 'pipelines',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class Pipelines extends BaseComponent {
  override title = 'Pipelines';
  override subtitle = 'Manage Pipelines';
  override actionButtons: ActionButton[] = [pipelineUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'name',
    'description',
    'status',
    { field: 'spatialLength', header: 'Pipeline Length' },
    { field: 'createdAt', type: 'date' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Pipelines',
    icon: 'natural_gas',
    keyColumns: this.keyColumns,
    actionButtons: pipelineTableBtns(this),
    reloadActions$: [pipeline$],
    fetchParameter: { query: GET_ALL_PIPELINES },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'pipelines', data.uid),
      },
    ],
  };
}

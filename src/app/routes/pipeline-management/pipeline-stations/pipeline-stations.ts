import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_PIPELINE_STATIONS } from './pipeline-station.graphql';
import {
  pipelineStationUpsertBtn,
  pipelineStationTableBtns,
  pipelineStation$,
} from './pipeline-station.form';

@Component({
  selector: 'pipeline-stations',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PipelineStations extends BaseComponent {
  override title = 'Pipeline Stations';
  override subtitle = 'Manage Pipeline Stations';
  override actionButtons: ActionButton[] = [pipelineStationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'name',
    'stationType',
    'description',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Pipeline Stations',
    icon: 'factory',
    keyColumns: this.keyColumns,
    actionButtons: pipelineStationTableBtns(this),
    reloadActions$: [pipelineStation$],
    fetchParameter: { query: GET_ALL_PIPELINE_STATIONS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'pipeline-stations', data.uid),
      },
    ],
  };
}

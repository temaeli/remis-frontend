import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_PIPELINE_STATION_SUCTIONS } from './suction.graphql';
import {
  suctionUpsertBtn,
  suctionTableBtns,
  pipelineStationSuction$,
} from './suction.form';

@Component({
  selector: 'pipeline-station-suctions',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PipelineStationSuctions extends BaseComponent {
  override title = 'Pipeline Station Suctions';
  override subtitle = 'Manage Pipeline Station Suctions';
  override actionButtons: ActionButton[] = [suctionUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'name',
    { field: 'station.name', header: 'Station' },
    'description',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Pipeline Station Suctions',
    icon: 'workflow',
    keyColumns: this.keyColumns,
    actionButtons: suctionTableBtns(this),
    reloadActions$: [pipelineStationSuction$],
    fetchParameter: { query: GET_ALL_PIPELINE_STATION_SUCTIONS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) =>
          navigateRelativeTo(this, 'pipeline-station-suctions', data.uid),
      },
    ],
  };
}

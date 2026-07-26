import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_WORKING_STATIONS } from './working-station.graphql';
import {
  workingStationUpsertBtn,
  workingStationTableBtns,
  workingStation$,
} from './working-station.form';

@Component({
  selector: 'working-stations',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class WorkingStations extends BaseComponent {
  override title = 'Working Stations';
  override subtitle = 'Manage Working Stations';
  override actionButtons: ActionButton[] = [workingStationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'code',
    'name',
    'section',
    'description',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Working Stations',
    icon: 'factory',
    keyColumns: this.keyColumns,
    actionButtons: workingStationTableBtns(this),
    reloadActions$: [workingStation$],
    fetchParameter: { query: GET_ALL_WORKING_STATIONS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'working-stations', data.uid),
      },
    ],
  };
}

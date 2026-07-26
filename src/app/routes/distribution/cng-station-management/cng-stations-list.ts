import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_CNG_STATIONS_PAGEABLE } from '../cng/cng-station.graphql';
import {
  cngStationUpsertBtn,
  cngStationTableBtns,
  cngStation$,
} from '../cng/cng-station.form';

@Component({
  selector: 'cng-stations',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class CngStationsComponent extends BaseComponent {
  override title = 'CNG Stations';
  override subtitle = 'Manage CNG Stations';
  override actionButtons: ActionButton[] = [cngStationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'code', 'name', 'stationType', 'region', 'actions'];

  gridParameter: GridParameter = {
    title: 'CNG Stations',
    icon: 'location_on',
    keyColumns: this.keyColumns,
    actionButtons: cngStationTableBtns(this),
    reloadActions$: [cngStation$],
    fetchParameter: { query: ALL_CNG_STATIONS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'cng-stations', data.uid),
      },
    ],
  };
}

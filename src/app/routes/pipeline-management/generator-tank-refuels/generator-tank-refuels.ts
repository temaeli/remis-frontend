import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { processStatusFromTimestamps } from '@shared/crud';
import { GET_ALL_GENERATOR_TANK_REFUELS } from './tank-refuel.graphql';
import {
  tankRefuelUpsertBtn,
  tankRefuelTableBtns,
  generatorTankRefuel$,
} from './tank-refuel.form';

@Component({
  selector: 'generator-tank-refuels',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class GeneratorTankRefuels extends BaseComponent {
  override title = 'Generator Main Tank Refuels';
  override subtitle = 'Manage Generator Main Tank Refuels';
  override actionButtons: ActionButton[] = [tankRefuelUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'generatorTank.workingStation.name', header: 'Working Station' },
    { field: 'generatorTank.name', header: 'Tank' },
    { field: 'date', type: 'date' },
    { field: 'quantityInLitres', valueFn: (row: any) => Number(row?.quantityInLitres ?? 0).toFixed(2) },
    'newVolume',
    {
      field: 'status',
      header: 'Approval Status',
      valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Generator Main Tank Refuels',
    icon: 'refresh',
    keyColumns: this.keyColumns,
    actionButtons: tankRefuelTableBtns(this),
    reloadActions$: [generatorTankRefuel$],
    fetchParameter: { query: GET_ALL_GENERATOR_TANK_REFUELS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'generator-tank-refuels', data.uid),
      },
    ],
  };
}
